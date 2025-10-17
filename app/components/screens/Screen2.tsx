import Image from 'next/image';

interface Screen2Props {
  onNext: () => void;
}

export default function Screen2({ onNext }: Screen2Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
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

        {/* Additional decorative elements for second screen */}
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-red-200/40 rounded-full"></div>
        <div className="absolute bottom-1/3 left-16 w-12 h-12 bg-pink-200/30 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="text-center max-w-3xl mx-auto w-full">
          {/* Children with balloon image */}
          <div className="mb-4 sm:mb-6 relative">
            <Image
              src="/screen2.png"
              alt="Children with balloon"
              width={250}
              height={160}
              className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>

          {/* Text content */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
              Innovative learning<br />
              <span className="text-orange-600">modern learner</span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              It is a long established fact that a reader will by the readable content of a page when.
            </p>

            {/* CTA Button */}
            <button
              onClick={onNext}
              className="mt-4 sm:mt-6 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Let's go 👋
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
