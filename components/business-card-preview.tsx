"use client";

import type { BusinessCardData } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, Globe, MapPin, Linkedin, Twitter, Share2, Copy, QrCode, Download, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import QRCode from "qrcode";

interface BusinessCardPreviewProps {
  data: BusinessCardData;
  showShareUrl?: boolean;
}

export function BusinessCardPreview({ data, showShareUrl }: BusinessCardPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/card/${data.id}`);
    }
  }, [data.id]);

  useEffect(() => {
    generateQRCode();
  }, [data]);

  const generateQRCode = async () => {
    try {
      const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
ORG:${data.company}
TITLE:${data.title}
TEL:${data.phone}
EMAIL:${data.email}
URL:${data.website}
ADR:;;${data.address};;;;
NOTE:${data.bio}
END:VCARD`;

      const qrDataUrl = await QRCode.toDataURL(vCard, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Card Visit - ${data.name}`,
          text: `Xem card visit của ${data.name} - ${data.title} tại ${data.company}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copying URL
      copyToClipboard();
    }
  };

  const saveToContacts = () => {
    // Create vCard format
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
ORG:${data.company}
TITLE:${data.title}
TEL:${data.phone}
EMAIL:${data.email}
URL:${data.website}
ADR:;;${data.address};;;;
NOTE:${data.bio}
END:VCARD`;

    // Create blob and download
    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `${data.name}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden font-sans">
      {/* Header với avatar và thông tin cơ bản */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center">
        {data.image ? (
          <img
            src={data.image}
            alt={data.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold bg-blue-500 text-white shadow-lg">
            {data.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{data.name}</h1>
        <p className="text-lg text-gray-600 mb-1">{data.title}</p>
        <p className="text-base text-gray-500">{data.company}</p>
      </div>

      <div className="p-6">
        {/* Bio nếu có */}
        {data.bio && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 text-center italic">"{data.bio}"</p>
          </div>
        )}

        {/* Nút chính: Lưu danh bạ và Quét mã QR */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={saveToContacts}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            LƯU DANH BẠ
          </Button>
          <Button
            onClick={() => setShowQR(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            QUÉT MÃ QR
          </Button>
        </div>

        {/* Thông tin liên hệ */}
        <div className="space-y-3">
          {data.phone && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 font-medium">{data.phone}</span>
            </div>
          )}

          {data.email && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 font-medium">{data.email}</span>
            </div>
          )}

          {data.website && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 font-medium">{data.website}</span>
            </div>
          )}

          {data.address && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border justify-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mt-0.5">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium leading-relaxed">{data.address}</p>
              </div>
            </div>
          )}

          {/* Social Links */}
          {(data.linkedin || data.twitter) && (
            <div className="flex gap-3 pt-3">
              {data.linkedin && (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex-1 justify-center"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              )}
              {data.twitter && (
                <a
                  href={data.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex-1 justify-center"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Share URL Section */}
        {showShareUrl && shareUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Card visit đã được tạo thành công!</span>
              </div>

              <p className="text-sm text-gray-600">Chia sẻ link này để mọi người có thể xem card visit của bạn:</p>

              <div className="bg-gray-50 rounded-lg p-3">
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
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Mã QR Danh Bạ</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border mx-auto w-fit">
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code để lưu danh bạ" className="w-48 h-48 mx-auto" />}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Quét mã QR này bằng camera điện thoại để tự động lưu thông tin liên hệ của <strong>{data.name}</strong>{" "}
                vào danh bạ
              </p>

              <Button onClick={downloadQRCode} variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
