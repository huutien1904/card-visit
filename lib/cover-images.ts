export const COVER_IMAGES = [
  {
    id: "cover-digilife",
    name: "DigiLife",
    path: "/cover-digilife.png",
    preview: "/cover-digilife.png",
  },
  {
    id: "cover-vns",
    name: "VNS",
    path: "/cover-vns.png",
    preview: "/cover-vns.png",
  },
  {
    id: "cover-vnsky",
    name: "VN Sky",
    path: "/cover-vnsky.png",
    preview: "/cover-vnsky.png",
  },
  {
    id: "cover-vnsky-vns",
    name: "VN Sky VNS",
    path: "/cover-vnsky-vns.png",
    preview: "/cover-vnsky-vns.png",
  },
] as const;

export type CoverImageId = (typeof COVER_IMAGES)[number]["id"];
