'use client'
import MyLightbox from "@/components/my_lightbox";
import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

export default function SearchArtworks() {
    const [artworks, setArtworks] = useState([]);
    const url = '/api/artworks';
    const [searchTerm, setSearchTerm] = useState<string | null>(null);
    // const searchParams = useSearchParams();
    // const searchTerm = searchParams.get('term');

    // Extract the search term from the URL on the client side
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get('term'));
  }, []);

    useEffect(() => {
        async function getArtworks_internal () {
            try {
                const searchParam = searchTerm ? `?search=${searchTerm}` : '';
                const response = await fetch(url+searchParam);
                if (!response.ok) {
                  throw new Error('Failed to fetch artworks');
                }
                const data = await response.json();
                setArtworks(data);
              } catch (error) {
                console.error('Error fetching artworks:', error);
              }
        }
        if (searchTerm) {
            getArtworks_internal();
        }

    }, [ searchTerm])

    return (
    <Suspense fallback={<div>Loading...</div>}>
        {(artworks.length > 0) ? <MyLightbox artworks={artworks}/> : <span>No results</span>}
    </Suspense>
    )

}
