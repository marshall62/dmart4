'use client';
import MyLightbox from "@/components/my_lightbox";
import { Suspense, useEffect, useState } from "react";

export default function SearchArtworks({ searchParams}: { searchParams: { term?: string } }) {
    const [artworks, setArtworks] = useState([]);
    const url = '/api/artworks';

    useEffect(() => {
        const searchTerm = searchParams.term;
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

    }, [ searchParams])

    return (
    <Suspense fallback={<div>Loading...</div>}>
        {(artworks.length > 0) ? <MyLightbox artworks={artworks}/> : <span>No results</span>}
    </Suspense>
    )

}
