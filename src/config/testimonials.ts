export const testimonials = [
    "欢迎加入我们的图片评分项目，您的参与将帮助我们建立更好的审美数据集。",
    "每一次评分都是对美的探索，感谢您为数据集的构建贡献力量。",
    "让我们一起定义美的标准，您的观点对我们来说非常重要。",
    "通过评分，我们共同构建开放的审美数据集，推动计算机视觉的发展。",
    "感谢您参与这个开源项目，您的每一次评分都在帮助AI理解人类的审美。"
];

export function getRandomTestimonial(): string {
    return testimonials[Math.floor(Math.random() * testimonials.length)];
}

export const MONGODB_CONFIG = {
    // 图片相关数据库配置
    IMAGES: {
        DATABASE: 'armwm',
        COLLECTION: 'ratings',
        RANDOM_COUNT: 25,  // 随机获取图片的数量
        MAX_ID: 1991911  // 图片ID的最大值
    },
    // 用户认证相关数据库配置
    AUTH: {
        DATABASE: 'nextauth',
        COLLECTIONS: {
            USERS: 'users',
            LOGIN_ATTEMPTS: 'loginAttempts'
        }
    }
};

// 认证相关配置
export const AUTH_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15分钟（毫秒）
};