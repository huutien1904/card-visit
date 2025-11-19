import { CoverImageId } from "@/lib/cover-images";

export interface ImportCardData {
  "Họ và tên": string;
  "Chức vụ": string;
  "Tên công ty": string;
  "Số điện thoại 1": string;
  "Số điện thoại 2"?: string;
  "Email 1": string;
  "Email 2"?: string;
  "Địa chỉ"?: string;
  "Ảnh bìa": string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: {
    row: number;
    errors: string[];
    data: Partial<ImportCardData>;
  }[];
  createdCards: string[];
  message: string;
}

export interface ProcessedCardData {
  name: string;
  title: string;
  company: string;
  phone1: string;
  phone2?: string;
  email1: string;
  email2?: string;
  address?: string;
  coverImage: CoverImageId;
  [key: string]: any;
}
