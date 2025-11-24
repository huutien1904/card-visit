import type { BusinessCardData } from "@/app/page";
import QRCode from "qrcode";

export function generateVCard(data: BusinessCardData): string {
  // Tách họ và tên để có format đúng cho vCard
  const nameParts = data.name.trim().split(" ");
  const lastName = nameParts[nameParts.length - 1] || "";
  const firstName = nameParts.slice(0, -1).join(" ") || "";

  const vCardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.name}`, // Full Name - tên đầy đủ
    `N:${lastName};${firstName};;;`, // Name - họ;tên;;;
    data.company ? `ORG:${data.company}` : "", // Sửa: dùng data.company thay vì data.name
    data.title ? `TITLE:${data.title}` : "",
    data.email1 ? `EMAIL;TYPE=WORK:${data.email1}` : "", // Email chính
    data.email2 ? `EMAIL;TYPE=HOME:${data.email2}` : "", // Email phụ
    data.phone1 ? `TEL;TYPE=WORK,VOICE:${data.phone1}` : "", // Phone chính
    data.phone2 ? `TEL;TYPE=CELL:${data.phone2}` : "", // Phone phụ
    data.address ? `ADR;TYPE=WORK:;;${data.address};;;;` : "", // Địa chỉ làm việc
    data.avatar ? `PHOTO:${data.avatar}` : "", // Avatar/Photo
    "END:VCARD",
  ];

  // Lọc bỏ các dòng trống và join lại
  const vCard = vCardLines.filter((line) => line.trim() !== "").join("\r\n");

  return vCard;
}

export async function generateQRCode(data: BusinessCardData): Promise<string> {
  try {
    // Import domain utils để lấy URL đúng domain
    const { getCardUrl } = await import("./domain-utils");

    // Tạo QR code với URL của card thay vì vCard data
    const cardUrl = getCardUrl(data.slug, data.imageCover);

    const qrDataUrl = await QRCode.toDataURL(cardUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M", // Medium error correction
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

export function downloadQRCode(qrCodeData: string, fileName: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  if (isIOS && isSafari) {
    window.open(qrCodeData, "_blank");
    return;
  }

  setTimeout(() => {
    try {
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `${fileName}-qr-code.png`;
      link.setAttribute("type", "image/png");

      document.body.appendChild(link);
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      window.open(qrCodeData, "_blank");
    }
  }, 100);
}
