import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-8 min-h-[70vh] flex flex-col items-center justify-center">
      <span className="font-display text-8xl font-black text-primary-600 dark:text-primary-400">
        404
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary-500/20"
      >
        <Home className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
};
