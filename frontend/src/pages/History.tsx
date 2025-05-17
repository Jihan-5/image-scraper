import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getScrapingHistory } from '../api/api';
import { Link } from "react-router-dom";


interface HistoryItem {
  id: string;
  url: string;
  images: string[];
  createdAt: string;
}

export const History: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
            const response = await getScrapingHistory(user.id);
            setHistory(response.data);            
        } catch (error) {
          console.error('Failed to fetch history', error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">Please login to view your history</p>
        <Link 
          to="/login" 
          className="btn-primary inline-block"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Scraping History</h1>
      
      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No history found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.url}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">
                    {item.images.length} images extracted
                  </p>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};