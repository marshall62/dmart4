'use client';

import "./globals.css";
import Navbar from '@/components/navigation/navbar';
import { SelectArtwork } from "@/lib/db";
import { useEffect, useState } from "react";
import { GlobalProvider } from "./context/GlobalContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [artworks, setArtworks] = useState<SelectArtwork[]>([]);
  // const GlobalContext = createContext<GlobalContextType | undefined>(undefined);



  useEffect (() => {
    const login =  async () => {    

      try {
        const resp = await fetch("/api/artworks");
        if (!resp.ok) {
          throw new Error("Failed to fetch artworks");
        }
        const artworksJson = await resp.json();
        const allArtworks = artworksJson as SelectArtwork[];
        // const artistConfig = await fetch("/api/artist");
        const config = {}
        setArtworks(allArtworks);

      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to log in", err.message);
        } else {
          console.error("Failed to log in", err);
        }     
      }
    }
    
    login();

  },[]);


  return (
    <html>
      <body>
        <div className="container flex flex-col">
          <Navbar/>
          <GlobalProvider artworks={artworks}> 
          <div className="content">
            {children}
          </div>
          </GlobalProvider>
        </div>    
    </body>
    </html> 
  );
}
