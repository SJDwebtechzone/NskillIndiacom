import { useEffect, useState } from "react";

interface BgImage {
  id: number;
  name: string;
  image_url: string;
  category: string;
  is_active: boolean;
}

export function useBackgroundImage(category?: string) {
  const [bgImage, setBgImage] = useState<BgImage | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchBgImage = async () => {
      try {
        const url = category
          ? `${API}/api/background-images/active?category=${encodeURIComponent(category)}`
          : `${API}/api/background-images/active`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.image) {
          setBgImage(data.image);
          const imgUrl = data.image.image_url;
          const cleaned = imgUrl.replace(/\\/g, "/");
          const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
          setBgImageUrl(`${API}${withSlash}`);
        }
      } catch (err) {
        console.error("Failed to fetch background image", err);
      }
    };
    fetchBgImage();
  }, [category]);

  return { bgImage, bgImageUrl };
}