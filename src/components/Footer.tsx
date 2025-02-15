// 页脚组件
// 用于显示页脚内容
// 页脚内容包括 Powered by 和 链接
// 链接指向 GitHub 上的 shiertier 账号

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500">
      Powered by <a
        href="https://github.com/shiertier"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-300 transition-colors"
      >
        @shiertier
      </a>
    </footer>
  );
}