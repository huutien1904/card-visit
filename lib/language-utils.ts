// Job title translations
export const JOB_TITLE_TRANSLATIONS: { [key: string]: string } = {
  // Executive Level
  "Chủ tịch Công ty": "Chairman",
  "Chủ tịch": "Chairman",
  "Tổng Giám đốc": "General Director",
  "Giám đốc điều hành": "Chief Executive Officer",
  "Cố vấn Ban Lãnh đạo": "Senior Advisor to the Board",
  "Phó Tổng Giám đốc": "Deputy General Director",
  "Giám đốc": "Director",
  "Phó Giám đốc": "Deputy Director",

  // Branch & Regional Management
  "Giám đốc chi nhánh Công ty tại Hồ Chí Minh": "Ho Chi Minh City Branch Director",
  "Giám đốc chi nhánh": "Branch Director",
  "Quản lý kinh doanh địa bàn Hồ Chí Minh": "HCMC Territory Sales Manager",
  "Quản lý vùng": "Regional Manager",
  "Quản lý khu vực": "Area Manager",

  // Department Heads
  "Trưởng phòng": "Department Manager",
  "Phó phòng Kinh doanh": "Deputy Head of Sales",
  "Phó Phòng Kinh Doanh": "Deputy Head of Sales",
  "Phó phòng Phát triển dịch vụ": "Deputy Head of Service Development",
  "Phó Phòng Phát Triển Dịch Vụ": "Deputy Head of Service Development",
  "Phó phòng Công nghệ thông tin": "Deputy Head of IT",
  "Phó Phòng Công Nghệ Thông Tin": "Deputy Head of IT",
  "Phó phòng Tổ chức - Hành chính": "Deputy Head of Administration & HR",
  "Phó Phòng Tổ Chức - Hành Chính": "Deputy Head of Administration & HR",
  "Trưởng phòng tài chính kế hoạch": "Financial Planning Manager",
  "Trưởng phòng Nhân sự": "HR Manager",
  "Trưởng phòng Kế toán": "Accounting Manager",
  "Trưởng phòng Marketing": "Marketing Manager",
  "Trưởng phòng Kinh doanh": "Sales Manager",
  "Trưởng phòng IT": "IT Manager",

  // Team Leaders
  "Trưởng nhóm chăm sóc khách hàng": "Customer Care Team Leader",
  "Trưởng nhóm vận hành ứng dụng": "Application Operations Team Leader",
  "Trưởng nhóm quản trị hạ tầng": "Infrastructure Management Team Leader",
  "Trưởng nhóm kế toán": "Accounting Team Leader",
  "Trưởng nhóm": "Team Leader",
  "Trưởng ca": "Shift Supervisor",

  // Specialists & Executives
  "Chuyên viên bán hàng và phát triển thị trường": "Sales & Market Development Specialist",
  "Chuyên viên kinh doanh": "Sales Executive",
  "Chuyên viên marketing": "Marketing Executive",
  "Chuyên viên phát triển dịch vụ": "Service Development Executive",
  "Chuyên viên công nghệ thông tin": "IT Specialist",
  "Chuyên viên kho": "Warehouse Specialist",
  "Chuyên viên kế toán thanh toán, công nợ": "Accounts Payable & Receivable Accountant",
  "Chuyên viên kế toán thuế, ngân hàng": "Tax & Banking Accountant",
  "Chuyên viên": "Specialist",

  // Accounting
  "Kế toán tổng hợp": "General Accountant",
  "Kế toán kho": "Inventory Accountant",
  "Kế toán": "Accountant",
  "Kế toán trưởng": "Chief Accountant",

  // HR & Admin
  "Chuyên viên Chính sách Phúc lợi và Tiền lương": "Compensation & Benefits Specialist",
  "Chuyên viên tuyển dụng": "Recruitment Specialist",
  "Chuyên viên hành chính": "Administrative Officer",
  "Chuyên viên đào tạo và phát triển văn hoá DN": "Training & Corporate Culture Development Specialist",
  "Chuyên viên Pháp chế": "Legal Specialist",
  "Chuyên viên Hành chính - Nhân sự tổng hợp": "General Admin & HR Specialist",

  // Customer Service
  "Nhân viên Chăm sóc khách hàng": "Customer Service Representative",
  "Nhân viên chăm sóc khách hàng": "Customer Service Representative",
  "Giao dịch viên": "Teller",

  // Other Positions
  "Nhân viên Lái xe": "Driver",
  "Nhân viên": "Employee",
  "Thư ký": "Secretary",
  "Trợ lý": "Assistant",
  "Thực tập sinh": "Intern",
};

// Function to remove Vietnamese accents
export function removeVietnameseAccents(str: string): string {
  if (!str) return "";

  const accentsMap: { [key: string]: string } = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("");
}

export function translateJobTitle(vietnameseTitle: string): string {
  if (!vietnameseTitle) return "";

  if (JOB_TITLE_TRANSLATIONS[vietnameseTitle]) {
    return JOB_TITLE_TRANSLATIONS[vietnameseTitle];
  }

  const normalizedTitle = vietnameseTitle.trim().replace(/\s+/g, " ");
  if (JOB_TITLE_TRANSLATIONS[normalizedTitle]) {
    return JOB_TITLE_TRANSLATIONS[normalizedTitle];
  }

  const titleLowerCase = normalizedTitle.toLowerCase();
  for (const [key, value] of Object.entries(JOB_TITLE_TRANSLATIONS)) {
    if (key.toLowerCase() === titleLowerCase) {
      return value;
    }
  }

  return vietnameseTitle;
}

export const translateCompanyName = (vietnameseCompany: string): string => {
  if (!vietnameseCompany) return "";

  const companyUpper = vietnameseCompany.toUpperCase();

  if (companyUpper.includes("DIGILIFE")) {
    return "DIGILIFE VIET NAM DIGITAL SERVICES COMPANY LIMITED";
  }

  if (companyUpper.includes("CÔNG NGHỆ VÀ GIẢI PHÁP")) {
    return "VIETNAM TECHNOLOGY AND DIGITAL SOLUTIONS CORPORATION";
  }

  return removeVietnameseAccents(vietnameseCompany);
};
