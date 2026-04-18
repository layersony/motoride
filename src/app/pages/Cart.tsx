import { Link, useNavigate } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, isAuthenticated } = useApp();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Scroll to header so user can log in via the modal/button there
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 15) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border dark:border-gray-700">
              <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2 className="text-3xl mb-4 dark:text-white">Your Cart is Empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl mb-2 dark:text-white">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 border dark:border-gray-700 flex flex-col md:flex-row gap-4"
              >
                <Link to={`/product/${item.id}`} className="w-full md:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link
                        to={`/product/${item.id}`}
                        className="text-lg hover:text-red-600 dark:text-white dark:hover:text-red-500"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 dark:text-white" />
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4 dark:text-white" />
                      </button>
                    </div>
                    <span className="text-xl text-red-600">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 sticky top-24">
              <h2 className="text-2xl mb-6 dark:text-white">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                </div>
                {shipping === 0 && subtotal > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-500">
                    ✓ You qualify for free shipping!
                  </p>
                )}
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-xl dark:text-white">
                    <span>Total</span>
                    <span className="text-red-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mb-2"
              >
                Proceed to Checkout
              </button>
              {!isAuthenticated && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Please sign in to checkout
                </p>
              )}

              <Link
                to="/products"
                className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
