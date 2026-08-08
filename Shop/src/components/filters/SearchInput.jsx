import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';

export const SearchInput = ({
  placeholder = 'Search products...',
  value,
  onChange,
  onSubmit,
  className = '',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useProducts();
  const [localSearchTerm, setLocalSearchTerm] = useState(value || searchQuery || '');
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      setSearchQuery(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchQuery, setSearchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(localSearchTerm);
    navigate('/shop');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={localSearchTerm}
        onChange={(e) => {
          setLocalSearchTerm(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
        autoFocus={autoFocus}
      />
      {localSearchTerm && (
        <button
          type="button"
          onClick={() => setLocalSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

SearchInput.displayName = 'SearchInput';

export default SearchInput;