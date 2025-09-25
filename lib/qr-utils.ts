import type { BusinessCardData } from "@/app/page";
import QRCode from "qrcode";

export function generateVCard(data: BusinessCardData): string {
  // Tách họ và tên để có format đúng
  const nameParts = data.name.trim().split(" ");
  const lastName = nameParts[nameParts.length - 1] || "";
  const firstName = nameParts.slice(0, -1).join(" ") || "";

  const vCardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.name}`, // Full Name - tên đầy đủ
    `N:${lastName};${firstName};;;`, // Name - họ;tên
    data.company ? `ORG:${data.name}` : "",
    data.title ? `TITLE:${data.title}` : "",
    data.email ? `EMAIL:${data.email}` : "",
    data.phone ? `TEL:${data.phone}` : "",
    data.website ? `URL:${data.website}` : "",
    data.address ? `ADR:;;${data.address};;;;` : "",
    data.bio ? `NOTE:${data.bio}` : "",
    data.linkedin ? `URL;type=LinkedIn:${data.linkedin}` : "",
    data.twitter ? `URL;type=Twitter:${data.twitter}` : "",
    "END:VCARD",
  ];

  // Lọc bỏ các dòng trống và join lại
  const vCard = vCardLines.filter((line) => line.trim() !== "").join("\n");

  return vCard;
}

export async function generateQRCode(data: BusinessCardData): Promise<string> {
  try {
    const vCardData = generateVCard(data);

    const qrDataUrl = await QRCode.toDataURL(vCardData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

export function downloadQRCode(qrCodeData: string, fileName: string) {
  const link = document.createElement("a");
  link.href = qrCodeData;
  link.download = `${fileName}-qr-code.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
