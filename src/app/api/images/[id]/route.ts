import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
// import { Filter } from 'mongodb';  // 暂时注释掉未使用的导入
import { MONGODB_CONFIG } from "@/config/testimonials";

interface ImageInfo {
    _id: number;     // 图片ID
    name: number;    // 图片名称
    offset: number;  // 文件偏移量
    size: number;    // 文件大小
    type: string;    // 文件类型
}

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await context.params;

        // 确保 params 是一个有效对象
        if (!paramId) {
            return NextResponse.json(
                { error: "缺少ID参数" },
                { status: 400 }
            );
        }

        const id = parseInt(paramId);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json(
                { error: "无效的ID，ID必须为正整数" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(MONGODB_CONFIG.IMAGES.DATABASE);
        const collection = db.collection<ImageInfo>(MONGODB_CONFIG.IMAGES.COLLECTION);

        const imageInfo = await collection.findOne(
            { _id: id },
            {
                projection: { _id: 1, name: 1, offset: 1, size: 1, type: 1 },
                maxTimeMS: 5000
            }
        );

        if (!imageInfo) {
            console.log(`未找到ID为 ${id} 的图片`);
            return NextResponse.json(
                { error: "图片不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json(imageInfo);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('获取图片信息失败:', errorMessage);

        return NextResponse.json(
            { error: "获取图片信息失败" },
            { status: 500 }
        );
    }
}