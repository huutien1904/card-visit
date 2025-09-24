"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { BusinessCardData } from "@/app/page";
import { BusinessCardPreview } from "@/components/business-card-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2, Download, Edit } from "lucide-react";
import { ContactActions } from "@/components/contact-actions";
import { Navigation } from "@/components/navigation"; // Import Navigation component

export default function CardPage() {
  const params = useParams();
  const router = useRouter();
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCard = () => {
      try {
        const cards = JSON.parse(localStorage.getItem("businessCards") || "[]");
        const card = cards.find((c: BusinessCardData) => c.id === params.id);

        if (card) {
          setCardData(card);
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

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Card Visit - ${cardData?.name}`,
          text: `Xem card visit của ${cardData?.name}`,
          url: url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Đã sao chép link!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownloadVCard = () => {
    if (!cardData) return;

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
ORG:${cardData.company}
TITLE:${cardData.title}
EMAIL:${cardData.email}
TEL:${cardData.phone}
URL:${cardData.website}
ADR:;;${cardData.address};;;;
NOTE:${cardData.bio}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cardData.name.replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải card visit...</p>
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
            {/* <Button onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* <Navigation /> */}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
            <Button variant="outline" onClick={handleDownloadVCard}>
              <Download className="w-4 h-4 mr-2" />
              Tải về
            </Button>
            <Button onClick={() => router.push(`/edit/${cardData!.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div> */}

        {/* Card Display */}
        <div className="max-w-2xl mx-auto">
          {/* <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Card Visit - {cardData!.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Được tạo vào {new Date(cardData!.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div> */}

          <div className="space-y-8">
            <BusinessCardPreview data={cardData!} />
            <ContactActions data={cardData!} />
          </div>
        </div>
      </div>
    </div>
  );
}
