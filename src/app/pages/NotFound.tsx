import { Link } from 'react-router';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border dark:border-gray-700 shadow-lg">
          {/* 404 Text */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-red-600 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl mb-4 dark:text-white">Page Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>
          </div>

          {/* Motorcycle Icon SVG */}
          <div className="mb-8">
            <svg
              className="w-48 h-48 mx-auto text-gray-300 dark:text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17 5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM5 18.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c.76 0 1.47.24 2.04.65l1.48-1.48C7.72 9.53 6.42 9 5 9c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.42 0 2.72-.53 3.71-1.4l-1.48-1.48c-.57.41-1.28.65-2.04.65zm14 0c-.76 0-1.47-.24-2.04-.65l-1.48 1.48C16.28 20.47 17.58 21 19 21c2.76 0 5-2.24 5-5s-2.24-5-5-5c-1.42 0-2.72.53-3.71 1.4l1.48 1.48c.57-.41 1.28-.65 2.04-.65 1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5zm-7.97-3.87l1.3-1.3c.2.08.42.17.67.17.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5c0 .25.09.47.17.67l-1.3 1.3-3.04-3.04 1.91-1.91C10.6 9.35 11.8 9 13 9c.58 0 1.14.08 1.68.23L16.89 7H13.5C13.22 7 13 6.78 13 6.5V5h3l1.5-2H9v2h2.47l-.8.8C9.58 5.28 8.29 5 7 5c-3.86 0-7 3.14-7 7h2c0-2.76 2.24-5 5-5 .63 0 1.24.12 1.81.32L5.77 10.4l5.26 5.26z"/>
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
              Browse Products
            </Link>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-8 text-left bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <h3 className="text-lg mb-4 dark:text-white">Popular Pages</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/products?filter=new"
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              → New Arrivals
            </Link>
            <Link
              to="/products?filter=sale"
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              → Season Sale
            </Link>
            <Link
              to="/cart"
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              → Shopping Cart
            </Link>
            <Link
              to="/profile"
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              → My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
