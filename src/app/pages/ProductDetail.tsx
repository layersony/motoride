import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ShoppingCart, Heart, Share2, Star, Truck, RotateCcw, Shield, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { productsApi, type ApiProduct } from '../services/api';

export function ProductDetail() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const { addToCart, toggleFavorite, isFavorite } = useApp();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setSelectedImage(0);

    productsApi
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        return productsApi.getRelated(p.id);
      })
      .then(setRelated)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image ?? '',
      category: product.category_name,
    }, quantity);
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image ?? '',
      category: product.category_name,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - $${parseFloat(product.price).toLocaleString()}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[500px] animate-pulse" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[500px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl dark:text-white mb-4">Product not found</h2>
          <Link to="/products" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isProductFavorite = isFavorite(product.id);
  const allImages = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.image
    ? [product.image]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/" className="text-red-600 hover:text-red-700">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-red-600 hover:text-red-700">Products</Link>
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
                src={allImages[selectedImage] ?? ''}
                alt={product.name}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
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
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 border dark:border-gray-700">
              <div className="text-sm text-red-600 mb-2">{product.category_name}</div>
              <h1 className="text-3xl md:text-4xl mb-4 dark:text-white">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${
                        index < Math.floor(parseFloat(product.rating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl text-red-600">${parseFloat(product.price).toLocaleString()}</span>
                {product.original_price && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${parseFloat(product.original_price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.in_stock ? (
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
                  disabled={!product.in_stock}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      isProductFavorite ? 'fill-red-600 text-red-600' : 'dark:text-white'
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

              {/* Shipping info */}
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
              {product.features && product.features.length > 0 && (
                <>
                  <h3 className="text-xl mb-4 dark:text-white">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((f) => (
                      <li key={f.id} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-red-600 mt-1">✓</span>
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications && product.specifications.length > 0 ? (
                product.specifications.map((spec) => (
                  <div key={spec.id} className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{spec.label}</span>
                    <span className="dark:text-white">{spec.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 col-span-2">No specifications available.</p>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-3xl mb-6 dark:text-white">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/product/${rel.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
                >
                  <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={rel.image ?? ''}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-red-600 mb-2">{rel.category_name}</div>
                    <h3 className="mb-2 dark:text-white">{rel.name}</h3>
                    <span className="text-xl text-red-600">${parseFloat(rel.price).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
