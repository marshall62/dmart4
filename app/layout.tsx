'use client';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from '@/components/navigation/navbar';
import { createContext, useEffect, useState } from "react";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [artworks,setArtworks] = useState(null);
  const GlobalContext = createContext(null);

  useEffect (() => {
    const login =  async () => {    

      try {
        const resp = await fetch("/api/artworks");
        if (!resp.ok) {
          throw new Error("Failed to fetch artworks");
        }
        const artworksJson = await resp.json();
        const artworks = artworksJson
        // const artistConfig = await fetch("/api/artist");
        const config = {}
        setArtworks(artworks);

      } catch (err) {
        console.error("Failed to log in", err.message);     
      }
    }
    
    login();

  },[]);

  return (
    <html>
      <body>
        <div className="container flex flex-col">
          <Navbar/>
          <GlobalContext.Provider value={{artworks}}> 
          <div className="content">
            {children}
          </div>
          </GlobalContext.Provider>
        </div>    
    </body>
    </html> 
  );
}
