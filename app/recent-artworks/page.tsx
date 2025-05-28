'use client';
import { useEffect, useState, useContext } from "react";
import MyLightbox from "../../components/my_lightbox";

function RecentArtworks () {
  const [artworks, setArtworks] = useState([]);
  const url = '/api/artworks?recent=true';
  
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

  return (
    <div><MyLightbox artworks={artworks}/></div>
    
  )
    
}

export default RecentArtworks;