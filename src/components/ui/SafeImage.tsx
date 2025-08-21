"use client";

import Image from "next/image";

interface SafeImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const fallbackSrc =
  "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID/o/assets%2Fplaceholder.png?alt=media";

export default function SafeImage({
  src,
  alt = "Placeholder",
  width = 600,
  height = 400,
  className = "rounded-xl object-cover",
}: SafeImageProps) {
  return (
    <Image
      src={src || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
tsx
"use client";

import Image from "next/image";

interface SafeImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const fallbackSrc =
  "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID/o/assets%2Fplaceholder.png?alt=media";

export default function SafeImage({
  src,
  alt = "Placeholder",
  width = 600,
  height = 400,
  className = "rounded-xl object-cover",
}: SafeImageProps) {
  return (
    <Image
      src={src || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}