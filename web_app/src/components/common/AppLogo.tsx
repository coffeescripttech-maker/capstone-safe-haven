"use client";
import Link from "next/link";

interface AppLogoProps {
  variant?: "full" | "icon";
  href?: string;
  className?: string;
}

export default function AppLogo({ variant = "full", href = "/", className = "" }: AppLogoProps) {
  const LogoContent = () => {
    if (variant === "icon") {
      return (
        <div className={`flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg ${className}`}>
          <span className="text-white font-bold text-xl">SH</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <span className="text-white font-bold text-xl">SH</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">SafeHaven</span>
      </div>
    );
  };

  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
