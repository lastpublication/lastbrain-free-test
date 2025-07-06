"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";

export const InfoSocietyContext = createContext<any>(null);

export function useInfoSociety() {
  return useContext(InfoSocietyContext);
}

export function InfoSocietyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [infoSociety, setInfoSociety] = useState<any>(null);

  const fetchInfoSociety = useCallback(async () => {
    try {
      const response = await axios.get("/api/info-societe");
      return response.data;
    } catch (error) {
      console.error("Error fetching society info:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchInfoSociety().then((data) => {
      setInfoSociety(data);
    });
  }, [fetchInfoSociety]);

  return (
    <InfoSocietyContext.Provider value={infoSociety}>
      {children}
    </InfoSocietyContext.Provider>
  );
}
