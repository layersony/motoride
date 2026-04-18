import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { ordersApi, type ApiOrder } from '../services/api';
import { useApp } from '../context/AppContext';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  confirmed:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  shipped:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const PAYMENT_COLORS: Record<string, string> = {
  paid:    'text-green-600 dark:text-green-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  failed:  'text-red-600 dark:text-red-400',
};

export function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useApp();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?next=/orders', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersApi
      .getOrders()
      .then((data: unknown) => {
        // Backend may return a paginated object or a plain array
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && typeof data === 'object' && 'results' in data) {
          setOrders((data as { results: typeof orders }).results);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl mb-2 dark:text-white">My Orders</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl mb-2 dark:text-white">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your order history will appear here once you've placed an order.
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold dark:text-white tracking-wide">
                        #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-KE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-red-600">
                        Ksh{parseFloat(order.total).toLocaleString()}
                      </p>
                      <p className={`text-sm ${PAYMENT_COLORS[order.payment_status] ?? 'text-gray-500'}`}>
                        {order.payment_status_display}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {order.status_display}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    {' · '}
                    {order.delivery_method_display}
                  </span>
                  <span className="sm:hidden font-semibold text-red-600">
                    Ksh{parseFloat(order.total).toLocaleString()}
                  </span>
                </div>

                {/* Item thumbnails */}
                {order.items.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                        title={item.product_name}
                      >
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-full h-full p-2.5 text-gray-400" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
