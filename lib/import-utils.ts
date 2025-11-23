import { ImportCardData, ImportResult, ProcessedCardData } from "@/types/import";
import { COVER_IMAGES, CoverImageId } from "@/lib/cover-images";

export function validateExcelFile(file: File): string | null {
  const allowedTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/csv",
  ];

  if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
    return "Chỉ chấp nhận file Excel (.xls, .xlsx) hoặc CSV (.csv)";
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    return "File không được vượt quá 10MB";
  }

  return null;
}

export async function parseExcelFile(file: File): Promise<ImportCardData[]> {
  // Dynamic import xlsx to avoid build issues
  const XLSX = await import("xlsx");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  }) as string[][];

  // Lấy header từ dòng đầu tiên và trim whitespace
  const headers = (data[0] || []).map((header) => (header || "").toString().trim());
  const expectedHeaders = [
    "Họ và tên",
    "Chức vụ",
    "Tên công ty",
    "Số điện thoại 1",
    "Số điện thoại 2",
    "Email 1",
    "Email 2",
    "Địa chỉ",
    "Ảnh bìa",
  ];

  // Debug log
  console.log("Headers found:", headers);
  console.log("Expected headers:", expectedHeaders);

  // Kiểm tra các cột bắt buộc có đúng không
  const requiredHeaders = ["Họ và tên", "Chức vụ", "Tên công ty", "Số điện thoại 1", "Email 1", "Ảnh bìa"];
  const missingRequiredHeaders = requiredHeaders.filter((requiredHeader) => {
    return !headers.includes(requiredHeader);
  });

  if (missingRequiredHeaders.length > 0) {
    throw new Error(
      `Header thiếu các cột bắt buộc: ${missingRequiredHeaders.join(", ")}. Headers thực tế: [${headers.join(", ")}]`
    );
  }

  // Kiểm tra có đủ số lượng cột tối thiểu không
  if (headers.length < 9) {
    throw new Error(`File phải có ít nhất 9 cột. Hiện tại chỉ có ${headers.length} cột.`);
  }

  // Tạo map để tìm index của từng header
  const headerMap: { [key: string]: number } = {};
  expectedHeaders.forEach((header) => {
    const index = headers.indexOf(header);
    if (index >= 0) {
      headerMap[header] = index;
    }
  });

  // Chuyển đổi dữ liệu từ dòng thứ 2 trở đi
  const rows = data.slice(1).filter((row) => row && row.length > 0);
  return rows.map((row) => ({
    "Họ và tên": (row[headerMap["Họ và tên"]] || "").toString().trim(),
    "Chức vụ": (row[headerMap["Chức vụ"]] || "").toString().trim(),
    "Tên công ty": (row[headerMap["Tên công ty"]] || "").toString().trim(),
    "Số điện thoại 1": (row[headerMap["Số điện thoại 1"]] || "").toString().trim(),
    "Số điện thoại 2": (row[headerMap["Số điện thoại 2"]] || "").toString().trim(),
    "Email 1": (row[headerMap["Email 1"]] || "").toString().trim(),
    "Email 2": (row[headerMap["Email 2"]] || "").toString().trim(),
    "Địa chỉ": (row[headerMap["Địa chỉ"]] || "").toString().trim(),
    "Ảnh bìa": (row[headerMap["Ảnh bìa"]] || "").toString().trim(),
  }));
}

export function validateRowData(data: ImportCardData, rowIndex: number): string[] {
  const errors: string[] = [];

  // Kiểm tra các trường bắt buộc
  if (!data["Họ và tên"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Họ và tên không được để trống`);
  }

  if (!data["Chức vụ"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Chức vụ không được để trống`);
  }

  if (!data["Tên công ty"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Tên công ty không được để trống`);
  }

  if (!data["Số điện thoại 1"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Số điện thoại 1 không được để trống`);
  }

  if (!data["Email 1"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Email 1 không được để trống`);
  }

  if (!data["Ảnh bìa"]?.trim()) {
    errors.push(`Dòng ${rowIndex}: Ảnh bìa không được để trống`);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data["Email 1"] && !emailRegex.test(data["Email 1"])) {
    errors.push(`Dòng ${rowIndex}: Email 1 không đúng định dạng`);
  }

  if (data["Email 2"] && !emailRegex.test(data["Email 2"])) {
    errors.push(`Dòng ${rowIndex}: Email 2 không đúng định dạng`);
  }

  // Validate phone number format (basic)
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (data["Số điện thoại 1"] && !phoneRegex.test(data["Số điện thoại 1"])) {
    errors.push(`Dòng ${rowIndex}: Số điện thoại 1 không đúng định dạng`);
  }

  if (data["Số điện thoại 2"] && !phoneRegex.test(data["Số điện thoại 2"])) {
    errors.push(`Dòng ${rowIndex}: Số điện thoại 2 không đúng định dạng`);
  }

  // Validate cover image
  if (data["Ảnh bìa"]) {
    const coverImageNames = COVER_IMAGES.map((img) => img.name);
    if (!coverImageNames.includes(data["Ảnh bìa"] as any)) {
      errors.push(`Dòng ${rowIndex}: Ảnh bìa phải là một trong: ${coverImageNames.join(", ")}`);
    }
  }

  return errors;
}

export function convertToProcessedData(data: ImportCardData): ProcessedCardData {
  const coverImage = COVER_IMAGES.find((img) => img.name === data["Ảnh bìa"]);

  const result: any = {
    name: data["Họ và tên"].trim(),
    title: data["Chức vụ"].trim(),
    company: data["Tên công ty"].trim(),
    phone1: data["Số điện thoại 1"].trim(),
    email1: data["Email 1"].trim(),
    coverImage: (coverImage?.id as CoverImageId) || "cover-digilife",
  };

  const phone2 = data["Số điện thoại 2"]?.trim();
  if (phone2) {
    result.phone2 = phone2;
  }

  const email2 = data["Email 2"]?.trim();
  if (email2) {
    result.email2 = email2;
  }

  const address = data["Địa chỉ"]?.trim();
  if (address) {
    result.address = address;
  }

  return result as ProcessedCardData;
}
