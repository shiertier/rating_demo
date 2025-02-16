import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
    throw new Error('请在环境变量中设置 MONGODB_URI')
}

const uri = process.env.MONGODB_URI
const options = {
    // 添加连接选项
    authSource: 'admin',
    directConnection: true,
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
    // 在开发环境中使用全局变量以防止连接热重载
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
} else {
    // 在生产环境中创建新的连接
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

// 添加连接错误处理
clientPromise.then(() => {
    console.log("MongoDB连接成功");
}).catch(err => {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
});

export default clientPromise