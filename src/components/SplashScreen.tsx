import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500); // Wait for fade animation
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-primary-glow transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
        <img
          src="https://storage.googleapis.com/gpt-engineer-file-uploads/ShFliboZjRRmoUV2sHc7LSvnB3B2/uploads/1759910434585-Gpl.png"
          alt="GPL Logo"
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
        />
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">GPL-2.2MW</h1>
          <p className="text-white/90 text-sm sm:text-base">Gayatri Power Management</p>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
