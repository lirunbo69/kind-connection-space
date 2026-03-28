import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, Globe, Layers, ArrowRight, Sparkles, TrendingUp, PenLine, ChevronRight } from "lucide-react";

const LandingPage = ({ onNavigateAuth }: { onNavigateAuth: (tab?: string) => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-mesh-landing overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating glass shapes */}
        <div className="absolute top-[10%] left-[8%] animate-[float3d1_12s_ease-in-out_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-20 h-20 rounded-2xl glass-subtle"
            style={{
              transform: "rotateX(25deg) rotateY(-35deg) rotateZ(5deg)",
              animation: "cubeRotate1 8s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute top-[60%] right-[10%] animate-[float3d2_15s_ease-in-out_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-28 h-28 rounded-3xl glass-subtle"
            style={{
              transform: "rotateX(-20deg) rotateY(30deg) rotateZ(-10deg)",
              animation: "cubeRotate2 10s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute top-[25%] right-[25%] animate-[float3d3_10s_ease-in-out_2s_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-14 h-14 rounded-xl glass-subtle"
            style={{
              transform: "rotateX(15deg) rotateY(25deg) rotateZ(15deg)",
              animation: "cubeRotate3 7s ease-in-out infinite",
            }}
          />
        </div>

        <div className="absolute bottom-[20%] left-[15%] animate-[float3d2_14s_ease-in-out_1s_infinite]" style={{ perspective: "600px" }}>
          <div
            className="w-16 h-16 rounded-2xl glass-subtle"
            style={{
              transform: "rotateX(-30deg) rotateY(-20deg) rotateZ(8deg)",
              animation: "cubeRotate1 9s ease-in-out 0.5s infinite",
            }}
          />
        </div>

        {/* Floating spheres */}
        <div className="absolute top-[15%] right-[40%] w-6 h-6 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-300/20 shadow-lg animate-[float3d3_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[30%] right-[30%] w-4 h-4 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-300/25 shadow-md animate-[float3d1_6s_ease-in-out_1s_infinite]" />
        <div className="absolute top-[70%] left-[35%] w-8 h-8 rounded-full bg-gradient-to-br from-blue-300/25 to-indigo-200/15 shadow-lg animate-[float3d2_11s_ease-in-out_2s_infinite]" />

        {/* Glowing rings */}
        <div className="absolute top-[30%] left-[60%] w-40 h-40 rounded-full border-2 border-purple-300/10 animate-[ringPulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[15%] left-[50%] w-60 h-60 rounded-full border border-blue-200/8 animate-[ringPulse_8s_ease-in-out_2s_infinite]" />

        {/* Large background gradient blobs */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-200/15 -top-40 -right-40 blur-3xl animate-[pulseScale_12s_ease-in-out_infinite]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-200/12 -bottom-32 -left-32 blur-3xl animate-[pulseScale_15s_ease-in-out_3s_infinite]" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle, hsl(250 40% 50%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Navigation */}
      <nav
        className={`relative z-20 flex items-center justify-between px-8 py-5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-primary-foreground font-bold text-lg">Mt</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            Mt <span className="text-primary">ListingAI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground font-medium"
            onClick={() => onNavigateAuth("login")}
          >
            登录
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2 rounded-xl"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-foreground/80">
              <Sparkles className="w-4 h-4 text-primary" />
              AI驱动的跨境电商工具
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              智能生成
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-orange-500">
                高转化Listing
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              AI一键生成专业产品描述，支持多语言多平台，让您的跨境电商业务增长更高效
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 gap-2 text-base px-8 h-13 rounded-xl animate-breathe"
                onClick={() => onNavigateAuth("signup")}
              >
                免费开始使用 <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border/60 text-foreground hover:bg-accent/60 gap-2 text-base px-8 h-13 rounded-xl glass"
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
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 3D product showcase */}
          <div className={`relative transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}>
            <div style={{ perspective: "1200px" }}>
              {/* Main floating dashboard card */}
              <div
                className="relative glass-strong rounded-3xl shadow-2xl p-6"
                style={{
                  transform: "rotateY(-8deg) rotateX(4deg)",
                  animation: "dashboardFloat 6s ease-in-out infinite",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">数据概览</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground px-2 py-1 glass rounded-full">实时更新</span>
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
                      className="glass rounded-xl p-3"
                      style={{ animation: `fadeSlideUp 0.6s ease-out ${stat.delay} both` }}
                    >
                      <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-emerald-500 font-medium">{stat.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="glass rounded-xl p-4 mb-4"
                  style={{ animation: "fadeSlideUp 0.6s ease-out 1.3s both" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-foreground/70">生成趋势</span>
                    <span className="text-[10px] text-muted-foreground">近7天</span>
                  </div>
                  <svg viewBox="0 0 300 80" className="w-full h-16">
                    {[0, 20, 40, 60].map((y) => (
                      <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(230 15% 92%)" strokeWidth="0.5" />
                    ))}
                    <path
                      d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15 L270,80 L0,80 Z"
                      fill="url(#landingChartGrad)"
                      className="animate-[chartDraw_2s_ease-out_1.5s_both]"
                    />
                    <path
                      d="M0,60 C30,55 60,35 90,40 C120,45 150,20 180,25 C210,30 240,10 270,15"
                      fill="none" stroke="hsl(36 90% 52%)" strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray="400" strokeDashoffset="400"
                      style={{ animation: "lineReveal 2s ease-out 1.5s forwards" }}
                    />
                    {[[0, 60], [90, 40], [180, 25], [270, 15]].map(([cx, cy], i) => (
                      <circle key={i} cx={cx} cy={cy} r="3.5" fill="hsl(36 90% 52%)"
                        className="animate-[dotPop_0.3s_ease-out_both]"
                        style={{ animationDelay: `${2.1 + i * 0.15}s` }}
                      />
                    ))}
                    <defs>
                      <linearGradient id="landingChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(36 90% 52%)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="hsl(36 90% 52%)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {["AI优化", "多平台适配", "批量生成", "SEO分析"].map((tag, i) => (
                    <span key={tag}
                      className="px-2.5 py-1 rounded-full glass text-[10px] font-medium text-foreground/70"
                      style={{ animation: `fadeSlideUp 0.5s ease-out ${1.8 + i * 0.1}s both` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating card: conversion */}
              <div
                className="absolute -top-6 -right-6 glass-strong rounded-2xl shadow-xl p-3.5 flex items-center gap-3 z-10"
                style={{
                  animation: "floatBounce 3s ease-in-out infinite, fadeSlideUp 0.6s ease-out 2.2s both",
                  transform: "translateZ(40px)",
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">转化提升</div>
                  <div className="text-base font-bold text-primary">+32%</div>
                </div>
              </div>

              {/* Floating card: AI status */}
              <div
                className="absolute -bottom-5 -left-5 glass-strong rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-10"
                style={{
                  animation: "floatBounce 4s ease-in-out 1s infinite, fadeSlideUp 0.6s ease-out 2.5s both",
                  transform: "translateZ(30px)",
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-primary flex items-center justify-center shadow-md">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground">AI智能生成中</span>
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
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
            { icon: PenLine, title: "智能Listing生成", desc: "AI一键生成高质量产品描述", color: "from-primary to-amber-600" },
            { icon: Layers, title: "批量处理", desc: "高效批量生成，节省时间", color: "from-amber-400 to-primary" },
            { icon: BarChart3, title: "数据分析", desc: "竞品分析与关键词优化", color: "from-orange-400 to-primary" },
            { icon: Globe, title: "多平台适配", desc: "支持主流跨境电商平台", color: "from-primary to-amber-500" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group p-5 rounded-2xl glass hover-lift cursor-pointer"
              style={{ animation: `fadeSlideUp 0.5s ease-out ${2.5 + i * 0.12}s both` }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{f.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
