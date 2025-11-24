"use client";

import { useState, useCallback, useEffect } from "react";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { RecaptchaWrapper } from "@/components/recaptcha-wrapper";
import type { BusinessCardData } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CardDetailWithCaptchaProps {
  cardData: BusinessCardData;
}

export function CardDetailWithCaptcha({ cardData }: CardDetailWithCaptchaProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "verified" | "failed">("idle");

  useEffect(() => {
    const checkBotBehavior = () => {
      const hasUserAgent = navigator.userAgent && navigator.userAgent.length > 0;
      const hasWebdriver = "webdriver" in navigator;
      const hasPhantom = "phantom" in window || "_phantom" in window;
      const hasCallPhantom = "callPhantom" in window;
      const hasCacheStorage = "caches" in window;

      const isProbablyBot = !hasUserAgent || hasWebdriver || hasPhantom || hasCallPhantom || !hasCacheStorage;

      if (isProbablyBot) {
        setShowRecaptcha(true);
      } else {
        setShowRecaptcha(true);
      }
    };

    checkBotBehavior();
  }, []);

  const handleRecaptchaVerify = useCallback(async (token: string | null) => {
    if (!token) {
      setVerificationStatus("failed");
      return;
    }

    setVerificationStatus("verifying");
    setRecaptchaToken(token);

    try {
      const response = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setIsVerified(true);
        setVerificationStatus("verified");
        setShowRecaptcha(false);
      } else {
        setVerificationStatus("failed");
        console.error("reCAPTCHA verification failed:", result.error);
      }
    } catch (error) {
      setVerificationStatus("failed");
      console.error("Error verifying reCAPTCHA:", error);
    }
  }, []);

  const handleRecaptchaExpire = useCallback(() => {
    setIsVerified(false);
    setRecaptchaToken(null);
    setVerificationStatus("idle");
    setShowRecaptcha(true);
  }, []);

  const handleRecaptchaError = useCallback(() => {
    setVerificationStatus("failed");
    console.error("reCAPTCHA error occurred");
  }, []);

  if (showRecaptcha && !isVerified) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <div className="relative px-6 py-8 sm:px-8 sm:py-10 text-center">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5"></div>

              <div className="relative mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold  bg-primary  bg-clip-text text-transparent mb-3">
                  Xác thực bảo mật
                </h1>

                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  Vui lòng hoàn thành xác thực để xem card visit này
                </p>
              </div>
            </div>

            <CardContent className="px-4 pb-8 sm:px-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 sm:p-6 mb-6">
                <RecaptchaWrapper
                  onVerify={handleRecaptchaVerify}
                  onExpire={handleRecaptchaExpire}
                  onError={handleRecaptchaError}
                  className="flex justify-center"
                  size="compact"
                />
              </div>

              {verificationStatus === "verifying" && (
                <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-xl py-4 px-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3" />
                  <span className="text-sm font-medium">Đang xác thực...</span>
                </div>
              )}

              {verificationStatus === "failed" && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                  <div className="text-red-600 dark:text-red-400 mb-3">
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-sm font-medium">Xác thực không thành công</p>
                    <p className="text-xs mt-1 opacity-75">Vui lòng thử lại sau vài giây</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                    onClick={() => {
                      setVerificationStatus("idle");
                      window.location.reload();
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Thử lại
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">🔒 Được bảo vệ bởi reCAPTCHA</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        <BusinessCardPreview data={cardData} isDetailMode />
      </div>
    </div>
  );
}
