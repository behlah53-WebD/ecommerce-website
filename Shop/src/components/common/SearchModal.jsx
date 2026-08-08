import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';

export const SearchModal = ({ isOpen, onClose }) => {
  const { searchQuery, setSearchQuery } = useProducts();
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      setSearchQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchQuery, setSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onClose();
    navigate('/shop');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/50 pt-20 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Products</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Search by product title, category, or description..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            autoFocus
          />
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Press <kbd className="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800">Enter</kbd> to view results</span>
          <span>Press <kbd className="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};