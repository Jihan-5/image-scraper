import React, { useState } from 'react';

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
        className="flex-1 p-2 border rounded-md"
        required
      />
      <button 
        type="submit" 
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
      >
        {isLoading ? 'Scraping...' : 'Scrape'}
      </button>
    </form>
  );
};