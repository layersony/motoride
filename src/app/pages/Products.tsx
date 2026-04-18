import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { SlidersHorizontal, Grid3x3, List, ChevronDown, ShoppingCart, Eye } from 'lucide-react';
import { productsApi, type ApiProduct, type ApiCategory } from '../services/api';
import { useApp } from '../context/AppContext';

const PRICE_MIN_BOUND = 0;
const PRICE_MAX_BOUND = 100_000;
const PRICE_STEP = 500;

// ── Dual-handle price slider ───────────────────────────────────────────────

interface PriceSliderProps {
  min: number;
  max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function PriceSlider({ min, max, onMinChange, onMaxChange }: PriceSliderProps) {
  const leftPct  = ((min - PRICE_MIN_BOUND) / (PRICE_MAX_BOUND - PRICE_MIN_BOUND)) * 100;
  const rightPct = ((PRICE_MAX_BOUND - max) / (PRICE_MAX_BOUND - PRICE_MIN_BOUND)) * 100;

  const thumbCls = [
    'absolute w-full h-full pointer-events-none appearance-none bg-transparent',
    '[&::-webkit-slider-thumb]:pointer-events-auto',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-red-600',
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
    '[&::-webkit-slider-thumb]:shadow',
    '[&::-webkit-slider-thumb]:cursor-pointer',
    '[&::-moz-range-thumb]:pointer-events-auto',
    '[&::-moz-range-thumb]:appearance-none',
    '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-red-600',
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
    '[&::-moz-range-thumb]:cursor-pointer',
    '[&::-moz-range-thumb]:border-none',
  ].join(' ');

  return (
    <div className="mt-4 mb-2">
      {/* Track */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-600" />
        {/* Active fill */}
        <div
          className="absolute h-1.5 rounded-full bg-red-600"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={PRICE_MIN_BOUND}
          max={PRICE_MAX_BOUND}
          step={PRICE_STEP}
          value={min}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), max - PRICE_STEP);
            onMinChange(v);
          }}
          className={thumbCls}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={PRICE_MIN_BOUND}
          max={PRICE_MAX_BOUND}
          step={PRICE_STEP}
          value={max}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), min + PRICE_STEP);
            onMaxChange(v);
          }}
          className={thumbCls}
        />
      </div>

      {/* Bound labels */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
        <span>Ksh{PRICE_MIN_BOUND.toLocaleString()}</span>
        <span>Ksh{PRICE_MAX_BOUND.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function Products() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceMin, setPriceMin] = useState(PRICE_MIN_BOUND);
  const [priceMax, setPriceMax] = useState(PRICE_MAX_BOUND);
  // Local input strings (so user can type freely without clamping mid-entry)
  const [minInput, setMinInput] = useState(String(PRICE_MIN_BOUND));
  const [maxInput, setMaxInput] = useState(String(PRICE_MAX_BOUND));

  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce ref so slider drag doesn't fire a request on every pixel
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    if (filterType) params.filter = filterType;

    if (categoryParam) {
      params.category = categoryParam;
    } else if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }

    if (priceMin > PRICE_MIN_BOUND) params.min_price = priceMin;
    if (priceMax < PRICE_MAX_BOUND) params.max_price = priceMax;

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
  }, [searchParams, selectedCategory, priceMin, priceMax, sortBy]);

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

  // Keep input strings in sync when slider moves
  useEffect(() => { setMinInput(String(priceMin)); }, [priceMin]);
  useEffect(() => { setMaxInput(String(priceMax)); }, [priceMax]);

  const handleSliderMin = (v: number) => {
    setPriceMin(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchProducts, 5000);
  };

  const handleSliderMax = (v: number) => {
    setPriceMax(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchProducts, 5000);
  };

  const commitMinInput = () => {
    const v = Math.max(PRICE_MIN_BOUND, Math.min(Number(minInput) || PRICE_MIN_BOUND, priceMax - PRICE_STEP));
    setPriceMin(v);
    setMinInput(String(v));
  };

  const commitMaxInput = () => {
    const v = Math.min(PRICE_MAX_BOUND, Math.max(Number(maxInput) || PRICE_MAX_BOUND, priceMin + PRICE_STEP));
    setPriceMax(v);
    setMaxInput(String(v));
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceMin(PRICE_MIN_BOUND);
    setPriceMax(PRICE_MAX_BOUND);
    setMinInput(String(PRICE_MIN_BOUND));
    setMaxInput(String(PRICE_MAX_BOUND));
  };

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

  const isPriceFiltered = priceMin > PRICE_MIN_BOUND || priceMax < PRICE_MAX_BOUND;

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

              {/* Price Range Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="dark:text-white">Price Range</h3>
                  {isPriceFiltered && (
                    <button
                      onClick={() => {
                        setPriceMin(PRICE_MIN_BOUND);
                        setPriceMax(PRICE_MAX_BOUND);
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <PriceSlider
                  min={priceMin}
                  max={priceMax}
                  onMinChange={handleSliderMin}
                  onMaxChange={handleSliderMax}
                />

                {/* Manual inputs */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min (Ksh)</label>
                    <input
                      type="number"
                      value={minInput}
                      min={PRICE_MIN_BOUND}
                      max={PRICE_MAX_BOUND}
                      step={PRICE_STEP}
                      onChange={(e) => setMinInput(e.target.value)}
                      onBlur={commitMinInput}
                      onKeyDown={(e) => e.key === 'Enter' && commitMinInput()}
                      className="w-full px-2 py-1.5 text-sm border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 mt-5">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max (Ksh)</label>
                    <input
                      type="number"
                      value={maxInput}
                      min={PRICE_MIN_BOUND}
                      max={PRICE_MAX_BOUND}
                      step={PRICE_STEP}
                      onChange={(e) => setMaxInput(e.target.value)}
                      onBlur={commitMaxInput}
                      onKeyDown={(e) => e.key === 'Enter' && commitMaxInput()}
                      className="w-full px-2 py-1.5 text-sm border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
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
                  onClick={resetFilters}
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
                              price: product.price,
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
                        <span className="text-2xl text-red-600">Ksh{product.price.toLocaleString()}</span>
                        {product.original_price && (
                          <span className="text-gray-500 line-through">
                            Ksh{product.original_price.toLocaleString()}
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
                          <span className="text-2xl text-red-600">Ksh{product.price.toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-gray-500 line-through">
                              Ksh{product.original_price.toLocaleString()}
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
