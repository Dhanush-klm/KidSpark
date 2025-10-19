"use client";

import dynamic from "next/dynamic";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false }
);

interface LottieProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function Lottie({
  src,
  loop = true,
  autoplay = true,
  className,
}: LottieProps) {
  return (
    <DotLottieReact src={src} loop={loop} autoplay={autoplay} className={className} />
  );
}


