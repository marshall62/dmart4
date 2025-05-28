'use client';
import Image from "next/image";
import styles from "./Home.module.css";
import { useEffect, useState } from "react";
export default function Home() {
  const [artwork, setArtwork] = useState()
  
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch('/api/artworks?tag=home');
        if (!response.ok) {
          throw new Error('Failed to fetch artwork');
        }
        const data = await response.json();
        if (data.length > 0) {
          setArtwork(data[0]);
        }
      } catch (error) {
        console.error('Error fetching artwork:', error);
      }
    };
    fetchArtwork();
  }, [])
  
  return (
    <div className={styles.homeImageContainer}>
      {artwork && 
      <img alt="home" className={styles.homeImage} src={artwork.midsize_image_url}/>
}
    </div>
  );
}
