"use client";

import type { BusinessCardData } from "@/app/page";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface BusinessCardPreviewProps {
  data: BusinessCardData;
  isDetailMode?: boolean;
}

export function BusinessCardPreview({ data, isDetailMode }: BusinessCardPreviewProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/${data?.slug}`);
    }
  }, [data?.slug]);

  const downloadVCard = () => {
    // Generate and download vCard
    const vCardContent = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${data.name}`,
      `TITLE:${data.title}`,
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
            <Image src={data.imageCover} alt="Cover" fill className="object-cover" />
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

          <div className={`text-center ${!isDetailMode ? "mb-12" : "mb-6"}`}>
            <Button
              className="bg-[#0C76EA] hover:bg-[#0e4e8c] text-white py-5 px-6 rounded-full font-medium cursor-pointer w-60 text-base"
              onClick={downloadVCard}
            >
              Add to contacts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
