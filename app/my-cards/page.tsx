"use client";

import type { BusinessCardData } from "@/app/page";
import { ErrorDisplay } from "@/components/error-display";
import { Navigation } from "@/components/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFirebaseCards } from "@/hooks/use-firebase-cards";
import { useToast } from "@/hooks/use-toast";
import { Edit, Eye, Plus, QrCode, Search, Share2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyCardsPage() {
  const router = useRouter();
  const { cards, loading, error, deleteCard } = useFirebaseCards();
  const { toast } = useToast();
  const [firebaseCards, setFirebaseCards] = useState<BusinessCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCards, setFilteredCards] = useState<BusinessCardData[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const convertCards = async () => {
      const convertedCards = await Promise.all(
        cards.map(async (card) => {
          const cardData: BusinessCardData = {
            id: card.id,
            slug: card.slug,
            name: card.name,
            title: card.title,
            company: card.company || "",
            phone1: card.phone1,
            phone2: card.phone2 || "",
            email1: card.email1,
            email2: card.email2 || "",
            address: card.address,
            avatar: card.avatar,
            imageCover: card.imageCover,
            createdAt: card.createdAt,
          };

          return cardData;
        })
      );
      setFirebaseCards(convertedCards);
      setFilteredCards(convertedCards);
    };

    if (cards.length > 0) {
      convertCards();
    }
  }, [cards]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCards(firebaseCards);
    } else {
      const filtered = firebaseCards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (card.company && card.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          card.email1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (card.email2 && card.email2.toLowerCase().includes(searchQuery.toLowerCase())) ||
          card.phone1.includes(searchQuery) ||
          (card.phone2 && card.phone2.includes(searchQuery)) ||
          card.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  }, [searchQuery, firebaseCards]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleDeleteCard = (cardId: string, cardName: string) => {
    setCardToDelete({ id: cardId, name: cardName });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCard(cardToDelete.id);
      toast({
        title: "Xóa thành công",
        description: "Card visit đã được xóa.",
      });
      setDeleteConfirmOpen(false);
      setCardToDelete(null);
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: `Lỗi khi xóa card: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareCard = async (card: BusinessCardData) => {
    const url = `${window.location.origin}/${card.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Card Visit - ${card.name}`,
          text: `Xem card visit của ${card.name}`,
          url: url,
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Sao chép thành công!",
        description: "Đã sao chép link!",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải card visits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <ErrorDisplay
          message={`Lỗi tải danh sách card: ${error}`}
          onRetry={() => window.location.reload()}
          onGoHome={() => router.push("/")}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
          {/* Phần Tiêu đề và Mô tả */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quản lý danh sách card visit</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Quản lý tất cả card visits bạn đã tạo ({firebaseCards.length} card visits)
              {searchQuery && (
                <span className="block mt-1">
                  Kết quả tìm kiếm: {filteredCards.length} card visits cho "{searchQuery}"
                </span>
              )}
            </p>

            {/* Search Box */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên, công ty, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-md transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {filteredCards.length > 0 ? (
                  <span className="text-green-600 dark:text-green-400">✓ Tìm thấy {filteredCards.length} kết quả</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">⚠ Không có kết quả phù hợp</span>
                )}
              </div>
            )}
          </div>

          <Button onClick={() => router.push("/")} className="flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Tạo card visit mới
          </Button>
        </div>

        {firebaseCards.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chưa có card visit nào</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Tạo card visit đầu tiên của bạn để bắt đầu</p>
              <Button onClick={() => router.push("/")}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo card visit
              </Button>
            </CardContent>
          </Card>
        ) : filteredCards.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Không có card visit nào khớp với từ khóa "{searchQuery}"
              </p>
              <Button onClick={clearSearch} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between pt-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        <HighlightedText text={card.name} highlight={searchQuery} />
                      </CardTitle>
                      <CardDescription className="text-sm space-y-1">
                        <div>
                          <HighlightedText text={card.title} highlight={searchQuery} />
                        </div>
                        {card.company && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            🏢 <HighlightedText text={card.company} highlight={searchQuery} />
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    {card.avatar ? (
                      <img
                        src={card.avatar}
                        alt={card.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-blue-100 text-blue-600">
                        {card.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Content area that grows */}
                  <div className="flex-1 space-y-2 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        📧 <HighlightedText text={card.email1} highlight={searchQuery} />
                      </p>
                      {card.phone1 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📞 <HighlightedText text={card.phone1} highlight={searchQuery} />
                        </p>
                      )}
                      {card.phone2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📞 <HighlightedText text={card.phone2} highlight={searchQuery} />
                        </p>
                      )}
                      {card.email2 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          📧 <HighlightedText text={card.email2} highlight={searchQuery} />
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        📍 <HighlightedText text={card.address} highlight={searchQuery} />
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        Tạo: {new Date(card.createdAt).toLocaleDateString("vi-VN")}
                      </Badge>
                      {card.qrCode && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          QR Code
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Button area always at bottom */}
                  <div className="grid grid-cols-4 gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/${card.slug}`)}
                      className="col-span-2 cursor-pointer flex items-center justify-center"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Xem</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer flex items-center justify-center"
                      onClick={() => router.push(`/edit/${card.slug}`)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer flex items-center justify-center"
                      onClick={() => handleShareCard(card)}
                      title="Chia sẻ"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCard(card.slug || card.id, card.name)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center justify-center"
                      title="Xóa card"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      <span className="text-xs">Xóa</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={!isDeleting ? setDeleteConfirmOpen : undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa card visit</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa card visit <strong>"{cardToDelete?.name}"</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCard}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xóa...
                </div>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
