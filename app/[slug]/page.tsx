"use client";
import type { BusinessCardData } from "@/app/page";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { ErrorDisplay } from "@/components/error-display";
import { useFirebaseCardBySlug } from "@/hooks/use-firebase-cards";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CardSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : null;
  const { card: firebaseCard, loading, error, notFound } = useFirebaseCardBySlug(slug);
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải card visit...</p>
        </div>
      </div>
    );
  }

  if (error || notFound) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <ErrorDisplay
          message={
            notFound
              ? "Card visit bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
              : error || "Không thể tải card visit"
          }
          onGoHome={() => router.push("/")}
        />
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Đang xử lý dữ liệu...</p>
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
