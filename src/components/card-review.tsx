// 卡片评论组件
// 用于显示评论内容
// 评论内容包括评论者、评论时间、评论内容

import type { ReviewType } from "@/components/review";

import React from "react";
import { cn } from "@heroui/react";

import Review from "@/components/review";

export type CardReviewProps = React.HTMLAttributes<HTMLDivElement> & ReviewType;

const CardReview = React.forwardRef<HTMLDivElement, CardReviewProps>(
  ({ className, ...review }, ref) => (
    <div ref={ref} className={cn("rounded-medium bg-content1 p-5 shadow-small", className)}>
      <Review {...review} />
    </div>
  ),
);

CardReview.displayName = "CardReview";

export default CardReview;
