import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { SlidersHorizontal, Grid3x3, List, ChevronDown, ShoppingCart, Eye } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  onSale?: boolean;
  discount?: number;
}

const allProducts: Product[] = [
  {
    id: 1,
    name: 'Speedster Sport X1',
    price: 12999,
    originalPrice: 12999,
    image: 'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sport Bikes',
  },
  {
    id: 2,
    name: 'Classic Cruiser 500',
    price: 7499,
    originalPrice: 9999,
    image: 'https://images.unsplash.com/photo-1761227762792-eea264a70fd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZSUyMGNocm9tZXxlbnwxfHx8fDE3NzE2MTQ3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cruisers',
    onSale: true,
    discount: 25,
  },
  {
    id: 3,
    name: 'Adventure Pro 800',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1767652784202-214920d12a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBtb3RvcmN5Y2xlJTIwdG91cmluZ3xlbnwxfHx8fDE3NzE0OTA3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Adventure',
  },
  {
    id: 4,
    name: 'Racer Elite R1',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1758887699099-efa710f06a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBtb3RvcmN5Y2xlJTIwcmVkfGVufDF8fHx8MTc3MTYxNDczOXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Racing',
  },
  {
    id: 5,
    name: 'Vintage Classic 350',
    price: 5999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1565625078391-42a8daecf4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGNsYXNzaWN8ZW58MXx8fHwxNzcxNTU4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Vintage',
    onSale: true,
    discount: 25,
  },
  {
    id: 6,
    name: 'E-Rider Future',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1701666469257-319f272914c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGUlMjBtb2Rlcm58ZW58MXx8fHwxNzcxNTU4NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electric',
  },
  {
    id: 7,
    name: 'Carbon Fiber Helmet Pro',
    price: 599,
    image: 'https://images.unsplash.com/photo-1685826398847-0a5744b8be1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MTYxNDc0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Helmets',
    isNew: true,
  },
  {
    id: 8,
    name: 'Premium Leather Jacket',
    price: 449,
    image: 'https://images.unsplash.com/photo-1654720498638-46c8d93bc32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwamFja2V0JTIwbGVhdGhlcnxlbnwxfHx8fDE3NzE1ODk4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Jackets',
    isNew: true,
  },
  {
    id: 9,
    name: 'Racing Gloves Pro',
    price: 129,
    image: 'https://images.unsplash.com/photo-1763919417453-dea1172b98fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZ2xvdmVzJTIwZ2VhcnxlbnwxfHx8fDE3NzE2MTQ3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Gloves',
    isNew: true,
  },
  {
    id: 10,
    name: 'Performance Exhaust Kit',
    price: 899,
    image: 'https://images.unsplash.com/photo-1759665996019-c2bdf600b90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcGFydHMlMjBlbmdpbmV8ZW58MXx8fHwxNzcxNjE0NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Parts & Accessories',
    isNew: true,
  },
  {
    id: 11,
    name: 'Speedster Sport X1 - Sale',
    price: 9999,
    originalPrice: 12999,
    image: 'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sport Bikes',
    onSale: true,
    discount: 23,
  },
];

export function Products() {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Sport Bikes', 'Cruisers', 'Adventure', 'Racing', 'Vintage', 'Electric', 'Helmets', 'Jackets', 'Gloves', 'Parts & Accessories'];
  const priceRanges = ['All', 'Under $500', '$500 - $1000', '$1000 - $5000', '$5000 - $10000', 'Over $10000'];

  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by URL parameters
    const filterType = searchParams.get('filter');
    const categoryParam = searchParams.get('category');

    if (filterType === 'new') {
      filtered = filtered.filter(p => p.isNew);
    } else if (filterType === 'sale') {
      filtered = filtered.filter(p => p.onSale);
    }

    if (categoryParam) {
      filtered = filtered.filter(p => p.category === categoryParam);
      setSelectedCategory(categoryParam);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'All') {
      filtered = filtered.filter(p => {
        switch (priceRange) {
          case 'Under $500':
            return p.price < 500;
          case '$500 - $1000':
            return p.price >= 500 && p.price <= 1000;
          case '$1000 - $5000':
            return p.price >= 1000 && p.price <= 5000;
          case '$5000 - $10000':
            return p.price >= 5000 && p.price <= 10000;
          case 'Over $10000':
            return p.price > 10000;
          default:
            return true;
        }
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [searchParams, selectedCategory, priceRange, sortBy]);

  const getPageTitle = () => {
    const filterType = searchParams.get('filter');
    const categoryParam = searchParams.get('category');

    if (filterType === 'new') return 'New Arrivals';
    if (filterType === 'sale') return 'Season Sale';
    if (categoryParam) return categoryParam;
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl mb-2 dark:text-white">{getPageTitle()}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
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
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{category}</span>
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

            {/* Products */}
            {filteredProducts.length === 0 ? (
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
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
                  >
                    {(product.isNew || product.onSale) && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                        {product.isNew ? 'New' : `-${product.discount}%`}
                      </div>
                    )}
                    <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Eye className="w-5 h-5 text-gray-700 dark:text-white" />
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-red-600 mb-2">{product.category}</div>
                      <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl text-red-600">${product.price.toLocaleString()}</span>
                        {product.originalPrice && product.originalPrice !== product.price && (
                          <span className="text-gray-500 line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700 p-4"
                  >
                    <div className="relative w-full md:w-48 h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {(product.isNew || product.onSale) && (
                        <div className="absolute top-2 left-2 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                          {product.isNew ? 'New' : `-${product.discount}%`}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-sm text-red-600 mb-2">{product.category}</div>
                        <h3 className="text-xl mb-2 dark:text-white">{product.name}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl text-red-600">${product.price.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice !== product.price && (
                            <span className="text-gray-500 line-through">
                              ${product.originalPrice.toLocaleString()}
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
