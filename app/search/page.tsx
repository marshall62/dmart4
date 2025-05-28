'use client';
import MyLightbox from "@/components/my_lightbox";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchArtworks() {
    const [artworks, setArtworks] = useState([]);
    const searchParams = useSearchParams();
    const url = '/api/artworks';

    useEffect(() => {
        let ignore=false;
        const searchTerm = searchParams.get('term');
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
        return () => {
            ignore = true;
        };
    }, [ searchParams])

    if (artworks.length > 0) 
        return (
          <MyLightbox artworks={artworks}/> 
        )
      else
          return (<div>No results found</div>)
}
