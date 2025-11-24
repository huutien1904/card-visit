import { NextRequest, NextResponse } from "next/server";

interface RecaptchaVerifyRequest {
  token: string;
}

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RecaptchaVerifyRequest = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: "Missing reCAPTCHA token" }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({ success: false, error: "reCAPTCHA not configured" }, { status: 500 });
    }

    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      }),
    });

    const verifyData: RecaptchaResponse = await verifyResponse.json();

    if (!verifyData.success) {
      console.error("reCAPTCHA verification failed:", verifyData["error-codes"]);
      return NextResponse.json(
        {
          success: false,
          error: "reCAPTCHA verification failed",
          details: verifyData["error-codes"],
        },
        { status: 400 }
      );
    }

    if (typeof verifyData.score === "number") {
      const minScore = 0.5; // Điểm tối thiểu để được chấp nhận
      if (verifyData.score < minScore) {
        return NextResponse.json(
          {
            success: false,
            error: "Security verification failed",
            score: verifyData.score,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      score: verifyData.score,
      message: "Xác thực thành công",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
