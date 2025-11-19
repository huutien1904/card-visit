import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile, validateRowData, convertToProcessedData } from "@/lib/import-utils";
import { ImportResult, ImportCardData } from "@/types/import";
import { getTokenFromRequest, verifyToken } from "@/lib/auth-utils";
import { createSlug, generateUniqueSlug } from "@/lib/slug-utils";
import { COVER_IMAGES } from "@/lib/cover-images";

let admin: typeof import("firebase-admin");
let db: FirebaseFirestore.Firestore;

async function initializeFirebase() {
  if (!admin) {
    admin = await import("firebase-admin");

    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
    }

    db = admin.firestore();
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeFirebase();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Không có token xác thực" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Chỉ admin mới có quyền import file Excel",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "Không tìm thấy file",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        {
          error: "Chỉ chấp nhận file Excel (.xls, .xlsx) hoặc CSV (.csv)",
        },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File không được vượt quá 10MB",
        },
        { status: 400 }
      );
    }

    let excelData: ImportCardData[];
    try {
      excelData = await parseExcelFile(file);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || "Lỗi khi đọc file Excel",
        },
        { status: 400 }
      );
    }

    if (excelData.length === 0) {
      return NextResponse.json(
        {
          error: "File Excel không có dữ liệu",
        },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      totalRows: excelData.length,
      successRows: 0,
      errorRows: [],
      createdCards: [],
      message: "",
    };

    const batch = db.batch();

    for (let i = 0; i < excelData.length; i++) {
      const rowData = excelData[i];
      const rowIndex = i + 2;

      const validationErrors = validateRowData(rowData, rowIndex);

      if (validationErrors.length > 0) {
        result.errorRows.push({
          row: rowIndex,
          errors: validationErrors,
          data: rowData,
        });
        continue;
      }

      try {
        const processedData = convertToProcessedData(rowData);

        const baseSlug = createSlug(processedData.name);

        const existingSlugs: string[] = [];
        const allCards = await db.collection("cards").select("slug").get();
        allCards.docs.forEach((doc) => {
          const slug = doc.data().slug;
          if (slug) existingSlugs.push(slug);
        });

        const slug = generateUniqueSlug(baseSlug, existingSlugs);

        const cardRef = db.collection("cards").doc();
        const cardData: any = {
          name: processedData.name,
          title: processedData.title,
          company: processedData.company,
          phone1: processedData.phone1,
          email1: processedData.email1,
          address: processedData.address || "",
          avatar: "",
          imageCover: COVER_IMAGES.find((img) => img.id === processedData.coverImage)?.path || "/cover-digilife.png",
          slug,
          userId: user.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 0,
        };

        if (processedData.phone2) {
          cardData.phone2 = processedData.phone2;
        }
        if (processedData.email2) {
          cardData.email2 = processedData.email2;
        }

        batch.set(cardRef, cardData);
        result.createdCards.push(cardRef.id);
        result.successRows++;
      } catch (error: any) {
        result.errorRows.push({
          row: rowIndex,
          errors: [`Lỗi tạo card: ${error.message}`],
          data: rowData,
        });
      }
    }

    if (result.successRows > 0) {
      await batch.commit();
    }

    if (result.successRows === result.totalRows) {
      result.message = `Thành công! Đã tạo ${result.successRows} card.`;
    } else if (result.successRows > 0) {
      result.message = `Đã tạo ${result.successRows}/${result.totalRows} card. ${result.errorRows.length} dòng có lỗi.`;
      result.success = false;
    } else {
      result.message = `Không thể tạo card nào. Tất cả ${result.totalRows} dòng đều có lỗi.`;
      result.success = false;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Có lỗi xảy ra khi import dữ liệu",
      },
      { status: 500 }
    );
  }
}
