"use client";

// 图片加载器
// 用于在图片加载时显示加载动画
// 当图片加载失败时显示错误信息
// 当图片加载成功时显示图片
// 当图片加载时显示加载动画
// 当图片加载失败时显示错误信息
// 当图片加载成功时显示图片

import { useState, useEffect } from "react";
import { fetchHfImageById } from "@/utils/imageUtils";
import { Image, Spinner } from "@heroui/react";

interface BaseImageFetcherProps {
  imageId: number;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  roundedClassName?: string;
  onLoad?: (url: string) => void;
  onError?: (error: string) => void;
}

export default function BaseImageFetcher({
  imageId,
  width,
  height,
  className = "",
  imageClassName = "",
  roundedClassName = "rounded-lg",
  onLoad,
  onError
}: BaseImageFetcherProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const currentImageUrl = imageUrl; // 捕获当前值

    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        if (currentImageUrl) {
          URL.revokeObjectURL(currentImageUrl);
          setImageUrl(null);
        }

        const newImageUrl = await fetchHfImageById(imageId, abortController.signal);
        if (isMounted) {
          setImageUrl(newImageUrl);
          onLoad?.(newImageUrl);
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          const errorMessage = err instanceof Error ? err.message : '获取图片失败';
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      abortController.abort();
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [imageId, onLoad, onError, imageUrl]);

  return (
    <div className={`relative ${className} ${roundedClassName} overflow-hidden bg-gray-100 dark:bg-gray-800`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`Image ${imageId}`}
          className={`w-full h-auto object-cover ${imageClassName}`}
          width={width}
          height={height}
          style={{ aspectRatio: height && width ? `${width}/${height}` : 'auto' }}
          loading="lazy"
          onError={() => {
            const errorMessage = "图片加载失败";
            setError(errorMessage);
            onError?.(errorMessage);
          }}
        />
      ) : loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : error ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-red-500 text-sm p-2 text-center">{error}</div>
        </div>
      ) : null}
    </div>
  );
}