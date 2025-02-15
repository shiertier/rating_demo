import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 | pic rating',
  description: 'pic rating 登录页面',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 