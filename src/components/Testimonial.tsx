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
            <p className="max-w-xl text-white/60">
                <span className="font-medium">"</span>
                {testimonial}
                <span className="font-medium">"</span>
            </p>
        </div>
    );
}