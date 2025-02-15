"use client";

// 图片评分器基础组件
// 用于显示图片评分器
// 评分器包括图片ID、当前索引、评分、悬停评分、评分记录、图片缓存、加载状态、加载进度、提交状态、错误信息

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Icon } from "@iconify/react";
import { CircularProgress, Progress, Button, Image } from "@heroui/react";
import { fetchHfImageById } from "@/utils/imageUtils";
import { RatingHelpModal } from "./RatingHelpModal";

interface ImageRaterBaseProps {
  onComplete?: () => void;
}

type State = {
  imageIds: number[];
  currentIndex: number;
  rating: number;
  hoveredRating: number;
  ratings: Record<number, number>;
  imageCache: Record<number, string>;
  loading: boolean;
  loadProgress: number;
  isSubmitting: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_IMAGE_IDS'; payload: number[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'SET_HOVERED_RATING'; payload: number }
  | { type: 'ADD_RATING'; payload: { id: number; rating: number } }
  | { type: 'ADD_TO_CACHE'; payload: { id: number; url: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOAD_PROGRESS'; payload: number }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_RATINGS' };

const initialState: State = {
  imageIds: [],
  currentIndex: 0,
  rating: 0,
  hoveredRating: 0,
  ratings: {},
  imageCache: {},
  loading: true,
  loadProgress: 0,
  isSubmitting: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_IMAGE_IDS':
      return { ...state, imageIds: action.payload };
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_RATING':
      return { ...state, rating: action.payload };
    case 'SET_HOVERED_RATING':
      return { ...state, hoveredRating: action.payload };
    case 'ADD_RATING':
      return {
        ...state,
        ratings: { ...state.ratings, [action.payload.id]: action.payload.rating }
      };
    case 'ADD_TO_CACHE':
      return {
        ...state,
        imageCache: { ...state.imageCache, [action.payload.id]: action.payload.url }
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LOAD_PROGRESS':
      return { ...state, loadProgress: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_RATINGS':
      return {
        ...state,
        rating: 0,
        hoveredRating: 0,
        ratings: {},
        error: null
      };
    default:
      return state;
  }
}

export default function ImageRaterBase({ onComplete }: ImageRaterBaseProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 添加窗口尺寸状态
  const [aspectRatio, setAspectRatio] = useState('1344/768');

  // 使用 ref 来追踪是否已经加载过
  const isLoadingRef = useRef(false);

  // 新增帮助弹窗状态
  const [showHelpModal, setShowHelpModal] = useState(false);
  const isFirstVisit = useRef(true);

  // 首次访问时显示帮助弹窗
  useEffect(() => {
    if (isFirstVisit.current) {
      setShowHelpModal(true);
      isFirstVisit.current = false;
    }
  }, []);

  // 处理窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth <= 768 ? '768/1024' : '1344/768');
    };

    // 初始设置
    handleResize();

    // 添加事件监听
    window.addEventListener('resize', handleResize);

    // 清理
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 获取并加载图片
  const loadImages = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOAD_PROGRESS', payload: 0 });

    const abortController = new AbortController();

    try {
      // 1. 获取随机图片
      const response = await fetch('/api/images/random');
      const images = await response.json();
      console.log('获取到的图片信息:', images);

      if (!Array.isArray(images)) {
        throw new Error('获取图片失败');
      }

      const imageIds = images.map(img => img.id);
      console.log('提取的图片ID:', imageIds);

      dispatch({ type: 'SET_IMAGE_IDS', payload: imageIds });
      dispatch({ type: 'SET_CURRENT_INDEX', payload: 0 });

      // 2. 使用滑动窗口预加载图片
      let completedCount = 0;
      const totalImages = imageIds.length;
      const MAX_CONCURRENT = 5; // 最大并发数
      const failedIds: number[] = [];

      // 分批处理图片
      for (let i = 0; i < imageIds.length; i += MAX_CONCURRENT) {
        const batch = imageIds.slice(i, i + MAX_CONCURRENT);
        console.log(`开始加载第 ${i / MAX_CONCURRENT + 1} 批图片:`, batch);

        const batchPromises = batch.map(async (id) => {
          try {
            console.log(`开始加载图片 ${id}`);
            const blobUrl = await fetchHfImageById(id, abortController.signal);
            console.log(`图片 ${id} 加载完成:`, blobUrl);

            completedCount++;
            dispatch({ type: 'SET_LOAD_PROGRESS', payload: Math.round((completedCount / totalImages) * 100) });

            if (blobUrl) {
              dispatch({ type: 'ADD_TO_CACHE', payload: { id, url: blobUrl } });
              return [id, blobUrl] as const;
            }
            failedIds.push(id);
            return [id, null] as const;
          } catch (error) {
            console.error(`加载图片 ${id} 失败:`, error);
            failedIds.push(id);
            return [id, null] as const;
          }
        });

        await Promise.all(batchPromises);
      }

      // 移除加载失败的图片ID
      if (failedIds.length > 0) {
        console.log('加载失败的图片ID:', failedIds);
        dispatch({ type: 'SET_IMAGE_IDS', payload: imageIds.filter(id => !failedIds.includes(id)) });
      }

    } catch (error) {
      console.error('整体加载失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '加载图片失败，请重试' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      isLoadingRef.current = false;
    }

    return () => abortController.abort();
  }, []);

  // 初始加载
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 提交评分时重置标志并重新加载
  const handleSubmit = useCallback(async () => {
    if (state.isSubmitting) return;

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      // 准备评分数据
      const ratingData = Object.entries(state.ratings).reduce((acc, [id, score]) => ({
        ...acc,
        [id]: score
      }), {});

      // 发送评分数据
      const response = await fetch('/api/ratings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '提交失败');
      }

      // 重置评分并加载新图片
      dispatch({ type: 'RESET_RATINGS' });
      isLoadingRef.current = false;  // 重置标志以允许重新加载
      await loadImages();
    } catch (error) {
      console.error('提交评分失败:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : '提交评分失败，请重试' });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [loadImages, state.isSubmitting, state.ratings]);

  // 先声明 handleImageChange
  const handleImageChange = useCallback((newIndex: number) => {
    const { currentIndex, imageIds, ratings } = stateRef.current;
    const currentId = imageIds[currentIndex];

    if (!ratings[currentId]) {
      dispatch({ type: 'ADD_RATING', payload: { id: currentId, rating: 0 } });
    }

    dispatch({ type: 'SET_CURRENT_INDEX', payload: newIndex });
    dispatch({ type: 'SET_RATING', payload: ratings[imageIds[newIndex]] || 0 });
  }, []);

  // 然后声明 handleRate
  const handleRate = useCallback((star: number) => {
    const currentId = stateRef.current.imageIds[stateRef.current.currentIndex];
    const currentRating = stateRef.current.ratings[currentId];

    // 如果已经有评分且点击相同分数，则重置为0
    if (currentRating === star) {
      dispatch({ type: 'SET_RATING', payload: 0 });
      dispatch({ type: 'ADD_RATING', payload: { id: currentId, rating: 0 } });
      return;
    }

    // 正常评分流程
    dispatch({ type: 'SET_RATING', payload: star });
    dispatch({ type: 'ADD_RATING', payload: { id: currentId, rating: star } });

    // 延迟自动切换到下一张
    setTimeout(() => {
      if (stateRef.current.currentIndex < stateRef.current.imageIds.length - 1) {
        handleImageChange(stateRef.current.currentIndex + 1);
      } else {
        onComplete?.();
      }
    }, 300);
  }, [handleImageChange, onComplete]);

  // 修改键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { currentIndex, imageIds, ratings, isSubmitting } = stateRef.current;
      const currentId = imageIds[currentIndex];
      const currentRating = ratings[currentId];

      switch (event.key) {
        case 'Enter':
          if (Object.keys(ratings).length > 0 && !isSubmitting) {
            handleSubmit();
          }
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            handleImageChange(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < imageIds.length - 1) {
            handleImageChange(currentIndex + 1);
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          const rating = parseInt(event.key);
          // 如果已经有评分且按下相同数字，则重置为0
          if (currentRating === rating) {
            handleRate(0);
          } else {
            handleRate(rating);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRate, handleSubmit, handleImageChange]);

  // 计算评分进度
  const ratingProgress = (Object.keys(state.ratings).length / state.imageIds.length) * 100 || 0;

  return (
    <div className="flex flex-col items-center gap-4 [&_*]:focus:outline-none [&_*]:focus:ring-0 pt-4 w-full" onMouseDown={(e) => e.preventDefault()}>
      {/* Progress bar */}
      <div className="w-full max-w-[1344px] mx-auto px-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>评分进度</span>
          <span>{Object.keys(state.ratings).length} / {state.imageIds.length}</span>
        </div>
        <Progress
          aria-label="Rating Progress"
          className="w-full"
          color="success"
          showValueLabel={true}
          size="md"
          value={ratingProgress}
        />
      </div>

      {/* Image container */}
      <div className="w-full max-w-[1344px] mx-auto px-4">
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio,
            maxWidth: '1344px'
          }}
        >
          <Button
            isIconOnly
            variant="light"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            onClick={() => state.currentIndex > 0 && handleImageChange(state.currentIndex - 1)}
            isDisabled={state.currentIndex === 0}
          >
            <Icon icon="solar:arrow-left-linear" className="w-6 h-6" />
          </Button>

          <Button
            isIconOnly
            variant="light"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
            onClick={() => state.currentIndex < state.imageIds.length - 1 && handleImageChange(state.currentIndex + 1)}
            isDisabled={state.currentIndex === state.imageIds.length - 1}
          >
            <Icon icon="solar:arrow-right-linear" className="w-6 h-6" />
          </Button>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full p-0.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg select-none" tabIndex={-1}>
              <div className="w-full h-full pointer-events-none flex items-center justify-center">
                {!state.imageCache[state.imageIds[state.currentIndex]] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-4">
                    <CircularProgress
                      aria-label="加载中..."
                      color="warning"
                      showValueLabel={true}
                      size="lg"
                      value={state.loadProgress}
                    />
                    <div className="text-lg text-gray-500">
                      正在加载图片 ({state.loadProgress}%)
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={state.imageCache[state.imageIds[state.currentIndex]]}
                      alt={`图片 ${state.imageIds[state.currentIndex]}`}
                      className="max-w-full max-h-full object-contain"
                      width={1344}
                      height={768}
                      radius="none"
                      loading="eager"
                      disableSkeleton={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating controls */}
      <div className="w-full max-w-[1344px] mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  isIconOnly
                  variant="light"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => dispatch({ type: 'SET_HOVERED_RATING', payload: star })}
                  onMouseLeave={() => dispatch({ type: 'SET_HOVERED_RATING', payload: 0 })}
                  onClick={() => handleRate(star)}
                >
                  <Icon
                    icon="solar:star-bold"
                    className={`w-8 h-8 transition-colors ${star <= (state.hoveredRating || state.rating)
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                      }`}
                  />
                </Button>
              ))}
            </div>
            <Button
              isIconOnly
              variant="light"
              className="p-1"
              onClick={() => setShowHelpModal(true)}
            >
              <Icon icon="solar:question-circle-bold" className="w-6 h-6" />
            </Button>
          </div>

          {state.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>← 上一张</span>
            <span>→ 下一张</span>
            <span>1-5 评分</span>
            <span>Enter 提交</span>
          </div>

          <Button
            color="primary"
            className="px-8"
            onClick={handleSubmit}
            isDisabled={Object.keys(state.ratings).length === 0 || state.isSubmitting}
          >
            {state.isSubmitting ? "提交中..." : "提交评分并继续 (Enter)"}
          </Button>
        </div>
      </div>

      <RatingHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}