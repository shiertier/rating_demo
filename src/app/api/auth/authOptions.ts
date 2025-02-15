import { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { MONGODB_CONFIG } from "@/config/testimonials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "用户名", type: "text" },
                password: { label: "密码", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("请输入用户名和密码");
                }

                const client = await clientPromise;
                const db = client.db(MONGODB_CONFIG.AUTH.DATABASE);
                const usersCollection = db.collection(MONGODB_CONFIG.AUTH.COLLECTIONS.USERS);

                const user = await usersCollection.findOne({
                    username: credentials.username
                });

                if (!user) {
                    throw new Error("用户名或密码错误");
                }

                const isValid = await compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) {
                    throw new Error("用户名或密码错误");
                }

                return {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.username = token.username as string;
            }
            return session;
        }
    }
};