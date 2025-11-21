"use client";

import type { BusinessCardData } from "@/app/page";
import { BusinessCardForm } from "@/components/business-card-form";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { ErrorDisplay } from "@/components/error-display";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseCardBySlug } from "@/hooks/use-firebase-cards";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export default function EditCardSlugPage() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : null;
  const { card: firebaseCard, loading, error, notFound } = useFirebaseCardBySlug(slug);
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [previewData, setPreviewData] = useState<BusinessCardData | null>(null);

  useEffect(() => {
    const convertCard = async () => {
      if (!firebaseCard) return;
      const cardData: BusinessCardData = {
        id: firebaseCard.id,
        slug: firebaseCard.slug,
        name: firebaseCard.name,
        title: firebaseCard.title,
        company: firebaseCard.company || "",
        phone1: firebaseCard.phone1,
        phone2: firebaseCard.phone2 || "",
        email1: firebaseCard.email1,
        email2: firebaseCard.email2 || "",
        address: firebaseCard.address,
        avatar: firebaseCard.avatar,
        imageCover: firebaseCard.imageCover,
        createdAt: firebaseCard.createdAt,
      };
      setCardData(cardData);
    };

    convertCard();
  }, [firebaseCard]);

  const handleSubmit = (updatedCard: BusinessCardData) => {
    setCardData(updatedCard);
  };

  const handlePreview = (previewCard: BusinessCardData) => {
    setPreviewData(previewCard);
  };

  const handleBack = () => {
    router.push("/my-cards");
  };

  // Kiểm tra quyền admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Không có quyền truy cập</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Chỉ admin mới có quyền chỉnh sửa card visit</p>
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  Quay lại Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Đang tải card visit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || notFound) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <ErrorDisplay
            message={notFound ? "Card visit không tồn tại hoặc đã bị xóa." : error || "Không thể tải card visit"}
            onGoHome={() => router.push("/")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl mt-4">Chỉnh sửa Card Visit</CardTitle>
                <CardDescription>Cập nhật thông tin card visit của bạn</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <BusinessCardForm
                onSubmit={handleSubmit}
                onPreview={handlePreview}
                initialData={cardData || undefined}
                isEditMode={true}
              />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg mt-2">Xem trước</CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData ? (
                    <BusinessCardPreview data={previewData} />
                  ) : cardData ? (
                    <BusinessCardPreview data={cardData} />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Chưa có dữ liệu để xem trước</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
