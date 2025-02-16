import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { MONGODB_CONFIG } from "@/config/testimonials";

interface ImageDocument {
    _id: number;
    ratings: {
        score: number;
        username: string;
        timestamp: Date;
    }[];
}

interface RatingSubmission {
    [key: number]: number;  // 图片ID: 评分
}

// 修改验证评分是否有效的函数
function isValidScore(score: number): boolean {
    // 修改为允许0分(跳过)
    return Number.isInteger(score) && score >= 0 && score <= 5;
}

export async function POST(request: Request) {
    try {
        // 添加会话检查日志
        const session = await getServerSession(authOptions);
        console.log("当前会话:", session);

        if (!session?.user?.username) {
            console.log("未登录，session:", session);
            return NextResponse.json(
                { error: "未登录" },
                { status: 401 }
            );
        }

        const { username } = session.user;
        console.log("用户名:", username);

        // 解析请求数据
        const ratings: RatingSubmission = await request.json();
        console.log("接收到的评分数据:", ratings);

        if (!ratings || Object.keys(ratings).length === 0) {
            console.log("评分数据为空");
            return NextResponse.json(
                { error: "评分数据为空" },
                { status: 400 }
            );
        }

        // 过滤有效评分
        const validRatings = Object.entries(ratings).filter(([, score]) =>
            isValidScore(score)
        );
        console.log("有效评分数据:", validRatings);

        if (validRatings.length === 0) {
            console.log("没有有效评分");
            return NextResponse.json(
                { error: "没有有效的评分数据" },
                { status: 400 }
            );
        }

        // MongoDB连接
        console.log("开始连接MongoDB...");
        const client = await clientPromise;
        console.log("MongoDB连接成功");

        const db = client.db(MONGODB_CONFIG.IMAGES.DATABASE);
        const collection = db.collection<ImageDocument>(MONGODB_CONFIG.IMAGES.COLLECTION);

        console.log("使用数据库:", MONGODB_CONFIG.IMAGES.DATABASE);
        console.log("使用集合:", MONGODB_CONFIG.IMAGES.COLLECTION);

        // 构建更新操作
        const operations = validRatings.map(([imageId, score]) => {
            const updateOp = {
                updateOne: {
                    filter: { _id: parseInt(imageId) },
                    update: {
                        $push: {
                            ratings: {
                                score,
                                username,
                                timestamp: new Date()
                            }
                        }
                    }
                }
            };
            console.log("构建更新操作:", updateOp);
            return updateOp;
        });

        // 执行批量写入
        console.log("执行批量写入操作...");
        const result = await collection.bulkWrite(operations);
        console.log("批量写入结果:", result);

        return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount,
            totalRatings: validRatings.length
        });

    } catch (error) {
        console.error("提交评分失败:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "提交评分失败" },
            { status: 500 }
        );
    }
}