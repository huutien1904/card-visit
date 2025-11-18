"use client";

import type { BusinessCardData } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BusinessCardPreviewProps {
  data: BusinessCardData;
  isDetailMode?: boolean;
}

export function BusinessCardPreview({ data, isDetailMode }: BusinessCardPreviewProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${data?.slug}`;
      setShareUrl(url);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
    }
  }, [data?.slug]);

  const downloadVCard = () => {
    const vCardContent = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${data.name}`,
      `TITLE:${data.title}`,
      data.company ? `ORG:${data.company}` : "",
      data.phone1 ? `TEL:${data.phone1}` : "",
      data.phone2 ? `TEL:${data.phone2}` : "",
      data.email1 ? `EMAIL:${data.email1}` : "",
      data.email2 ? `EMAIL:${data.email2}` : "",
      data.address ? `ADR:;;${data.address};;;;` : "",
      "END:VCARD",
    ]
      .filter((line) => line.trim() !== "")
      .join("\n");

    const blob = new Blob([vCardContent], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex justify-center items-center bg-gray-100 ${!isDetailMode ? "py-8" : ""}`}>
      <div
        className={`w-full sm:max-w-sm ${
          isDetailMode ? "h-screen" : ""
        } mx-auto bg-white shadow-lg overflow-hidden font-svn-gilroy`}
      >
        <div className="relative h-54 bg-blue-600">
          {data?.imageCover ? (
            data.imageCover.startsWith("data:") ? (
              <img src={data.imageCover} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <Image src={data.imageCover} alt="Cover" fill className="object-cover" />
            )
          ) : (
            <div className="w-full h-full bg-blue-600" />
          )}
        </div>

        <div className="relative px-6 pt-4">
          <div className="flex justify-center mb-4">
            <div className="relative -mt-34 w-45 h-45">
              {data?.avatar ? (
                <Image
                  src={data.avatar}
                  alt={data?.name || "Avatar"}
                  fill
                  className="rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Avatar</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-blue mb-1">{data?.name}</h1>
            <p className="text-primary-blue text-base">{data?.title}</p>
            {data?.company && <p className="text-primary-blue text-sm mt-1 font-medium">Công ty {data.company}</p>}
          </div>

          <div className="space-y-3 mb-6">
            {data?.phone1 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconPhone.png" alt="Phone" width={25} height={25} className="w-7 h-7" />
                </div>
                <a href={`tel:${data.phone1}`} className="text-primary-blue hover:underline text-base">
                  {data.phone1}
                </a>
              </div>
            )}

            {data?.phone2 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconPhone.png" alt="Phone" width={25} height={25} className="w-7 h-7" />
                </div>
                <a href={`tel:${data.phone2}`} className="text-primary-blue  hover:underline text-base">
                  {data.phone2}
                </a>
              </div>
            )}

            {data?.email1 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconEmail.png" alt="Email" width={24} height={24} className="w-7 h-7" />
                </div>
                <a href={`mailto:${data.email1}`} className="text-primary-blue  hover:underline break-all text-base">
                  {data.email1}
                </a>
              </div>
            )}

            {data?.email2 && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconEmail.png" alt="Email" width={24} height={24} className="w-7 h-7" />
                </div>
                <a href={`mailto:${data.email2}`} className="text-primary-blue  hover:underline break-all text-base">
                  {data.email2}
                </a>
              </div>
            )}

            {data?.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconAddress.png" alt="Address" width={24} height={24} className="w-7 h-7" />
                </div>
                <p className="text-primary-blue leading-normal text-base">{data.address}</p>
              </div>
            )}
          </div>

          <div className={`flex sm:flex-row gap-3 justify-center items-center ${!isDetailMode ? "mb-12" : "mb-6"}`}>
            <Button
              className="bg-[#0C76EA] hover:bg-[#0e4e8c] text-white py-5 px-6 rounded-full font-medium cursor-pointer w-48 text-base"
              onClick={downloadVCard}
            >
              Add to contacts
            </Button>
            <Button
              variant="outline"
              className="border-[#0C76EA] text-[#0C76EA] hover:bg-[#0C76EA] hover:text-white py-5 px-6 rounded-full font-medium cursor-pointer w-32 text-base flex items-center gap-1"
              onClick={() => setIsQRModalOpen(true)}
            >
              <QrCode className="w-4 h-4" />
              QR
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-primary-blue">
              QR Code for {data?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-4 rounded-lg border">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-sm text-gray-600 text-center px-4">Quét mã QR này để truy cập thẻ danh thiếp</p>
            <p className="text-xs text-gray-500 text-center px-4 break-all">{shareUrl}</p>
            <Button variant="outline" onClick={() => setIsQRModalOpen(false)} className="mt-4">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
