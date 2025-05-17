import React from 'react';
import { Link } from 'react-router-dom';
import { UrlInputForm } from '../components/UrlInputForm';
import { useScraper } from '../hooks/useScraper';
import { ImageGrid } from '../components/ImageGrid';

export const Home: React.FC = () => {
  const { images, scrapeImages, isLoading, error } = useScraper();

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4">Image Scraper</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Extract images from any website with our powerful scraper tool
        </p>
        <UrlInputForm onSubmit={scrapeImages} isLoading={isLoading} />
      </section>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">Results</h2>
        <ImageGrid images={images} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Paste URL",
              description: "Enter any website URL you want to extract images from",
              icon: "🔗"
            },
            {
              title: "Extract Images",
              description: "Our system will analyze and extract all images",
              icon: "🖼️"
            },
            {
              title: "Save Results",
              description: "Download or save images to your collections",
              icon: "💾"
            }
          ].map((step, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
