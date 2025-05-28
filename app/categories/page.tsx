'use client';
import { useEffect, useState } from "react";
import styles from './Categories.module.css';
import { useRouter } from "next/navigation";
import { Artwork } from "../../types/artwork";

function Categories () {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const router = useRouter();
  const url = 'api/artworks?exemplars=true';

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

  const handleClick = (href) => {
    router.push(`/${href}`);
  }

  // return(<div></div>)
  return(
    <div className={styles.wrapper}>
  {artworks.map((aw, i) => {
    let url = aw.midsize_image_url;
    let categoryHref = `group/${aw.category_name}`;
      return (<div key={i} className={styles.gridItem}>
      <img alt="an artwork" src={url} onClick={() => handleClick(categoryHref)}/>
      <div className={styles.caption}>
        <a href={categoryHref}>{aw.category_name}</a>
      </div>
      
      </div>);
  })}
</div>
  )
}

export default Categories;