import React, { createContext, useContext, useState } from 'react';
import { api } from '../api/api';
import { ImageScrapeResult } from '../types/images';

interface ScraperContextType {
  images: string[];
  scrapeImages: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ScraperContext = createContext<ScraperContextType>(null!);

export const ScraperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeImages = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<ImageScrapeResult>('/scrape', { url });
      setImages(response.data.image_urls); // Add .data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape images');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScraperContext.Provider value={{ images, scrapeImages, isLoading, error }}>
      {children}
    </ScraperContext.Provider>
  );
};

export const useScraper = () => useContext(ScraperContext);