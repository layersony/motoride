import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router';
import { SlidersHorizontal, Grid3x3, List, ChevronDown, ShoppingCart, Eye } from 'lucide-react';
import { productsApi, type ApiProduct, type ApiCategory } from '../services/api';
import { useApp } from '../context/AppContext';

export function Products() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const priceRanges = ['All', 'Under $500', '$500 - $1000', '$1000 - $5000', '$5000 - $10000', 'Over $10000'];

  const priceRangeToParams = (range: string): { min_price?: number; max_price?: number } => {
    switch (range) {
      case 'Under $500': return { max_price: 500 };
      case '$500 - $1000': return { min_price: 500, max_price: 1000 };
      case '$1000 - $5000': return { min_price: 1000, max_price: 5000 };
      case '$5000 - $10000': return { min_price: 5000, max_price: 10000 };
      case 'Over $10000': return { min_price: 10000 };
      default: return {};
    }
  };

  const sortByToOrdering = (sort: string): string | undefined => {
    switch (sort) {
      case 'price-low': return 'price';
      case 'price-high': return '-price';
      case 'name': return 'name';
      default: return undefined;
    }
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);

    const filterType = searchParams.get('filter') as 'new' | 'sale' | 'featured' | null;
    const categoryParam = searchParams.get('category');
    const searchQuery = searchParams.get('search') ?? undefined;

    const params: Parameters<typeof productsApi.getProducts>[0] = {};

    if (filterType) {
      params.filter = filterType;
    }

    if (categoryParam) {
      params.category = categoryParam;
    } else if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }

    const priceParams = priceRangeToParams(priceRange);
    if (priceParams.min_price !== undefined) params.min_price = priceParams.min_price;
    if (priceParams.max_price !== undefined) params.max_price = priceParams.max_price;

    const ordering = sortByToOrdering(sortBy);
    if (ordering) params.ordering = ordering;

    if (searchQuery) params.search = searchQuery;

    productsApi
      .getProducts(params)
      .then((res) => {
        setProducts(res.results);
        setTotalCount(res.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams, selectedCategory, priceRange, sortBy]);

  // Load categories once
  useEffect(() => {
    productsApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Sync selectedCategory from URL param on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getPageTitle = () => {
    const filterType = searchParams.get('filter');
    const categoryParam = searchParams.get('category');

    if (filterType === 'new') return 'New Arrivals';
    if (filterType === 'sale') return 'Season Sale';
    if (filterType === 'featured') return 'Featured Products';
    if (categoryParam) return categoryParam;
    return 'All Products';
  };

  const categoryOptions = ['All', ...categories.map((c) => c.slug)];
  const categoryLabel = (slug: string) => {
    if (slug === 'All') return 'All';
    return categories.find((c) => c.slug === slug)?.name ?? slug;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl mb-2 dark:text-white">{getPageTitle()}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'product' : 'products'} found`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="mb-3 dark:text-white">Category</h3>
                <div className="space-y-2">
                  {categoryOptions.map((slug) => (
                    <label key={slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === slug}
                        onChange={() => setSelectedCategory(slug)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{categoryLabel(slug)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="mb-3 dark:text-white">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === range}
                        onChange={() => setPriceRange(range)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange('All');
                }}
                className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border dark:border-gray-700">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-white"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : 'border dark:border-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'border dark:border-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg h-80 animate-pulse border dark:border-gray-700" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border dark:border-gray-700">
                <p className="text-xl text-gray-600 dark:text-gray-400">No products found</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange('All');
                  }}
                  className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
                  >
                    {(product.is_new || product.on_sale) && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                        {product.is_new ? 'New' : `-${product.discount}%`}
                      </div>
                    )}
                    <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.image ?? ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Eye className="w-5 h-5 text-gray-700 dark:text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: parseFloat(product.price),
                              image: product.image ?? '',
                              category: product.category_name,
                            });
                          }}
                          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-red-600 mb-2">{product.category_name}</div>
                      <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-red-600">${parseFloat(product.price).toLocaleString()}</span>
                        {product.original_price && (
                          <span className="text-gray-500 line-through">
                            ${parseFloat(product.original_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700 p-4"
                  >
                    <div className="relative w-full md:w-48 h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                      <img
                        src={product.image ?? ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {(product.is_new || product.on_sale) && (
                        <div className="absolute top-2 left-2 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                          {product.is_new ? 'New' : `-${product.discount}%`}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-sm text-red-600 mb-2">{product.category_name}</div>
                        <h3 className="text-xl mb-2 dark:text-white">{product.name}</h3>
                        {product.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-red-600">${parseFloat(product.price).toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-gray-500 line-through">
                              ${parseFloat(product.original_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
