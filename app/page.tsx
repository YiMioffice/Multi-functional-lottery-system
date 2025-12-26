'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="relative min-h-screen py-12 overflow-hidden">
      {/* Geometric Decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-bauhaus-yellow border-4 border-bauhaus-black rounded-full -z-10 opacity-20" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-bauhaus-blue border-4 border-bauhaus-black transform rotate-12 -z-10 opacity-20" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-bauhaus-red border-4 border-bauhaus-black transform -rotate-45 -z-10 opacity-20" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-6xl font-black mb-6 uppercase tracking-tighter bauhaus-text-title">
          多功能<span className="text-white bg-bauhaus-black px-2 mx-2 transform -skew-x-12 inline-block">抽奖</span>系统
        </h2>
        <p className="text-bauhaus-black text-xl max-w-2xl mx-auto font-bold border-b-4 border-bauhaus-yellow inline-block pb-1">
          简单 · 可在线使用 · 视觉愉悦
        </p>
      </div>

      <div className="mb-20 flex justify-center gap-6 relative z-10">
        {isLoggedIn ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="bauhaus-button px-10 py-4 text-bauhaus-black font-black text-xl uppercase tracking-widest hover:bg-bauhaus-yellow"
          >
            进入管理面板
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth')}
            className="bauhaus-button-primary px-10 py-4 font-black text-xl uppercase tracking-widest"
          >
            登录 / 注册
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 relative z-10">
        {[
          { href: "/lottery/wheel", title: "转盘抽奖", desc: "支持均匀和不均匀概率，自定义奖项和权重", icon: "🎡", color: "bg-bauhaus-yellow" },
          { href: "/lottery/box", title: "暗箱抽奖", desc: "盲抽模式，支持单次和多次连抽", icon: "📦", color: "bg-bauhaus-red" },
          { href: "/lottery/number", title: "数字抽奖", desc: "设定范围，随机生成中奖数字", icon: "🔢", color: "bg-bauhaus-blue" },
          { href: "/lottery/list", title: "名单抽奖", desc: "上传名单，随机抽取中奖人", icon: "📜", color: "bg-white" }
        ].map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`bauhaus-card p-8 group relative block ${item.color === 'bg-bauhaus-blue' ? 'text-white' : 'text-bauhaus-black'}`}
            style={{ backgroundColor: item.color === 'bg-white' ? '#F9F9F5' : undefined }} // Handle tailwind class vs hex for white
          >
            <div className={`absolute inset-0 ${item.color} opacity-20 z-0`}></div>
            {/* Override background for specific items to create variety or keep consistent white with colored borders? 
                Let's stick to white cards with colored borders or colored cards. 
                The prompt asked for Bauhaus. Primary colors are good.
                Let's make cards white by default but with a colored decoration, OR colored cards.
                Let's try solid colored cards for high impact.
             */}
            <div className={`h-full flex flex-col items-center text-center ${item.color === 'bg-bauhaus-blue' || item.color === 'bg-bauhaus-red' ? 'text-white' : 'text-bauhaus-black'}`}
              style={{ backgroundColor: item.color === 'bg-white' ? '#F9F9F5' : (item.color === 'bg-bauhaus-yellow' ? '#F4CD00' : (item.color === 'bg-bauhaus-red' ? '#E93424' : '#16508D')) }}
            >
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{item.icon}</div>
              <h3 className="text-2xl font-black mb-3 border-b-2 border-current pb-2">{item.title}</h3>
              <p className="font-bold text-sm leading-relaxed opacity-90">{item.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
