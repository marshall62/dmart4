'use client';
import MyLightbox from "../../components/my_lightbox";
import { Artwork } from "../../types/artwork";
import { useState, useEffect } from "react";


function AllArtworks () {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const url = '/api/artworks';

useEffect(() => {
  const fetchArtworks = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }
      const data = await response.json();
      setArtworks(data);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };
    fetchArtworks();
}
  , []);
  
console.log('artworks:',artworks);

  return (
    <div><MyLightbox artworks={artworks}/> </div>
    
  )
    
}

export default AllArtworks;