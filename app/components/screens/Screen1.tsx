export default function Screen1() {
  return (
    <div className="min-h-screen bg-[#F8F5EE] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200/40 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-orange-200/25 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-200/35 rounded-full"></div>

        {/* Small dots */}
        <div className="absolute top-32 left-1/3 w-3 h-3 bg-orange-300/50 rounded-full"></div>
        <div className="absolute top-60 right-1/4 w-2 h-2 bg-orange-300/60 rounded-full"></div>
        <div className="absolute bottom-40 left-1/2 w-4 h-4 bg-orange-300/40 rounded-full"></div>
        <div className="absolute bottom-60 right-10 w-2 h-2 bg-orange-300/50 rounded-full"></div>

        {/* Curved dashed lines */}
        <svg className="absolute top-1/4 left-0 w-full h-1/2" viewBox="0 0 100 50">
          <path
            d="M10,25 Q30,10 50,25 T90,25"
            stroke="#D4A574"
            strokeWidth="1"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.6"
          />
        </svg>
        <svg className="absolute bottom-1/4 left-0 w-full h-1/2" viewBox="0 0 100 50">
          <path
            d="M15,30 Q40,15 70,30 T95,30"
            stroke="#D4A574"
            strokeWidth="1"
            strokeDasharray="2,2"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-full">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#D2691E' }}>K</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFB6C1' }}>i</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFD700' }}>d</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#228B22' }}>S</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#87CEEB' }}>p</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#4169E1' }}>a</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#D2691E' }}>r</span>
            <span className="inline-block transform hover:scale-105 transition-transform duration-200" style={{ color: '#FFB6C1' }}>k</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
