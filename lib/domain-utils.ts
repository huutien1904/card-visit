import { COVER_IMAGES } from "./cover-images";

const AI_DOMAIN = process.env.NEXT_PUBLIC_AI_DOMAIN || "https://card.vns.ai.vn";
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "https://card.vnsky.vn";
const DEV_DOMAIN = process.env.NEXT_PUBLIC_DEV_DOMAIN || "http://localhost:3000";

const DOMAIN_MAPPING = {
  "cover-digilife": AI_DOMAIN,
  "cover-vnsky": AI_DOMAIN,
  "cover-vns": MAIN_DOMAIN,
  "cover-vnsky-vns": MAIN_DOMAIN,
} as const;

function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost")
  );
}

export function getDomainForCover(imageCoverPath: string): string {
  if (isDevelopment()) {
    return DEV_DOMAIN;
  }

  const coverImage = COVER_IMAGES.find((cover) => cover.path === imageCoverPath);

  if (coverImage && coverImage.id in DOMAIN_MAPPING) {
    return DOMAIN_MAPPING[coverImage.id as keyof typeof DOMAIN_MAPPING];
  }

  return MAIN_DOMAIN;
}

export function getCardUrl(slug: string, imageCoverPath: string): string {
  const domain = getDomainForCover(imageCoverPath);
  return `${domain}/${slug}`;
}

export function getAllDomains() {
  return {
    ai: AI_DOMAIN,
    main: MAIN_DOMAIN,
    dev: DEV_DOMAIN,
  };
}

export function getDomainType(imageCoverPath: string): "ai" | "main" | "dev" {
  if (isDevelopment()) return "dev";

  const coverImage = COVER_IMAGES.find((cover) => cover.path === imageCoverPath);

  if (coverImage && (coverImage.id === "cover-digilife" || coverImage.id === "cover-vnsky")) {
    return "ai";
  }

  return "main";
}
