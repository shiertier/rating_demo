import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '注册 | pic rating',
    description: 'pic rating 注册页面',
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}