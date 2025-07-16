'use client';
import styles from "./Home.module.css";
import { useEffect, useState } from "react";
import { SelectArtwork } from "@/lib/db";
export default function Home() {
  const [artwork, setArtwork] = useState<SelectArtwork | undefined>(undefined)
  
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
      {artwork && artwork.midsize_image_url &&
      <img alt="home" className={`${styles.homeImage} ml-4`} src={artwork.midsize_image_url}/>
}
    </div>
  );
}
