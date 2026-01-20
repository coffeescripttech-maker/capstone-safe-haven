"use client";
import Link from "next/link";
import Image from "next/image";

interface AppLogoProps {
  variant?: "full" | "icon";
  href?: string;
  className?: string;
}

export default function AppLogo({ variant = "full", href = "/", className = "" }: AppLogoProps) {
  const LogoContent = () => {
    if (variant === "icon") {
      return (
        <div className={`flex items-center justify-center transition-transform hover:scale-110 ${className}`}>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Image
              src="/images/logo/my_logo.png"
              alt="SafeHaven"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-4 transition-transform hover:scale-105 ${className}`}>
        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
          <Image
            src="/images/logo/my_logo.png"
            alt="SafeHaven"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white leading-tight">SafeHaven</span>
          <span className="text-sm text-white/80 leading-tight tracking-wide">Emergency Response</span>
        </div>
      </div>
    );
  };

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
