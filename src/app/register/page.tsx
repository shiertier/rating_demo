"use client";

import React from "react";
import { Button, Input, Checkbox, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import TermsModal from "@/components/TermsModal";
import { AcmeIcon } from "@/components/icons/AcmeIcon";
import Testimonial from "@/components/Testimonial";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
    const [error, setError] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [modalType, setModalType] = React.useState<'terms' | 'privacy' | null>(null);

    // 处理客户端渲染
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleModalClose = () => {
        setModalType(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // 基本验证
        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            setIsLoading(false);
            return;
        }

        try {
            // 1. 注册
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "注册失败");
            }

            // 2. 注册成功后直接登录
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            // 3. 登录成功，跳转到首页
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "注册失败");
        } finally {
            setIsLoading(false);
        }
    };

    // 在客户端渲染完成前不显示内容
    if (!mounted) {
        return null;
    }

    return (
        <>
            <div
                className="flex min-h-screen w-full items-center justify-end overflow-hidden bg-content1"
                style={{
                    backgroundImage: "url(https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/black-background-texture.jpeg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed"
                }}
            >
                {/* Brand Logo */}
                <div className="absolute left-10 top-10">
                    <div className="flex items-center gap-2">
                        <AcmeIcon className="text-white" size={40} />
                        <p className="font-medium text-white">ACME</p>
                    </div>
                </div>

                {/* Testimonial */}
                <Testimonial />

                {/* Register Form */}
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small mr-[2%]">
                    <p className="pb-2 text-xl font-medium">注册</p>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <Input
                            isRequired
                            label="用户名"
                            name="username"
                            placeholder="请输入用户名"
                            type="text"
                            variant="bordered"
                        />
                        <Input
                            label="邮箱"
                            name="email"
                            placeholder="请输入邮箱（可选）"
                            type="email"
                            variant="bordered"
                        />
                        <Input
                            isRequired
                            endContent={
                                <button type="button" onClick={() => setIsVisible(!isVisible)}>
                                    {isVisible ? (
                                        <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                                    ) : (
                                        <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                                    )}
                                </button>
                            }
                            label="密码"
                            name="password"
                            placeholder="请输入密码"
                            type={isVisible ? "text" : "password"}
                            variant="bordered"
                        />
                        <Input
                            isRequired
                            endContent={
                                <button type="button" onClick={() => setIsConfirmVisible(!isConfirmVisible)}>
                                    {isConfirmVisible ? (
                                        <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                                    ) : (
                                        <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                                    )}
                                </button>
                            }
                            label="确认密码"
                            name="confirmPassword"
                            placeholder="请再次输入密码"
                            type={isConfirmVisible ? "text" : "password"}
                            variant="bordered"
                        />
                        <div className="flex flex-col gap-2 py-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    isRequired
                                    size="sm"
                                />
                                <div className="text-sm flex items-center">
                                    我同意
                                    <button
                                        type="button"
                                        className="mx-1 text-primary hover:underline focus:outline-none"
                                        onClick={() => setModalType('terms')}
                                    >
                                        服务条款
                                    </button>
                                    和
                                    <button
                                        type="button"
                                        className="mx-1 text-primary hover:underline focus:outline-none"
                                        onClick={() => setModalType('privacy')}
                                    >
                                        隐私政策
                                    </button>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        <Button color="primary" type="submit" isLoading={isLoading}>
                            {isLoading ? "注册中..." : "注册"}
                        </Button>
                    </form>
                    <p className="text-center text-small">
                        已有账号？
                        <Link href="/login" size="sm" className="ml-1">登录</Link>
                    </p>
                </div>
            </div>

            <TermsModal
                isOpen={modalType !== null}
                onClose={handleModalClose}
                type={modalType || 'terms'}
            />
        </>
    );
}