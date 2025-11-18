"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BusinessCardForm } from "@/components/business-card-form";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { Navigation } from "@/components/navigation";

export interface BusinessCardData {
  id: string;
  slug: string;
  name: string;
  title: string;
  company?: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  address: string;
  avatar: string;
  imageCover: string;
  createdAt: string;
  qrCode?: string;
}

export default function HomePage() {
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [previewData, setPreviewData] = useState<BusinessCardData | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const router = useRouter();

  const handlePreview = (data: BusinessCardData) => {
    setPreviewData(data);
  };

  const handleFormSubmit = (data: BusinessCardData) => {
    setCardData(data);
    setIsPreviewMode(true);
  };

  const handleEditCard = () => {
    router.push(`/edit/${cardData!.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tạo Card Visit Kỹ Thuật Số
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Tạo card visit chuyên nghiệp và chia sẻ thông tin liên hệ của bạn một cách dễ dàng
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!isPreviewMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="order-2 lg:order-1">
                <BusinessCardForm onSubmit={handleFormSubmit} onPreview={handlePreview} />
              </div>
              <div className="order-1 lg:order-2 lg:sticky lg:top-8">
                <Card className="pt-4">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Xem trước</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Nhấn nút "Xem trước" để xem card visit của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {previewData ? (
                      <BusinessCardPreview data={previewData} />
                    ) : (
                      <div className="h-48 sm:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base text-center px-4">
                          Nhấn "Xem trước" để hiển thị card visit
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <BusinessCardPreview data={cardData!} />
              <div className="mt-8 space-x-4">
                <Button onClick={handleEditCard} variant="outline">
                  Chỉnh sửa
                </Button>
                <Button onClick={() => router.push(`/card/${cardData!.id}`)}>Xem card visit</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
