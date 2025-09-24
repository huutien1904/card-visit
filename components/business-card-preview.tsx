"use client"

import type { BusinessCardData } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Globe, MapPin, Linkedin, Twitter, Share2, Copy } from "lucide-react"
import { useState, useEffect } from "react"

interface BusinessCardPreviewProps {
  data: BusinessCardData
  showShareUrl?: boolean
}

export function BusinessCardPreview({ data, showShareUrl }: BusinessCardPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/card/${data.id}`)
    }
  }, [data.id])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Card Visit - ${data.name}`,
          text: `Xem card visit của ${data.name} - ${data.title} tại ${data.company}`,
          url: shareUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className="max-w-md mx-auto overflow-hidden shadow-lg"
        style={{
          backgroundColor: data.backgroundColor,
          color: data.textColor,
        }}
      >
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: data.textColor,
                color: data.backgroundColor,
              }}
            >
              {data.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold mb-1">{data.name}</h2>
            <p className="text-lg opacity-80 mb-1">{data.title}</p>
            <p className="font-semibold opacity-90">{data.company}</p>
          </div>

          {data.bio && (
            <div className="mb-6">
              <p className="text-sm opacity-80 text-center italic">"{data.bio}"</p>
            </div>
          )}

          <div className="space-y-3">
            {data.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-70" />
                <span className="text-sm">{data.email}</span>
              </div>
            )}

            {data.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-70" />
                <span className="text-sm">{data.phone}</span>
              </div>
            )}

            {data.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 opacity-70" />
                <span className="text-sm">{data.website}</span>
              </div>
            )}

            {data.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 opacity-70" />
                <span className="text-sm">{data.address}</span>
              </div>
            )}
          </div>

          {(data.linkedin || data.twitter) && (
            <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-current/20">
              {data.linkedin && (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {data.twitter && (
                <a
                  href={data.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showShareUrl && shareUrl && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Card visit đã được tạo thành công!</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chia sẻ link này để mọi người có thể xem card visit của bạn:
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm font-mono text-center outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} size="sm" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Đã sao chép!" : "Sao chép link"}
                </Button>
                <Button onClick={shareViaWebShare} size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
