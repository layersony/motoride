import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { Link } from 'react-router';
import { productsApi, type ApiProduct } from '../services/api';

export function SeasonSale() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getSale()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-red-600 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 text-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl">Winter Season Sale</h2>
          </div>
          <p className="text-lg mb-4">Save up to 25% on selected motorcycles - Limited time only!</p>
          <Link
            to="/products?filter=sale"
            className="inline-block px-6 py-3 bg-white text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            View All Sale Items
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/20 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-white/80 py-8">No sale items at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.slice(0, 3).map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <div className="absolute top-4 right-4 z-10 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg">
                    -{product.discount}%
                  </div>
                  <img
                    src={product.image ?? ''}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg mb-3 dark:text-white">{product.name}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl text-red-600">Ksh{product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="text-lg text-gray-500 line-through">
                        Ksh{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Grab the Deal
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
