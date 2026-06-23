"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

interface ResilientImageProps extends Omit<ImageProps, "src" | "onError"> {
  /** Primary image source. */
  src: string;
  /** Ordered fallback sources tried if the primary (or prior fallback) fails. */
  fallbacks?: string[];
}

/**
 * An <Image> that never leaves an empty hole. It walks through the provided
 * fallback sources on error and, if everything fails, renders a tasteful
 * forest gradient placeholder so a card is never blank. Always wrapped in a
 * coloured container, so even mid-load there is a premium surface behind it.
 */
export function ResilientImage({
  src,
  fallbacks = [],
  alt,
  className,
  ...rest
}: ResilientImageProps) {
  const sources = useMemo(() => [src, ...fallbacks, "/images/placeholder-travel.jpg"], [src, fallbacks]);
  const [imageState, setImageState] = useState({
    src,
    sourceIndex: 0,
    exhausted: false,
  });

  if (imageState.src !== src) {
    setImageState({ src, sourceIndex: 0, exhausted: false });
  }

  const sourceIndex = imageState.src === src ? imageState.sourceIndex : 0;
  const exhausted = imageState.src === src && imageState.exhausted;

  const handleError = () => {
    setImageState((current) => {
      if (current.src !== src) return { src, sourceIndex: 0, exhausted: false };
      if (current.sourceIndex + 1 < sources.length) {
        return { ...current, sourceIndex: current.sourceIndex + 1 };
      }
      return { ...current, exhausted: true };
    });
  };

  if (exhausted) {
    const isFilled = !!rest.fill;
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-linear-to-br from-forest-700 via-forest-800 to-forest-950 ${isFilled ? "absolute inset-0 w-full h-full" : ""} ${className ?? ""}`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
          className="h-10 w-10 text-mist-50/30"
        >
          <path
            d="M6 34l9-11 7 8 6-7 8 10M6 34h32M6 34V14h32v20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="18" r="2.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={sources[sourceIndex]}
      alt={alt}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}
