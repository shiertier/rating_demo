import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import { MONGODB_CONFIG } from "@/config/testimonials"

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码为必填项" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db(MONGODB_CONFIG.AUTH.DATABASE)

    // 检查用户名是否已存在
    const existingUser = await db
      .collection(MONGODB_CONFIG.AUTH.COLLECTIONS.USERS)
      .findOne({ username })

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已存在" },
        { status: 400 }
      )
    }

    // 创建新用户
    const hashedPassword = await hash(password, 12)

    await db.collection(MONGODB_CONFIG.AUTH.COLLECTIONS.USERS).insertOne({
      username,
      email: email || null,  // 如果没有提供邮箱则存储 null
      password: hashedPassword,
      createdAt: new Date()
    })

    return NextResponse.json(
      { message: "注册成功" },
      { status: 201 }
    )
  } catch (error) {
    console.error("注册失败:", error)
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    )
  }
}