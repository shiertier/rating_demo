"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ImageRaterBase from "@/components/ImageRaterBase";
import Footer from "@/components/Footer";
import ThemeSwitch from "@/components/ThemeSwitch";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleComplete = () => {
    console.log('所有图片评分完成！');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeSwitch />
      <main className="flex-grow pt-8">
        <ImageRaterBase onComplete={handleComplete} />
      </main>
      <Footer />
    </div>
  );
}
