"use client";

import React from "react";
import { Button, Input, Checkbox, Link, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { AcmeIcon } from "@/components/icons/AcmeIcon";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Testimonial from "@/components/Testimonial";
import ErrorModal from "@/components/ErrorModal";

// 定义 Google 账户类型
interface GoogleAccount {
  oauth2: {
    initTokenClient: (config: GoogleTokenConfig) => void;
  };
}

interface GoogleTokenConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
}

interface GoogleTokenResponse {
  access_token: string;
}

declare global {
  interface Window {
    google: {
      accounts: GoogleAccount;
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // 处理客户端渲染
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      setMounted(true);
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        // 检查是否是登录限制错误
        if (result.error.includes("登录限制")) {
          setErrorMessage(result.error);
        } else {
          setErrorMessage("用户名或密码错误");
        }
        setIsErrorModalOpen(true);
      } else {
        // 登录成功，跳转到首页
        router.push("/");
      }
    } catch (err) {
      // 使用错误
      const errorMsg = err instanceof Error ? err.message : "登录失败";
      setErrorMessage(errorMsg);
      setIsErrorModalOpen(true);
    }
  };

  // 检查URL中是否有访问令牌
  React.useEffect(() => {
    if (!mounted) return;

    const hash = window.location.hash;
    if (hash) {
      const accessToken = new URLSearchParams(hash.substring(1)).get("access_token");
      if (accessToken) {
        console.log("Got access token:", accessToken);
        // TODO: 处理登录成功，可以存储token并跳转
      }
    }
  }, [mounted]);

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
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

        {/* Login Form */}
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small mr-[2%]">
          <p className="pb-2 text-xl font-medium">登录</p>
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
              isRequired
              endContent={
                <button type="button" onClick={toggleVisibility}>
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
            <div className="flex items-center justify-between px-1 py-2">
              <Checkbox defaultSelected size="sm">记住我</Checkbox>
              <Link href="#" size="sm">忘记密码?</Link>
            </div>
            <Button color="primary" type="submit">
              登录
            </Button>
          </form>
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">或</p>
            <Divider className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
              isDisabled
              className="opacity-50 cursor-not-allowed"
            >
              使用Google账号继续 (即将上线)
            </Button>
            <Button
              startContent={<Icon className="text-default-500" icon="fe:github" width={24} />}
              variant="bordered"
              isDisabled
              className="opacity-50 cursor-not-allowed"
            >
              使用Github账号继续 (即将上线)
            </Button>
          </div>
          <p className="text-center text-small">
            还没有账号?&nbsp;
            <Link href="/register" size="sm">注册</Link>
          </p>
        </div>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        message={errorMessage}
      />
    </>
  );
}