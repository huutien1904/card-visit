"use client"

import type { BusinessCardData } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Globe, MapPin, Linkedin, MessageCircle } from "lucide-react"

interface ContactActionsProps {
  data: BusinessCardData
}

export function ContactActions({ data }: ContactActionsProps) {
  const handleEmailClick = () => {
    window.location.href = `mailto:${data.email}?subject=Liên hệ từ card visit`
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${data.phone}`
  }

  const handleWebsiteClick = () => {
    window.open(data.website, "_blank", "noopener,noreferrer")
  }

  const handleMapClick = () => {
    const encodedAddress = encodeURIComponent(data.address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank", "noopener,noreferrer")
  }

  const handleWhatsAppClick = () => {
    const phone = data.phone.replace(/\D/g, "")
    const message = encodeURIComponent(`Xin chào ${data.name}, tôi đã xem card visit của bạn.`)
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Liên hệ nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.email && (
            <Button
              variant="outline"
              onClick={handleEmailClick}
              className="flex items-center gap-2 h-auto py-3 bg-transparent"
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Gửi email</div>
                <div className="text-xs text-gray-500 truncate">{data.email}</div>
              </div>
            </Button>
          )}

          {data.phone && (
            <Button
              variant="outline"
              onClick={handlePhoneClick}
              className="flex items-center gap-2 h-auto py-3 bg-transparent"
            >
              <Phone className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Gọi điện</div>
                <div className="text-xs text-gray-500">{data.phone}</div>
              </div>
            </Button>
          )}

          {data.phone && (
            <Button
              variant="outline"
              onClick={handleWhatsAppClick}
              className="flex items-center gap-2 h-auto py-3 bg-transparent"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs text-gray-500">Nhắn tin</div>
              </div>
            </Button>
          )}

          {data.website && (
            <Button
              variant="outline"
              onClick={handleWebsiteClick}
              className="flex items-center gap-2 h-auto py-3 bg-transparent"
            >
              <Globe className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Website</div>
                <div className="text-xs text-gray-500 truncate">{data.website}</div>
              </div>
            </Button>
          )}

          {data.address && (
            <Button
              variant="outline"
              onClick={handleMapClick}
              className="flex items-center gap-2 h-auto py-3 bg-transparent"
            >
              <MapPin className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium">Xem bản đồ</div>
                <div className="text-xs text-gray-500 truncate">{data.address}</div>
              </div>
            </Button>
          )}

          {data.linkedin && (
            <Button
              variant="outline"
              onClick={() => window.open(data.linkedin, "_blank", "noopener,noreferrer")}
              className="flex items-center gap-2 h-auto py-3"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
              <div className="text-left">
                <div className="font-medium">LinkedIn</div>
                <div className="text-xs text-gray-500">Kết nối</div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
