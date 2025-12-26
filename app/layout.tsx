import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "多功能抽奖系统",
  description: "轻量化多功能抽奖系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-bauhaus-black antialiased selection:bg-bauhaus-yellow selection:text-bauhaus-black">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-bauhaus-white border-b-4 border-bauhaus-black h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-black uppercase tracking-tighter hover:text-bauhaus-red transition-colors bauhaus-text-title">
                多功能抽奖系统
              </a>
            </div>
            <div className="hidden sm:flex sm:space-x-4 border-l-2 border-bauhaus-black pl-8">
              <a
                href="/"
                className="text-bauhaus-black hover:bg-bauhaus-yellow hover:text-bauhaus-black px-4 py-2 border-2 border-transparent hover:border-bauhaus-black font-bold transition-all"
              >
                首页
              </a>
              <a
                href="/dashboard"
                className="text-bauhaus-black hover:bg-bauhaus-blue hover:text-white px-4 py-2 border-2 border-transparent hover:border-bauhaus-black font-bold transition-all"
              >
                管理面板
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="/auth"
              className="bauhaus-button px-6 py-2 text-sm uppercase tracking-wide hover:bg-bauhaus-red hover:text-white"
            >
              登录
            </a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
