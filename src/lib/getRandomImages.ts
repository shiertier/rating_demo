import clientPromise from "@/lib/mongodb";
import { Filter } from 'mongodb';
import { MONGODB_CONFIG } from "@/config/testimonials";

export async function getRandomImages(count: number = MONGODB_CONFIG.IMAGES.RANDOM_COUNT) {
    // 生成1到MAX_ID之间的随机数组
    const randomIds = Array.from({ length: count }, () =>
        Math.floor(Math.random() * MONGODB_CONFIG.IMAGES.MAX_ID) + 1
    );

    console.log('生成的随机ID:', randomIds); // 添加日志

    const client = await clientPromise;
    const db = client.db(MONGODB_CONFIG.IMAGES.DATABASE);
    const collection = db.collection<{
        _id: number;
        name: number;
        offset: number;
        size: number;
        type: string;
    }>(MONGODB_CONFIG.IMAGES.COLLECTION);

    // 从数据库获取对应的图片信息
    const images = await collection.find(
        { _id: { $in: randomIds } } as Filter<{ _id: number }>,
        { projection: { _id: 1, name: 1, offset: 1, size: 1, type: 1 } }
    ).toArray();

    console.log('获取到的图片信息:', images.map(img => img._id)); // 添加日志

    return images.map(img => ({
        id: img._id,
        name: img.name,
        offset: img.offset,
        size: img.size,
        type: img.type
    }));
}