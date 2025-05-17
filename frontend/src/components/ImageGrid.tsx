import React, { useState } from 'react';
import { saveImageToCollection } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";


interface ImageGridProps {
  images: string[];
  onRefresh?: () => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onRefresh }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user || !selectedImage) return;
    
    try {
      await saveImageToCollection({
        imageUrl: selectedImage,
        collectionName,
        userId: user.id
      });
      toast.success('Image saved successfully!');
      setSelectedImage(null);
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to save image');
    }
  };

  return (
    <div className="space-y-6">
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={img}
                alt={`Scraped ${index}`}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setSelectedImage(img)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <button 
                  className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
                  onClick={() => setSelectedImage(img)}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No images found</p>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Save Image</h3>
              <button 
                onClick={() => setSelectedImage(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="w-full h-48 object-contain mb-4"
            />
            
            {user ? (
              <>
                <input
                  type="text"
                  placeholder="Collection name"
                  className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={!collectionName}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">Please login to save images</p>
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};