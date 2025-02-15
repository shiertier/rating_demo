// 基础配置对象，定义了Hugging Face数据集的基础URL
const config = {
  baseUrl: "https://huggingface.co/datasets/picollect/armwm/resolve/main",
};

// 根据ID生成key字符串（用于定位tar文件）
export function getKeyStr(id: number): string {
  return Math.floor(id / 10000).toString().padStart(4, '0');
}

// 从API获取图片信息
export async function getImageInfo(id: number) {
  const response = await fetch(`/api/images/${id}`);
  if (!response.ok) {
    throw new Error(`未找到ID ${id} 的图片信息`);
  }
  return response.json();
}

// 下载指定范围的文件
export async function downloadFileRange(url: string, offset: number, size: number): Promise<Blob> {
  try {
    const response = await fetch(url, {
      headers: {
        Range: `bytes=${offset}-${offset + size - 1}`,
      },
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    return await response.blob();
  } catch (error) {
    throw new Error(`下载文件失败: ${error}`);
  }
}

// 创建一个简单的请求队列系统
// queue: 存储待处理的任务队列
const queue: Array<() => Promise<void>> = [];
// processing: 标识当前是否正在处理队列
let processing = false;
// MAX_CONCURRENT: 最大并发请求数
const MAX_CONCURRENT = 5;
// BATCH_DELAY: 批次处理间的延迟时间（毫秒）
const BATCH_DELAY = 100;
// RETRY_DELAY: 请求失败后的重试延迟时间（毫秒）
const RETRY_DELAY = 500;
// activeRequests: 当前活跃的请求数量
let activeRequests = 0;

/**
 * 处理队列中的任务
 * - 确保同时只有一个处理过程在运行
 * - 控制并发请求数量不超过 MAX_CONCURRENT
 * - 批量处理任务并自动调度下一批
 */
async function processQueue() {
  // 如果正在处理、队列为空或已达到最大并发数，则退出
  if (processing || queue.length === 0 || activeRequests >= MAX_CONCURRENT) return;

  processing = true;
  // 从队列中提取当前批次的任务
  const currentBatch = queue.splice(0, MAX_CONCURRENT - activeRequests);

  // 并行执行当前批次的所有任务
  await Promise.all(currentBatch.map(async (task) => {
    activeRequests++;
    try {
      await task();
    } finally {
      // 确保在任务完成后减少活跃请求计数
      activeRequests--;
    }
  }));

  processing = false;

  // 如果队列中还有任务，延迟处理下一批
  if (queue.length > 0) {
    setTimeout(processQueue, BATCH_DELAY);
  }
}

/**
 * 根据ID获取图片
 * @param id - 图片ID
 * @param signal - 可选的 AbortSignal，用于取消请求
 * @param retryCount - 当前重试次数
 * @returns Promise<string> - 返回图片的 Object URL
 */
export async function fetchHfImageById(id: number, signal?: AbortSignal, retryCount = 0): Promise<string> {
  const maxRetries = 2; // 最大重试次数

  return new Promise((resolve, reject) => {
    const task = async () => {
      try {
        // 从数据库获取图片元数据
        const imageInfo = await getImageInfo(id);

        // 计算图片所在的tar文件名
        const keyStr = getKeyStr(imageInfo.name);

        // 构建完整的tar文件URL
        const tarUrl = `${config.baseUrl}/images/${keyStr}.tar`;

        // 使用范围请求下载指定图片数据
        const imageBlob = await downloadFileRange(tarUrl, imageInfo.offset, imageInfo.size);

        // 创建并返回Blob URL
        resolve(URL.createObjectURL(imageBlob));

      } catch (error) {
        // 处理请求被中止的情况
        if (error instanceof Error && error.name === 'AbortError') {
          reject(error);
          return;
        }

        // 处理重试逻辑
        if (retryCount < maxRetries) {
          console.log(`获取图片 ${id} 失败，${RETRY_DELAY / 1000}秒后重试(${retryCount + 1}/${maxRetries})...`);
          setTimeout(() => {
            queue.push(() => fetchHfImageById(id, signal, retryCount + 1).then(resolve, reject));
            processQueue();
          }, RETRY_DELAY);
        } else {
          reject(error);
        }
      }
    };

    // 将任务添加到队列
    queue.push(task);
    // 如果没有正在处理的任务，启动队列处理
    if (!processing) {
      processQueue();
    }
  });
}