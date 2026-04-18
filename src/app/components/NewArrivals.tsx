import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import { productsApi, type ApiProduct } from '../services/api';
import { useApp } from '../context/AppContext';

export function NewArrivals() {
  const { addToCart } = useApp();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getNewArrivals()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">New Arrivals</h2>
            <p className="text-gray-600 dark:text-gray-400">Latest gear and accessories</p>
          </div>
          <Link to="/products?filter=new" className="text-red-600 hover:text-red-700 font-medium">
            View All New Products →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No new arrivals at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
              >
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  New
                </div>
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.image ?? ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl text-red-600">Ksh{product.price.toLocaleString()}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image ?? '',
                          category: product.category_name,
                        });
                      }}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
