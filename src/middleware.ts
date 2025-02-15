import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 这个函数可以被标记为 `async` 如果使用 `await` 的话
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')

    if (!token && !isAuthPage) {
        // 未登录且不是认证页面，重定向到登录页
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token && isAuthPage) {
        // 已登录但访问认证页面，重定向到首页
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
    matcher: [
        /*
         * 匹配所有路径，除了:
         * - api (API 路由)
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (网站图标)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}