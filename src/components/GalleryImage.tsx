// 画廊图片组件
// 用于显示图片
// 图片包括图片ID、图片宽度、图片高度、图片类名、图片圆角类名、图片加载错误回调函数

"use client";

import BaseImageFetcher from './BaseImageFetcher';

interface GalleryImageProps {
  imageId: number;
  onError?: (error: string) => void;
}

export default function GalleryImage({ imageId, onError }: GalleryImageProps) {
  return (
    <div className="group relative">
      <BaseImageFetcher
        imageId={imageId}
        width={210}
        className="w-full"
        roundedClassName="rounded-xl"
        imageClassName="transition-transform duration-200 group-hover:scale-105 [filter:brightness(0.96)]"
        onError={onError}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl" />
    </div>
  );
}