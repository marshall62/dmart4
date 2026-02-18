"use client";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import "./my-lightbox.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { Artwork } from "../types/artwork";
import { useEffect, useRef } from "react";

export default function MyLightbox({ artworks }: { artworks: Artwork[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const galleryRef = useRef<ImageGallery>(null);
  const hasInitialized = useRef(false);

  const images = artworks
    ? artworks.map((aw) => {
        const z = {
          original: aw.image_url,
          fullscreen: aw.midsize_image_url,
          thumbnail: aw.thumbnail_image_url,
          description: `${aw.title}, ${aw.width} X ${aw.height}, ${aw.year}, ${aw.media}`,
        };
        return z;
      })
    : [];

  useEffect(() => {
    if (!hasInitialized.current && galleryRef.current && artworks.length > 0) {
      const indexParam = searchParams?.get("index");
      if (indexParam) {
        const targetIndex = parseInt(indexParam, 10);
        if (
          !isNaN(targetIndex) &&
          targetIndex >= 0 &&
          targetIndex < artworks.length
        ) {
          galleryRef.current.slideToIndex(targetIndex);
        }
      }
      hasInitialized.current = true;
    }
  }, [artworks, searchParams]);

  // When the large image changes (a slide) update the URL to include the artwork id and index
  // but preserve any existing search params (for example `term`). This prevents clearing the
  // current search when a thumbnail is selected.
  // Prefer window.location.search as the authoritative current query string to avoid
  // dropping params if useSearchParams is stale during an interaction like clicking
  // a thumbnail.
  const handleSlideChange = (index: number) => {
    if (!artworks || !artworks[index]) return;
    // Use window.location.search which reflects the current URL in the browser.
    const current = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(
      current.startsWith("?") ? current.substring(1) : current,
    );
    params.set("artwork", artworks[index].id.toString());
    params.set("index", index.toString());
    router.push("?" + params.toString());
  };

  console.log("isMobile:", isMobile);

  // const isPhoneInLandscapeMode = window.matchMedia("(orientation: landscape) and (max-width: 768px)").matches;
  return (
    <div className="image-gallery-description">
      <ImageGallery
        ref={galleryRef}
        showThumbnails={!isMobile}
        onSlide={handleSlideChange}
        showIndex={true}
        items={images}
      ></ImageGallery>
    </div>
  );
}
