// src/hooks/useScraper.tsx

import { useScraper as useContextScraper } from '../contexts/ScraperContext';

export const useScraper = () => {
  const { images, scrapeImages, isLoading, error } = useContextScraper();
  return { images, scrapeImages, isLoading, error };
};
