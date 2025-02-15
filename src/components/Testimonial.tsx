"use client";

// 测试组件
// 用于显示测试内容
// 测试内容包括测试内容

import { useEffect, useState } from "react";
import { getRandomTestimonial } from "@/config/testimonials";

export default function Testimonial() {
    const [testimonial, setTestimonial] = useState("");

    useEffect(() => {
        setTestimonial(getRandomTestimonial());
    }, []);

    return (
        <div className="absolute bottom-10 left-10 hidden md:block">
            <p className="text-white text-4xl font-medium max-w-[600px] text-center">
                &ldquo;让我们一起定义美的标准&rdquo;
            </p>
        </div>
    );
}