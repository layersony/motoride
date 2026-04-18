import { useState, useEffect } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { productsApi, type ApiProduct } from '../services/api';

export function FeaturedProducts() {
  const { addToCart } = useApp();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getFeatured()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: ApiProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image ?? '',
      category: product.category_name,
    });
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Discover our top-selling motorcycles</p>
          </div>
          <Link to="/products" className="text-red-600 hover:text-red-700 font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No featured products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.image ?? ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/product/${product.id}`} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Eye className="w-5 h-5 text-gray-700 dark:text-white" />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-white" />
                    </button>
                  </div>
                </div>
                <Link to={`/product/${product.id}`} className="block p-5">
                  <div className="text-sm text-red-600 mb-2">{product.category_name}</div>
                  <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl text-red-600">Ksh{parseFloat(product.price).toLocaleString()}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
