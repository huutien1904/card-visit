"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useRef, useCallback, useState, useEffect } from "react";

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
  size?: "compact" | "normal" | "invisible";
  theme?: "light" | "dark";
}

export function RecaptchaWrapper({
  onVerify,
  onExpire,
  onError,
  className = "",
  size = "normal",
  theme = "light",
}: RecaptchaWrapperProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const checkDev = () => {
      setIsDev(
        process.env.NODE_ENV === "development" ||
          (typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
      );
    };

    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 480);
      }
    };

    checkDev();
    checkMobile();

    const handleResize = () => checkMobile();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = useCallback(
    (token: string | null) => {
      onVerify(token);
    },
    [onVerify]
  );

  const handleExpired = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  const handleError = useCallback(
    (error?: any) => {
      onError?.();
    },
    [onError]
  );

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!siteKey) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>reCAPTCHA chưa được cấu hình</p>
        {isDev && (
          <div className="mt-2">
            <p className="text-xs">Kiểm tra NEXT_PUBLIC_RECAPTCHA_SITE_KEY trong .env.local</p>
            <button
              onClick={() => onVerify("test-token-for-dev")}
              className="mt-2 px-3 py-1 bg-yellow-500 text-black text-xs rounded"
            >
              Skip reCAPTCHA (Dev Only)
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`recaptcha-wrapper relative ${className}`}>
      {!isLoaded && (
        <div className="flex flex-col items-center justify-center p-6 space-y-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600" />
            <div className="absolute inset-0 rounded-full bg-blue-50 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Đang tải xác thực...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vui lòng đợi trong giây lát</p>
            {isDev && (
              <button onClick={() => setIsLoaded(true)} className="text-xs text-blue-600 underline mt-2">
                Force Show (Debug)
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={`recaptcha-container transition-opacity duration-300 ${!isLoaded ? "opacity-20" : "opacity-100"}`}
      >
        <div className="flex justify-center items-center min-h-[100px]">
          <div className="transform-gpu scale-100 hover:scale-105 transition-transform duration-200">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={handleChange}
              onExpired={handleExpired}
              onErrored={handleError}
              onLoad={handleLoad}
              size={isMobile ? "compact" : size}
              theme={theme}
              hl="vi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export methods to use imperatively
export { RecaptchaWrapper as default };
