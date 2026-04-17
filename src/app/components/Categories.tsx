import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { productsApi, type ApiCategory } from '../services/api';

export function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">Shop by Category</h2>
          <p className="text-gray-600 dark:text-gray-400">Find exactly what you need</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-72 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative h-72">
                  <img
                    src={category.image ?? ''}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl mb-2">{category.name}</h3>
                    <p className="text-gray-300 mb-4">{category.product_count}+ Products</p>
                    <div className="flex items-center gap-2 text-red-500 group-hover:gap-4 transition-all">
                      <span>Shop Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
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
