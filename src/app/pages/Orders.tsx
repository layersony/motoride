import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, ChevronRight, Loader2, ShoppingBag, Smartphone } from 'lucide-react';
import { ordersApi, type ApiOrder } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  confirmed:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  shipped:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  refunded:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const FILTER_TABS = [
  { key: 'all',        label: 'All' },
  { key: 'pending',    label: 'Order Placed' },
  { key: 'confirmed',  label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped' },
  { key: 'delivered',  label: 'Delivered' },
  { key: 'cancelled',  label: 'Cancelled' },
  { key: 'refunded',   label: 'Refunded' },
] as const;

type FilterKey = typeof FILTER_TABS[number]['key'];

const PAYMENT_COLORS: Record<string, string> = {
  paid:    'text-green-600 dark:text-green-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  failed:  'text-red-600 dark:text-red-400',
};

function buildPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useApp();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?next=/orders', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const fetchOrders = useCallback((page: number, status: FilterKey) => {
    setLoading(true);
    setError('');
    ordersApi
      .getOrders({ page, status })
      .then((data) => {
        setOrders(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders(currentPage, activeFilter);
  }, [isAuthenticated, currentPage, activeFilter, fetchOrders]);

  const handleFilterChange = (key: FilterKey) => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAuthLoading || (loading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const pageRange = buildPageRange(currentPage, totalPages);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl mb-2 dark:text-white">My Orders</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {totalCount} order{totalCount !== 1 ? 's' : ''}
          {activeFilter !== 'all' && ` · filtered by ${FILTER_TABS.find(t => t.key === activeFilter)?.label}`}
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${activeFilter === tab.key
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {tab.label}
              {activeFilter === tab.key && totalCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-white/20 text-white">
                  {totalCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading overlay when changing pages */}
        {loading && orders.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        )}

        {!loading && totalCount === 0 && activeFilter === 'all' ? (
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
        ) : !loading && orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-10 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No orders with this status.</p>
          </div>
        ) : !loading ? (
          <>
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
                          Ksh{order.total.toLocaleString()}
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
                      Ksh{order.total.toLocaleString()}
                    </span>
                    {order.payment_status !== 'paid' && order.status !== 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        <Smartphone className="w-3 h-3" />
                        Pay Now
                      </span>
                    )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-40' : ''}
                      />
                    </PaginationItem>

                    {pageRange.map((item, i) =>
                      item === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === currentPage}
                            onClick={(e) => { e.preventDefault(); handlePageChange(item); }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                  Page {currentPage} of {totalPages} · {totalCount} orders
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
