import type { WPImage } from "./types";

export interface ImageProps {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export function getImageProps(image?: { node: WPImage } | null): ImageProps | null {
  if (!image?.node?.sourceUrl) return null;

  const { sourceUrl, altText, mediaDetails } = image.node;

  return {
    src: sourceUrl,
    width: mediaDetails?.width || 1200,
    height: mediaDetails?.height || 630,
    alt: altText || "",
  };
}

// Returns a blurred data URL placeholder for next/image.
// Requires `plaiceholder` and `sharp` installed.
export async function getBlurDataUrl(src: string): Promise<string | undefined> {
  try {
    const { getPlaiceholder } = await import("plaiceholder");
    const res = await fetch(src);
    const buffer = Buffer.from(await res.arrayBuffer());
    const { base64 } = await getPlaiceholder(buffer, { size: 10 });
    return base64;
  } catch {
    return undefined;
  }
}
