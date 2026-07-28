"use client";

import "./globals.css";
import Navbar from "@/components/navigation/navbar";
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

  useEffect(() => {
    const login = async () => {
      try {
        const resp = await fetch("/api/artworks");
        if (!resp.ok) {
          throw new Error("Failed to fetch artworks");
        }
        const artworksJson = await resp.json();
        const allArtworks = artworksJson as SelectArtwork[];
        // const artistConfig = await fetch("/api/artist");
        setArtworks(allArtworks);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to log in", err.message);
        } else {
          console.error("Failed to log in", err);
        }
      }
    };

    login();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col w-full">
          <Navbar />
          <GlobalProvider artworks={artworks}>
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </GlobalProvider>
        </div>
      </body>
    </html>
  );
}
