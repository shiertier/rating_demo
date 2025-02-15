import "next-auth";

declare module "next-auth" {
    interface Session {
        user?: {
            username?: string;
            email?: string | null;
            image?: string | null;
        };
    }
}