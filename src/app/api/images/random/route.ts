import { NextResponse } from "next/server";
import { getRandomImages } from "@/lib/getRandomImages";
import { MONGODB_CONFIG } from "@/config/testimonials";

export async function GET() {
    try {
        // const MAX_IMAGES = 50;

        // if (requestCount > MAX_IMAGES) {
        //     return NextResponse.json(
        //         { error: "请求图片数量超过限制" },
        //         { status: 400 }
        //     );
        // }

        const images = await getRandomImages(MONGODB_CONFIG.IMAGES.RANDOM_COUNT);

        if (!images || images.length === 0) {
            return NextResponse.json(
                { error: "未找到图片" },
                { status: 404 }
            );
        }

        return NextResponse.json(images);
    } catch (error) {
        console.error("获取随机图片失败:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "获取图片失败" },
            { status: 500 }
        );
    }
}