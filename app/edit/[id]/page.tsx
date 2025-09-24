"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { BusinessCardData } from "@/app/page";
import { BusinessCardForm } from "@/components/business-card-form";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [previewData, setPreviewData] = useState<BusinessCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCard = () => {
      try {
        const cards = JSON.parse(localStorage.getItem("businessCards") || "[]");
        const card = cards.find((c: BusinessCardData) => c.id === params.id);

        if (card) {
          setCardData(card);
          setPreviewData(card); // Set initial preview data
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error loading card:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadCard();
    }
  }, [params.id]);

  const handleFormSubmit = (updatedData: BusinessCardData) => {
    setCardData(updatedData);
    setPreviewData(updatedData);
    router.push(`/card/${updatedData.id}`);
  };

  const handlePreview = (data: BusinessCardData) => {
    setPreviewData(data);
  };

  const handleSaveAndView = () => {
    if (cardData) {
      router.push(`/card/${cardData.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy card visit</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Card visit này không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/card/${cardData!.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <Button onClick={handleSaveAndView}>Lưu và xem card visit</Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Chỉnh sửa Card Visit</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Cập nhật thông tin card visit của bạn</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <BusinessCardForm
                onSubmit={handleFormSubmit}
                onPreview={handlePreview}
                initialData={cardData!}
                isEditMode
              />
            </div>
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Xem trước</CardTitle>
                  <CardDescription>Card visit sau khi chỉnh sửa</CardDescription>
                </CardHeader>
                <CardContent>{previewData && <BusinessCardPreview data={previewData} />}</CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
