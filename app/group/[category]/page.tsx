"use client";
import { useEffect, useState } from "react";
import MyLightbox from "../../../components/my_lightbox";
import { useParams } from "next/navigation";

function GroupArtworks() {
  const [artworks, setArtworks] = useState([]);
  //   const [category, setCategory] = useState(null);
  const params = useParams();
  const category = params.category;
  const url = "/api/artworks?category=";

  useEffect(() => {
    async function getArtworks_internal() {
      try {
        // setCategory(cat);
        const response = await fetch(url + category);
        if (!response.ok) {
          throw new Error("Failed to fetch artworks");
        }
        const data = await response.json();
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      }
    }

    console.log("cat:", category);
    if (category) {
      getArtworks_internal();
    }
  }, [category]);

  return (
    <div>
      <MyLightbox artworks={artworks} />
    </div>
  );
}

export default GroupArtworks;
