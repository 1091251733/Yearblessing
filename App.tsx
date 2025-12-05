import React, { useState, useRef, useEffect } from "react";
import { AppStage, Blessing } from "./types";
import { ASSETS, BLESSINGS } from "./constants";
import ParticleBackground from "./components/ParticleBackground";
import MusicControl from "./components/MusicControl";

// Augment window for html2canvas
declare global {
  interface Window {
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const [saving, setSaving] = useState(false); // 新增状态
  const [stage, setStage] = useState<AppStage>(AppStage.SPLASH);
  const [userName, setUserName] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<Blessing | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [showFlash, setShowFlash] = useState(false);
  const shakeAudioRef = useRef<HTMLAudioElement | null>(null);

  // -- Components --

  // Pure CSS Lantern Component
  const Lantern = ({
    className = "",
    delay = "0s",
  }: {
    className?: string;
    delay?: string;
  }) => (
    <div
      className={`relative flex flex-col items-center ${className} animate-float`}
      style={{ animationDelay: delay }}
    >
      {/* Rope */}
      <div className="w-1 h-12 bg-yellow-600"></div>
      {/* Top Cap */}
      <div className="w-16 h-4 bg-yellow-700 rounded-t-lg"></div>
      {/* Body */}
      <div className="w-24 h-20 bg-gradient-to-b from-red-600 to-red-800 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center relative overflow-hidden border-2 border-red-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,0,0.2)_0%,transparent_70%)]"></div>
        <span className="text-yellow-400 font-serif font-bold text-2xl drop-shadow-md">
          福
        </span>
      </div>
      {/* Bottom Cap */}
      <div className="w-16 h-4 bg-yellow-700 rounded-b-lg"></div>
      {/* Tassels */}
      <div className="flex justify-center gap-1">
        <div className="w-1 h-16 bg-red-600"></div>
        <div className="w-1 h-16 bg-red-600"></div>
        <div className="w-1 h-16 bg-red-600"></div>
      </div>
    </div>
  );

  // -- Handlers --

  const handleStart = () => setStage(AppStage.INPUT_NAME);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) setStage(AppStage.SHAKE);
  };

  const handleShake = () => {
    if (isShaking) return;
    setIsShaking(true);

    // Play sound
    if (shakeAudioRef.current) {
      shakeAudioRef.current.currentTime = 0;
      shakeAudioRef.current
        .play()
        .catch((e) => console.log("Sound play failed", e));
    }

    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

    setTimeout(() => {
      const randomBlessing =
        BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
      setResult(randomBlessing);
      setIsShaking(false);
      setShowFlash(true); // White flash effect
      setStage(AppStage.RESULT);
      setTimeout(() => setShowFlash(false), 500);
    }, 2000);
  };
  const handleShare = async () => {
    if (!resultCardRef.current || !window.html2canvas) return;

    setSaving(true); // 开始保存 → 显示“保存中…”
    if (saving) {
      return alert("新年祝福保存中，请稍后再试");
    }
    try {
      // 关键优化点 1：手机用 scale: 2（足够清晰），或动态判断
      const scale = window.devicePixelRatio >= 2 ? 2 : 1.5;

      // 关键优化点 2：加个最小延迟，避免 UI 假死
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await window.html2canvas(resultCardRef.current, {
        scale, // 降到 2 就很清晰了
        backgroundColor: null,
        logging: false,
        useCORS: true,
        // 关键优化点 3：允许污染画布（如果图片都是同源或已设置 crossOrigin）
        allowTaint: false,
        // 关键优化点 4：关闭不必要的特性
        removeContainer: true,
        // 关键优化点 5：移动端强制使用更快的渲染路径
        foreignObjectRendering: false,
        // 关键优化点 6：限制画布最大尺寸（防止爆内存）
        width: resultCardRef.current.offsetWidth,
        height: resultCardRef.current.offsetHeight,
      });

      // 转成 blob 比 dataURL 更快更省内存
      canvas.toBlob((blob) => {
        if (!blob) return;

        // 移动端优先用 Web Share API（原生分享）
        if (
          navigator.share &&
          navigator.canShare?.({
            files: [new File([blob], "blessing.png", { type: "image/png" })],
          })
        ) {
          navigator
            .share({
              files: [
                new File([blob], "新年祝福-2026.png", { type: "image/png" }),
              ],
              title: "2026 新年祝福",
            })
            .catch(() => fallbackDownload(blob));
        } else {
          fallbackDownload(blob);
        }
      }, "image/png");

      // 下载回退方案
      function fallbackDownload(blob: Blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `新年祝福-2025.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error(err);
      alert("保存失败，请长按卡片手动截图哦~");
    } finally {
      // 关键：一定恢复按钮文字
      setTimeout(() => setSaving(false), 800); // 给用户一点成功反馈
    }
  };
  const reset = () => {
    setStage(AppStage.SPLASH);
    setUserName("");
    setResult(null);
  };

  // -- Renderers --

  const renderSplash = () => (
    <div className="flex flex-col items-center justify-center h-full w-full animate-fade-in relative px-4">
      {/* Decorative Lanterns - Moved down by using top-12 and adjusting translateY */}
      <div className="absolute top-10 left-8 md:left-20 transform -translate-y-10 scale-80">
        <Lantern delay="0s" />
      </div>
      <div className="absolute top-10 right-8 md:right-20 transform -translate-y-10 scale-80">
        <Lantern delay="1.5s" />
      </div>
      <div className="z-10 flex flex-col items-center">
        {/* Main Title Typography */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20 animate-pulse"></div>
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-sm tracking-tighter">
            2026
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-[0.5em] mt-2 drop-shadow-lg">
            新年快乐
          </h2>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-6"></div>
          <p className="text-yellow-200/60 mt-2 tracking-[0.3em] uppercase text-xs">
            Happy New Year
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group relative px-12 py-5 rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-red-600 border border-yellow-400/50"></div>
          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
          <span className="relative text-xl font-bold text-white tracking-widest flex items-center gap-2">
            开启好运
            <svg
              className="w-5 h-5 animate-bounce-x"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );

  const renderInput = () => (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 animate-fade-in">
      <div className="glass-panel w-full max-w-md p-10 rounded-3xl relative border border-yellow-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <h3 className="text-2xl text-yellow-100 font-bold text-center mb-8 tracking-widest border-b border-white/10 pb-4">
          请输入您的名字
        </h3>
        <form onSubmit={handleNameSubmit} className="space-y-8">
          <div className="relative">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-black/20 border-2 border-yellow-600/30 rounded-xl px-6 py-4 text-center text-2xl text-yellow-100 placeholder-yellow-100/20 focus:outline-none focus:border-yellow-500 focus:bg-black/30 transition-all"
              placeholder="Name"
              maxLength={6}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!userName.trim()}
            className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 rounded-xl text-yellow-100 font-bold text-lg tracking-widest shadow-lg border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-red-800 transition-all transform active:scale-95"
          >
            抽取签文
          </button>
        </form>
      </div>
    </div>
  );

  const renderShake = () => (
    <div
      className="flex flex-col items-center justify-center h-full w-full animate-fade-in cursor-pointer"
      onClick={handleShake}
    >
      <div
        className={`relative ${
          isShaking ? "animate-shake-pot" : ""
        } transition-transform`}
      >
        {/* Use the specific image requestedss by user */}
        <img
          src={ASSETS.BLESS_LABEL}
          alt="Shake Fortune"
          className="w-40 h-auto drop-shadow-2xl"
        />
        {/* Shine effect behind image */}
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl -z-10 rounded-full"></div>
      </div>

      <div className="mt-12 text-center">
        <p
          className={`text-2xl font-bold text-yellow-400 tracking-widest transition-opacity duration-300 ${
            isShaking ? "opacity-100" : "opacity-80"
          }`}
        >
          {isShaking ? "正在祈福..." : "点击祈福"}
        </p>
        <p className="text-yellow-100/40 text-sm mt-2 tracking-wider">
          {isShaking ? "Good luck is coming" : "Click to pray for good luck"}
        </p>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 animate-fade-in ">
        {/* Card Container - 关键：去掉固定 aspect-[3/5]，改用动态高度 */}
        <div
          ref={resultCardRef}
          className="relative w-full max-w-sm 
               bg-[#FDF6E3] rounded-2xl overflow-hidden shadow-2xl 
               border-4 border-double border-red-900/20 
               flex flex-col
               mx-auto
               h-auto 
               min-h-[500px] 
               max-h-[90vh]                 
               sm:min-h-[580px]"
        >
          {/* Top Pattern */}
          <div className="h-14 sm:h-16 bg-red-900 flex items-center justify-between px-4 sm:px-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
            <div className="text-yellow-200 text-[10px] sm:text-xs tracking-[0.3em]">
              HAPPY NEW YEAR
            </div>
            <div className="text-yellow-400 font-bold text-lg sm:text-xl font-serif">
              2026
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 sm:p-6 relative flex flex-col items-center justify-between min-h-0">
            {/* Corner Decorations - 响应式缩小sd */}
            <div className="absolute top-3 left-3 w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-l-2 border-red-900/20 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-r-2 border-red-900/20 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-10 h-10 sm:w-12 sm:h-12 border-b-2 border-l-2 border-red-900/20 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-10 h-10 sm:w-12 sm:h-12 border-b-2 border-r-2 border-red-900/20 rounded-br-xl"></div>

            {/* Central Keyword - 关键：文字大小自适应 + 限制最大高度 */}
            <div className="flex-1 flex items-center justify-center w-full py-2 sm:py-4">
              <div className="relative">
                {/* Background Circle - 缩小一点避免溢出 */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         w-40 h-40 sm:w-48 sm:h-48 border border-red-900/10 rounded-full animate-spin-slow"
                ></div>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         w-36 h-36 sm:w-40 sm:h-40 border-2 border-red-900/5 rounded-full"
                ></div>

                {/* 核心：文字使用 clamp() 实现流体排版 */}
                <div
                  className="relative z-10 writing-vertical 
                       text-[clamp(32px,10vw,68px)]           // 最小32px，最大68px，随屏幕宽度线性变化
                       font-black text-red-900 tracking-wider 
                       leading-relaxed drop-shadow-sm 
                       flex items-center justify-center
                       h-[280px] sm:h-[300px] 
                       max-h-[40vh]"
                >
                  {result.keyword}
                </div>

                {/* Stamp Seal - 小屏也缩小 */}
                <div
                  className="absolute -bottom-3 -right-6 sm:-bottom-4 sm:-right-8 
                         w-14 h-14 sm:w-16 sm:h-16 
                         border-2 border-red-700 rounded-lg transform rotate-12 
                         flex items-center justify-center opacity-80 mix-blend-multiply"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 border border-red-700 rounded flex items-center justify-center">
                    <span className="text-red-700 text-[10px] sm:text-xs font-bold transform -rotate-14">
                      上上签
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Text - 内容区域也加上最大高度限制 */}
            <div className="w-full text-center mt-4 sm:mt-6 z-10 flex-shrink-0">
              <div
                className="bg-red-50/80 p-3 sm:p-4 rounded-lg backdrop-blur-sm border border-red-100 
                        max-h-[160px] overflow-y-auto"
              >
                <div className="text-red-800 font-bold mb-2 text-sm sm:text-base">
                  To: {userName}
                </div>
                <p className="text-red-900/80 font-medium text-xs sm:text-sm leading-6 tracking-wide">
                  {result.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons - 固定在底部，不被压缩 */}
        <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 w-full max-w-sm flex-shrink-0">
          <button
            onClick={reset}
            className="flex-1 py-3 bg-white/10 border border-white/20 rounded-full text-white text-sm sm:text-base font-medium hover:bg-white/20 transition-all backdrop-blur-md"
          >
            再抽一次
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-yellow-500 text-red-900 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>{saving ? "保存中.." : "保存祝福"}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-pattern">
      {/* Audio Element for Sound Effect */}
      <audio ref={shakeAudioRef} src={ASSETS.SHAKE_SOUND} preload="auto" />

      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-[#5B0B0B] to-black opacity-95"></div>

      {/* Effects */}
      <ParticleBackground />
      <div className={result ? "hidden" : ""}>
        <MusicControl />
      </div>
      {/* White Flash Overlay for Shake Result */}
      <div
        className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-500 ${
          showFlash ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      <main className="relative z-10 w-full h-full">
        {stage === AppStage.SPLASH && renderSplash()}
        {stage === AppStage.INPUT_NAME && renderInput()}
        {stage === AppStage.SHAKE && renderShake()}
        {stage === AppStage.RESULT && renderResult()}
      </main>
    </div>
  );
};

export default App;
