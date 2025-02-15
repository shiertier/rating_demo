import NextAuth, { AuthOptions } from "next-auth"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"
import { compare } from "bcryptjs"
import { MONGODB_CONFIG, AUTH_CONFIG } from "@/config/testimonials"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

// 定义登录限制相关常量
// const MAX_LOGIN_ATTEMPTS = 5;  // 最大登录尝试次数
// const LOCKOUT_DURATION = 15 * 60 * 1000; // 账户锁定时长：15分钟（毫秒）

const authOptions: AuthOptions = {
  // 使用 MongoDB 适配器存储会话和用户数据
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    // 配置用户名密码登录验证
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        // 连接数据库
        const client = await clientPromise
        const db = client.db(MONGODB_CONFIG.AUTH.DATABASE)
        const usersCollection = db.collection(MONGODB_CONFIG.AUTH.COLLECTIONS.USERS)
        const loginAttemptsCollection = db.collection(MONGODB_CONFIG.AUTH.COLLECTIONS.LOGIN_ATTEMPTS)

        // 查找用户
        const user = await usersCollection.findOne({
          username: credentials?.username
        })

        if (!user) return null

        // 检查用户是否被锁定
        const loginAttempts = await loginAttemptsCollection.findOne({
          username: credentials?.username
        })

        if (loginAttempts) {
          const now = new Date()
          // 如果尝试次数超过限制且在锁定时间内
          if (loginAttempts.attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS &&
            now.getTime() - loginAttempts.lastAttempt.getTime() < AUTH_CONFIG.LOCKOUT_DURATION) {
            // 计算剩余锁定时间
            const remainingTime = Math.ceil(
              (AUTH_CONFIG.LOCKOUT_DURATION - (now.getTime() - loginAttempts.lastAttempt.getTime())) / 60000
            )
            throw new Error(`账户已被锁定，请在 ${remainingTime} 分钟后重试`)
          }

          // 如果超过锁定时间，重置尝试次数
          if (now.getTime() - loginAttempts.lastAttempt.getTime() >= AUTH_CONFIG.LOCKOUT_DURATION) {
            await loginAttemptsCollection.updateOne(
              { username: credentials?.username },
              { $set: { attempts: 0, lastAttempt: now } }
            )
          }
        }

        // 验证密码
        const isValid = await compare(
          credentials?.password || '',
          user.password
        )

        if (!isValid) {
          // 密码错误，更新登录尝试记录
          await loginAttemptsCollection.updateOne(
            { username: credentials?.username },
            {
              $inc: { attempts: 1 },  // 增加尝试次数
              $set: { lastAttempt: new Date() }  // 更新最后尝试时间
            },
            { upsert: true }  // 如果记录不存在则创建
          )

          // 检查是否达到最大尝试次数
          const updatedAttempts = await loginAttemptsCollection.findOne({
            username: credentials?.username
          })

          if (updatedAttempts?.attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
            throw new Error(`登录失败次数过多，账户已被锁定15分钟`)
          }

          return null
        }

        // 登录成功，重置登录尝试记录
        await loginAttemptsCollection.updateOne(
          { username: credentials?.username },
          { $set: { attempts: 0, lastAttempt: new Date() } },
          { upsert: true }
        )

        // 返回用户信息
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email
        }
      }
    }),
    // 配置 Google OAuth 登录
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    // 配置 GitHub OAuth 登录
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  // 配置会话策略为 JWT
  session: {
    strategy: "jwt" as const
  },
  // 自定义登录和错误页面路径
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // 配置回调函数
  callbacks: {
    // JWT 回调：用于自定义 JWT token
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    // Session 回调：用于自定义会话数据
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.username = token.username as string
      }
      return session
    }
  }
}

// 创建 NextAuth 处理器
const handler = NextAuth(authOptions as AuthOptions)

// 导出处理器和配置
export { handler as GET, handler as POST }
export { authOptions }