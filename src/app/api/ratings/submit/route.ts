import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MONGODB_CONFIG } from "@/config/testimonials";

interface ImageDocument {
    name: number;
    ratings: {
        score: number;
        username: string;
        timestamp: Date;
    }[];
}

interface RatingSubmission {
    [key: number]: number;  // 图片ID: 评分
}

// 验证评分是否有效
function isValidScore(score: number): boolean {
    return Number.isInteger(score) && score >= 1 && score <= 5;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.username) {
            return NextResponse.json(
                { error: "未登录" },
                { status: 401 }
            );
        }

        const { username } = session.user;

        const ratings: RatingSubmission = await request.json();
        if (!ratings || Object.keys(ratings).length === 0) {
            return NextResponse.json(
                { error: "评分数据为空" },
                { status: 400 }
            );
        }

        // 过滤出有效的评分（1-5分）
        const validRatings = Object.entries(ratings).filter(([_, score]) =>
            isValidScore(score)
        );

        if (validRatings.length === 0) {
            return NextResponse.json(
                { error: "没有有效的评分数据" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db(MONGODB_CONFIG.IMAGES.DATABASE);
        const collection = db.collection<ImageDocument>(MONGODB_CONFIG.IMAGES.COLLECTION);

        // 只处理有效评分
        const operations = validRatings.map(([imageId, score]) => ({
            updateOne: {
                filter: { name: parseInt(imageId) },
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
        }));

        const result = await collection.bulkWrite(operations);

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