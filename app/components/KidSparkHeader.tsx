export default function KidSparkHeader() {
  return (
    <div className="w-full flex items-center justify-center pt-4 px-4 flex-shrink-0">
      <div className="relative mx-auto bg-white/70 backdrop-blur-md border border-white/60 rounded-full shadow-lg px-5 py-2.5 select-none">
        <div className="flex items-center gap-2">
          {/* Sparkle left */}
          <span className="hidden sm:inline-block text-yellow-500 animate-pulse">✦</span>

          {/* KidSpark wordmark (playful, per Screen1 colors) */}
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            <span className="inline-block transform hover:rotate-3 hover:scale-110 transition-transform duration-200" style={{ color: '#D2691E' }}>K</span>
            <span className="inline-block transform hover:-rotate-3 hover:scale-110 transition-transform duration-200" style={{ color: '#FFB6C1' }}>i</span>
            <span className="inline-block transform hover:rotate-2 hover:scale-110 transition-transform duration-200" style={{ color: '#FFD700' }}>d</span>
            <span className="inline-block transform hover:-rotate-2 hover:scale-110 transition-transform duration-200" style={{ color: '#228B22' }}>S</span>
            <span className="inline-block transform hover:rotate-1 hover:scale-110 transition-transform duration-200" style={{ color: '#87CEEB' }}>p</span>
            <span className="inline-block transform hover:-rotate-1 hover:scale-110 transition-transform duration-200" style={{ color: '#4169E1' }}>a</span>
            <span className="inline-block transform hover:rotate-3 hover:scale-110 transition-transform duration-200" style={{ color: '#D2691E' }}>r</span>
            <span className="inline-block transform hover:-rotate-3 hover:scale-110 transition-transform duration-200" style={{ color: '#FFB6C1' }}>k</span>
          </div>

          {/* Sparkle right */}
          <span className="hidden sm:inline-block text-pink-500 animate-pulse">✧</span>
        </div>

        {/* Floating confetti accents on hover */}
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute -top-2 left-3 text-yellow-400 text-sm sm:text-base opacity-80 animate-bounce">★</span>
          <span className="absolute -bottom-2 right-4 text-orange-400 text-sm sm:text-base opacity-80 animate-bounce" style={{ animationDelay: '150ms' }}>★</span>
          <span className="absolute -top-3 right-8 text-pink-400 text-xs sm:text-sm opacity-80 animate-bounce" style={{ animationDelay: '300ms' }}>★</span>
        </div>
      </div>
    </div>
  );
}


