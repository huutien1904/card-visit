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
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  bio: string;
  linkedin: string;
  twitter: string;
  backgroundColor: string;
  textColor: string;
  createdAt: string;
  image?: string;
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
    // setIsPreviewMode(false);
    router.push(`/edit/${cardData!.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tạo Card Visit Kỹ Thuật Số</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tạo card visit chuyên nghiệp và chia sẻ thông tin liên hệ của bạn một cách dễ dàng
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!isPreviewMode ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <BusinessCardForm onSubmit={handleFormSubmit} onPreview={handlePreview} />
              </div>
              <div className="lg:sticky lg:top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Xem trước</CardTitle>
                    <CardDescription>Nhấn nút "Xem trước" để xem card visit của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {previewData ? (
                      <BusinessCardPreview data={previewData} />
                    ) : (
                      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Nhấn "Xem trước" để hiển thị card visit</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <BusinessCardPreview data={cardData!} showShareUrl />
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
