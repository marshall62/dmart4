import { SelectArtwork } from "@/lib/db";
import React, { createContext, useContext, ReactNode } from "react";


type GlobalContextType = {
  artworks: SelectArtwork[];
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({
  children,
  artworks,
}: {
  children: ReactNode;
  artworks: SelectArtwork[];
}) => (
  <GlobalContext.Provider value={{ artworks }}>
    {children}
  </GlobalContext.Provider>
);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};