"use client";

import type { BusinessCardData } from "@/app/page";
import { Button } from "@/components/ui/button";
import { removeVietnameseAccents, translateJobTitle } from "@/lib/language-utils";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BusinessCardPreviewProps {
  data: BusinessCardData;
  isDetailMode?: boolean;
}

export function BusinessCardPreview({ data, isDetailMode }: BusinessCardPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${data?.slug}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
    }
  }, [data?.slug]);

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const getDisplayName = () => {
    return isEnglish ? removeVietnameseAccents(data?.name || "") : data?.name || "";
  };

  const getDisplayTitle = () => {
    return isEnglish ? translateJobTitle(data?.title || "") : data?.title || "";
  };

  const getDisplayCompany = () => {
    return isEnglish ? removeVietnameseAccents(data?.company || "") : data?.company || "";
  };

  const getDisplayAddress = () => {
    return isEnglish ? removeVietnameseAccents(data?.address || "") : data?.address || "";
  };

  const downloadVCard = async () => {
    const displayName = getDisplayName();
    const displayTitle = getDisplayTitle();
    const displayAddress = getDisplayAddress();

    const vCardContent = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${displayName}`,
      `TITLE:${displayTitle}`,
      data.phone1 ? `TEL:${data.phone1}` : "",
      data.phone2 ? `TEL:${data.phone2}` : "",
      data.email1 ? `EMAIL:${data.email1}` : "",
      data.email2 ? `EMAIL:${data.email2}` : "",
      displayAddress ? `ADR:;;${displayAddress};;;;` : "",
      "END:VCARD",
    ]
      .filter((line) => line.trim() !== "")
      .join("\n");

    // Detect device type
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    // Tạo data URL cho vCard
    const dataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardContent)}`;

    if (isMobile) {
      // Thử Web Share API trước (cho iOS modern)
      if (navigator.share && navigator.canShare) {
        try {
          const blob = new Blob([vCardContent], { type: "text/vcard" });
          const file = new File([blob], `${displayName}.vcf`, { type: "text/vcard" });
          
          const canShareFile = navigator.canShare({ files: [file] });
          
          if (canShareFile) {
            await navigator.share({
              title: `Contact - ${displayName}`,
              text: `Contact information for ${displayName}`,
              files: [file],
            });
            return;
          }
        } catch (error) {
          console.log("Web Share API with file failed:", error);
        }
      }

      // Trên mobile: Mở data URL trực tiếp để trigger contact app
      try {
        // Tạo một link ẩn và click để mở contact app
        const link = document.createElement('a');
        link.href = dataUrl;
        link.style.display = 'none';
        
        // Thêm các attributes để đảm bảo mở contact app
        link.setAttribute('download', `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`);
        link.setAttribute('type', 'text/vcard');
        
        document.body.appendChild(link);
        
        // Trigger click event
        if (isIOS) {
          // iOS: Thử nhiều cách để mở contact app
          // Cách 1: Sử dụng window.open với data URL
          const contactWindow = window.open(dataUrl, '_blank');
          
          // Cách 2: Fallback với location.href
          if (!contactWindow) {
            setTimeout(() => {
              window.location.href = dataUrl;
            }, 100);
          }
        } else if (isAndroid) {
          // Android: Click link để trigger intent
          link.click();
          
          // Fallback: Thử mở với window.location
          setTimeout(() => {
            if (link.parentNode) {
              window.location.href = dataUrl;
            }
          }, 500);
        } else {
          // Mobile khác: Click thông thường
          link.click();
        }
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
        }, 1000);
        
        return;
      } catch (error) {
        console.log("Direct contact app opening failed:", error);
      }
    }

    // Fallback cho desktop hoặc khi mobile method fails
    // Tạo blob và force download
    try {
      const blob = new Blob([vCardContent], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
      link.setAttribute("type", "text/vcard");
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("VCard creation failed:", error);
      // Final fallback: copy contact info to clipboard
      const contactText = `${displayName}\n${displayTitle}\n${data.phone1 || ''}\n${data.email1 || ''}`;
      navigator.clipboard?.writeText(contactText);
      alert("Đã copy thông tin liên hệ vào clipboard!");
    }
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
                <div className="w-45 h-45 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Avatar</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-primary-blue">{getDisplayName()}</h1>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <p className="text-primary-blue text-base">{getDisplayTitle()}</p>
            {data?.company && (
              <p className="text-primary-blue text-sm mt-1 font-medium">
                {isEnglish ? "Company" : "Công ty"} {getDisplayCompany()}
              </p>
            )}
          </div>

          <div className="mb-6">
            <div className="flex gap-4">
              <div className="w-[70%] space-y-3">
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
                    <a href={`tel:${data.phone2}`} className="text-primary-blue hover:underline text-base">
                      {data.phone2}
                    </a>
                  </div>
                )}

                {data?.email1 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      <Image src="/iconEmail.png" alt="Email" width={24} height={24} className="w-7 h-7" />
                    </div>
                    <a href={`mailto:${data.email1}`} className="text-primary-blue hover:underline break-all text-base">
                      {data.email1}
                    </a>
                  </div>
                )}

                {data?.email2 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      <Image src="/iconEmail.png" alt="Email" width={24} height={24} className="w-7 h-7" />
                    </div>
                    <a href={`mailto:${data.email2}`} className="text-primary-blue hover:underline break-all text-base">
                      {data.email2}
                    </a>
                  </div>
                )}
              </div>

              <div className="w-[30%] flex justify-center ">
                <div className="w-18 h-18 bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {data?.address && (
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <Image src="/iconAddress.png" alt="Address" width={24} height={24} className="w-7 h-7" />
                </div>
                <p className="text-primary-blue leading-normal text-base">{getDisplayAddress()}</p>
              </div>
            )}
          </div>

          <div className={`flex sm:flex-row gap-3 justify-center items-center ${!isDetailMode ? "mb-12" : "mb-6"}`}>
            <Button
              className="bg-[#0C76EA] hover:bg-[#0e4e8c] text-white py-5 px-6 rounded-full font-medium cursor-pointer w-48 text-base"
              onClick={downloadVCard}
            >
              {isEnglish ? "Add to contacts" : "Lưu liên hệ"}
            </Button>
            <Button
              variant="outline"
              className="border-[#0C76EA] text-[#0C76EA] hover:bg-[#0C76EA] hover:text-white py-5 px-6 rounded-full font-medium cursor-pointer w-32 text-base flex items-center gap-1"
              onClick={toggleLanguage}
            >
              {isEnglish ? (
                <Image
                  src="/flag-icon-vietnam.png"
                  alt="Vietnam Flag"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded object-cover"
                />
              ) : (
                <Image
                  src="/flag-icon-en.png"
                  alt="UK Flag"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded object-cover"
                />
              )}
              {isEnglish ? "VI" : "EN"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
