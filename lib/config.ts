/**
 * Environment Configuration
 * Centralized config for all environment variables
 */

// Get current environment
export const ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = ENV === "production";
export const IS_DEVELOPMENT = ENV === "development";

// API URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Firebase Client Config (Public)
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase Admin Config (Server-side only)
export const FIREBASE_ADMIN_CONFIG = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

// Log environment on server startup
if (typeof window === "undefined") {
  console.log("🌍 Environment:", ENV);
  console.log("🔗 API URL:", API_URL);
  console.log("🌐 App URL:", APP_URL);
  console.log("🔥 Firebase Project:", FIREBASE_CONFIG.projectId);
}
