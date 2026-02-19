"use client";
import MyLightbox from "@/components/my_lightbox";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { Artwork } from "../../types/artwork";

export default function SearchClient() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const url = "/api/artworks";
  const searchParams = useSearchParams();
  const term = searchParams?.get("term") || "";

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function getArtworks_internal() {
      try {
        const searchParam = term ? `?search=${encodeURIComponent(term)}` : "";
        const response = await fetch(url + searchParam, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch artworks");
        }
        const data = await response.json();
        if (mounted) setArtworks(data);
      } catch (error) {
        if ((error as any).name === "AbortError") return;
        console.error("Error fetching artworks:", error);
      }
    }
    if (term) getArtworks_internal();
    else setArtworks([]);

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [term]);

  return (
    <>
      {artworks.length > 0 ? (
        <Suspense fallback={<div>Loading...</div>}>
          <MyLightbox artworks={artworks} />
        </Suspense>
      ) : (
        <span>No results</span>
      )}
    </>
  );
}
