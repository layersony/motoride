import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart, Share2, Star, Truck, RotateCcw, Shield, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
}

const productData: Record<number, Product> = {
  1: {
    id: 1,
    name: 'Speedster Sport X1',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sport Bikes',
    description: 'The Speedster Sport X1 is a high-performance sport bike designed for riders who demand the best. With cutting-edge technology and aerodynamic design, this motorcycle delivers exceptional speed and handling.',
    features: [
      'Powerful 1000cc engine',
      'Advanced ABS braking system',
      'Lightweight aluminum frame',
      'Digital dashboard with GPS',
      'LED headlights and taillights',
      'Adjustable suspension',
    ],
    specifications: [
      { label: 'Engine', value: '1000cc Inline-4' },
      { label: 'Power', value: '200 HP' },
      { label: 'Torque', value: '112 Nm' },
      { label: 'Top Speed', value: '186 mph' },
      { label: 'Weight', value: '189 kg' },
      { label: 'Fuel Capacity', value: '17L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758887699099-efa710f06a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBtb3RvcmN5Y2xlJTIwcmVkfGVufDF8fHx8MTc3MTYxNDczOXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    rating: 4.8,
    reviews: 128,
    inStock: true,
  },
  2: {
    id: 2,
    name: 'Classic Cruiser 500',
    price: 7499,
    originalPrice: 9999,
    image: 'https://images.unsplash.com/photo-1761227762792-eea264a70fd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZSUyMGNocm9tZXxlbnwxfHx8fDE3NzE2MTQ3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cruisers',
    description: 'Experience classic American cruising style with the Classic Cruiser 500. Built for comfort and style, this bike is perfect for long highway rides and weekend adventures.',
    features: [
      'Classic V-twin engine',
      'Comfortable low-seat design',
      'Chrome detailing',
      'Spacious saddlebags',
      'Cruise control',
      'Premium sound system',
    ],
    specifications: [
      { label: 'Engine', value: '500cc V-Twin' },
      { label: 'Power', value: '45 HP' },
      { label: 'Torque', value: '68 Nm' },
      { label: 'Top Speed', value: '110 mph' },
      { label: 'Weight', value: '280 kg' },
      { label: 'Fuel Capacity', value: '20L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1761227762792-eea264a70fd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZSUyMGNocm9tZXxlbnwxfHx8fDE3NzE2MTQ3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1565625078391-42a8daecf4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGNsYXNzaWN8ZW58MXx8fHwxNzcxNTU4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    rating: 4.6,
    reviews: 89,
    inStock: true,
  },
};

const relatedProducts = [
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
    image: 'https://images.unsplash.com/photo-1565625078391-42a8daecf4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGNsYXNzaWN8ZW58MXx8fHwxNzcxNTU4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Vintage',
  },
  {
    id: 6,
    name: 'E-Rider Future',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1701666469257-319f272914c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGUlMjBtb2Rlcm58ZW58MXx8fHwxNzcxNTU4NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electric',
  },
];

export function ProductDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const { addToCart, toggleFavorite, isFavorite } = useApp();

  const product = productData[Number(id)] || productData[1];
  const isProductFavorite = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    }, quantity);
    // Optional: Show a success message or notification
  };

  const handleToggleFavorite = () => {
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - $${product.price.toLocaleString()}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/" className="text-red-600 hover:text-red-700">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-red-600 hover:text-red-700">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-4 border dark:border-gray-700">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? 'border-red-600'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 border dark:border-gray-700">
              <div className="text-sm text-red-600 mb-2">{product.category}</div>
              <h1 className="text-3xl md:text-4xl mb-4 dark:text-white">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl text-red-600">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block mb-2 dark:text-white">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x dark:border-gray-600 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-4 border rounded-lg transition-colors ${
                    isProductFavorite
                      ? 'bg-red-50 border-red-600 dark:bg-red-900/20 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isProductFavorite
                        ? 'fill-red-600 text-red-600'
                        : 'dark:text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              {/* Features */}
              <div className="border-t dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Truck className="w-5 h-5 text-red-600" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span>2-year warranty included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 mb-12 border dark:border-gray-700">
          <div className="flex gap-6 mb-6 border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 px-2 ${
                activeTab === 'description'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`pb-4 px-2 ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Specifications
            </button>
          </div>

          {activeTab === 'description' ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
              <h3 className="text-xl mb-4 dark:text-white">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-red-600 mt-1">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">{spec.label}</span>
                  <span className="dark:text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl mb-6 dark:text-white">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/product/${relatedProduct.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="text-sm text-red-600 mb-2">{relatedProduct.category}</div>
                  <h3 className="mb-2 dark:text-white">{relatedProduct.name}</h3>
                  <span className="text-xl text-red-600">${relatedProduct.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}