"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { BusinessCardData } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, Share2 } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function MyCardsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<BusinessCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = () => {
    try {
      const savedCards = JSON.parse(localStorage.getItem("businessCards") || "[]")
      setCards(
        savedCards.sort(
          (a: BusinessCardData, b: BusinessCardData) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
    } catch (error) {
      console.error("Error loading cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCard = (cardId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa card visit này?")) {
      const updatedCards = cards.filter((card) => card.id !== cardId)
      localStorage.setItem("businessCards", JSON.stringify(updatedCards))
      setCards(updatedCards)
    }
  }

  const handleShareCard = async (card: BusinessCardData) => {
    const url = `${window.location.origin}/card/${card.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Card Visit - ${card.name}`,
          text: `Xem card visit của ${card.name}`,
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Đã sao chép link!")
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Card Visits của tôi</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý tất cả card visits bạn đã tạo ({cards.length} card visits)
            </p>
          </div>

          <Button onClick={() => router.push("/")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo card visit mới
          </Button>
        </div>

        {cards.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{card.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {card.title} tại {card.company}
                      </CardDescription>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        backgroundColor: card.textColor,
                        color: card.backgroundColor,
                      }}
                    >
                      {card.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">📧 {card.email}</p>
                    {card.phone && <p className="text-sm text-gray-600 dark:text-gray-400">📞 {card.phone}</p>}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Tạo: {new Date(card.createdAt).toLocaleDateString("vi-VN")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/card/${card.id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Xem
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => router.push(`/edit/${card.id}`)}>
                      <Edit className="w-3 h-3" />
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => handleShareCard(card)}>
                      <Share2 className="w-3 h-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
