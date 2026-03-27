import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, Globe, Layers, ArrowRight, Sparkles, TrendingUp, PenLine, ChevronRight } from "lucide-react";

const LandingPage = ({ onNavigateAuth }: { onNavigateAuth: (tab?: string) => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50 overflow-hidden relative">
      {/* Animated 3D background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating 3D cubes */}
        <div className="absolute top-[10%] left-[8%] animate-[float3d1_12s_ease-in-out_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/30 to-yellow-300/20 border border-amber-300/30 backdrop-blur-sm shadow-lg"
            style={{
              transform: "rotateX(25deg) rotateY(-35deg) rotateZ(5deg)",
              animation: "cubeRotate1 8s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute top-[60%] right-[10%] animate-[float3d2_15s_ease-in-out_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-400/25 to-amber-300/15 border border-yellow-300/30 backdrop-blur-sm shadow-xl"
            style={{
              transform: "rotateX(-20deg) rotateY(30deg) rotateZ(-10deg)",
              animation: "cubeRotate2 10s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute top-[25%] right-[25%] animate-[float3d3_10s_ease-in-out_2s_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400/25 to-amber-200/20 border border-orange-200/40 backdrop-blur-sm shadow-md"
            style={{
              transform: "rotateX(15deg) rotateY(25deg) rotateZ(15deg)",
              animation: "cubeRotate3 7s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute bottom-[20%] left-[15%] animate-[float3d2_14s_ease-in-out_1s_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-400/15 border border-yellow-400/25 backdrop-blur-sm shadow-lg"
            style={{
              transform: "rotateX(-30deg) rotateY(-20deg) rotateZ(8deg)",
              animation: "cubeRotate1 9s ease-in-out 0.5s infinite",
            }}
          />
        </div>

        <div className="absolute top-[45%] left-[40%] animate-[float3d1_18s_ease-in-out_3s_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-300/15 border border-amber-300/30 backdrop-blur-sm"
            style={{
              transform: "rotateX(20deg) rotateY(-15deg) rotateZ(-5deg)",
              animation: "cubeRotate2 6s ease-in-out infinite",
            }}
          />
        </div>

        {/* Floating spheres */}
        <div className="absolute top-[15%] right-[40%] w-6 h-6 rounded-full bg-gradient-to-br from-amber-400/40 to-yellow-300/20 shadow-lg animate-[float3d3_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[30%] right-[30%] w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400/50 to-amber-300/30 shadow-md animate-[float3d1_6s_ease-in-out_1s_infinite]" />
        <div className="absolute top-[70%] left-[35%] w-8 h-8 rounded-full bg-gradient-to-br from-orange-300/30 to-amber-200/20 shadow-lg animate-[float3d2_11s_ease-in-out_2s_infinite]" />

        {/* Glowing rings */}
        <div className="absolute top-[30%] left-[60%] w-40 h-40 rounded-full border-2 border-amber-300/15 animate-[ringPulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[15%] left-[50%] w-60 h-60 rounded-full border border-yellow-300/10 animate-[ringPulse_8s_ease-in-out_2s_infinite]" />

        {/* Large background gradient blobs */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-amber-200/15 -top-40 -right-40 blur-3xl animate-[pulseScale_12s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-yellow-200/12 -bottom-32 -left-32 blur-3xl animate-[pulseScale_15s_ease-in-out_3s_infinite]" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Navigation */}
      <nav
        className={`relative z-20 flex items-center justify-between px-8 py-5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <span className="text-white font-bold text-lg">Mt</span>
          </div>
          <span className="text-xl font-bold text-gray-800">
            Mt <span className="text-amber-500">ListingAI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 font-medium"
            onClick={() => onNavigateAuth("login")}
          >
            登录
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-400/30 gap-2"
            onClick={() => onNavigateAuth("signup")}
          >
            免费使用 <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className={`space-y-8 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/70 border border-amber-200/60 text-amber-700 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI驱动的跨境电商工具
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              智能生成
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500">
                高转化Listing
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              AI一键生成专业产品描述，支持多语言多平台，让您的跨境电商业务增长更高效
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-400/30 gap-2 text-base px-8 h-13"
                onClick={() => onNavigateAuth("signup")}
              >
                免费开始使用 <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 gap-2 text-base px-8 h-13"
                onClick={() => onNavigateAuth("login")}
              >
                已有账户登录
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-4">
              {[
                { value: "10,000+", label: "累计生成" },
                { value: "95%", label: "用户好评" },
                { value: "32%", label: "转化提升" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3D product showcase */}
          <div className={`relative transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}>
            <div style={{ perspective: "1200px" }}>
              {/* Main floating dashboard card */}
              <div
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-amber-100/50"
                style={{
                  transform: "rotateY(-8deg) rotateX(4deg)",
                  animation: "dashboardFloat 6s ease-in-out infinite",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">数据概览</span>
                  </div>
                  <span className="text-[10px] text-gray-400 px-2 py-1 bg-gray-50 rounded-full">实时更新</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "今日Listing", value: "128", trend: "+12%", delay: "0.8s" },
                    { label: "转化率", value: "4.8%", trend: "+0.5%", delay: "0.95s" },
                    { label: "总生成数", value: "3,562", trend: "+8%", delay: "1.1s" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-gradient-to-br from-amber-50/80 to-white rounded-xl p-3 border border-amber-100/40"
                      style={{ animation: `fadeSlideUp 0.6s ease-out ${stat.delay} both` }}
                    >
                      <div className="text-[10px] text-gray-400 mb-1">{stat.label}</div>
                      <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                      <div className="text-[10px] text-emerald-500 font-medium">{stat.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-xl p-4 border border-amber-100/30 mb-4"
                  style={{ animation: "fadeSlideUp 0.6s ease-out 1.3s both" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600">生成趋势</span>
                    <span className="text-[10px] text-gray-400">近7天</span>
                  </div>
                  <svg viewBox="0 0 300 80" className="w-full h-16">
                    {[0, 20, 40, 60].map((y) => (
                      <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#f5f5f5" strokeWidth="0.5" />
                    ))}
                    <path
                      d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15 L270,80 L0,80 Z"
                      fill="url(#landingChartGrad)"
                      className="animate-[chartDraw_2s_ease-out_1.5s_both]"
                    />
                    <path
                      d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15"
                      fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray="400" strokeDashoffset="400"
                      style={{ animation: "lineReveal 2s ease-out 1.5s forwards" }}
                    />
                    {[[0, 60], [90, 40], [180, 25], [270, 15]].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="3.5" fill="#f59e0b"
                        className="animate-[dotPop_0.3s_ease-out_both]"
                        style={{ animationDelay: `${2.1 + i * 0.15}s` }}
                      />
                    ))}
                    <defs>
                      <linearGradient id="landingChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {["AI优化", "多平台适配", "批量生成", "SEO分析"].map((tag, i) => (
                    <span key={tag}
                      className="px-2.5 py-1 rounded-full bg-amber-100/60 text-amber-700 text-[10px] font-medium border border-amber-200/40"
                      style={{ animation: `fadeSlideUp 0.5s ease-out ${1.8 + i * 0.1}s both` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating card: conversion */}
              <div
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-3.5 border border-amber-100/50 flex items-center gap-3 z-10"
                style={{
                  animation: "floatBounce 3s ease-in-out infinite, fadeSlideUp 0.6s ease-out 2.2s both",
                  transform: "translateZ(40px)",
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-600">转化提升</div>
                  <div className="text-base font-bold text-amber-600">+32%</div>
                </div>
              </div>

              {/* Floating card: AI status */}
              <div
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-4 py-3 border border-amber-100/50 flex items-center gap-3 z-10"
                style={{
                  animation: "floatBounce 4s ease-in-out 1s infinite, fadeSlideUp 0.6s ease-out 2.5s both",
                  transform: "translateZ(30px)",
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-gray-600">AI智能生成中</span>
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-5 mt-24 transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { icon: PenLine, title: "智能Listing生成", desc: "AI一键生成高质量产品描述", color: "from-amber-400 to-amber-500" },
            { icon: Layers, title: "批量处理", desc: "高效批量生成，节省时间", color: "from-yellow-400 to-amber-400" },
            { icon: BarChart3, title: "数据分析", desc: "竞品分析与关键词优化", color: "from-orange-400 to-amber-500" },
            { icon: Globe, title: "多平台适配", desc: "支持主流跨境电商平台", color: "from-amber-500 to-yellow-500" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber-100/50 hover:bg-white/90 hover:shadow-xl hover:shadow-amber-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              style={{ animation: `fadeSlideUp 0.5s ease-out ${2.5 + i * 0.12}s both` }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-1">{f.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
