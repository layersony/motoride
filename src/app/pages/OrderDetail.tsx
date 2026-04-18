import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  CheckCircle, Package, Truck, Clock, MapPin,
  Receipt, ArrowLeft, Loader2, ChevronRight,
} from 'lucide-react';
import { ordersApi, type ApiOrder } from '../services/api';
import { useApp } from '../context/AppContext';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: Receipt },
  { key: 'confirmed', label: 'Confirmed',       icon: CheckCircle },
  { key: 'processing',label: 'Processing',      icon: Package },
  { key: 'shipped',   label: 'Shipped',         icon: Truck },
  { key: 'delivered', label: 'Delivered',       icon: MapPin },
];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  confirmed:  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  shipped:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function StatusTracker({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i <= currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[60px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${done ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1 text-center whitespace-nowrap
                ${done ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-5 transition-colors
                ${i < currentIdx ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useApp();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?next=/orders', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    ordersApi
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl dark:text-white mb-4">Order not found</h2>
          <Link to="/orders" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/orders" className="hover:text-red-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            My Orders
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 dark:text-gray-300">#{order.order_number}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl dark:text-white">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-KE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {order.status_display}
          </span>
        </div>

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold dark:text-white mb-5">Order Progress</h2>
            <StatusTracker status={order.status} />
            {order.tracking_number && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Tracking number: <span className="font-medium dark:text-white">{order.tracking_number}</span>
              </p>
            )}
          </div>
        )}

        {/* Order items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {item.product_image
                    ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    : <Package className="w-full h-full p-3 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium dark:text-white truncate">{item.product_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} × Ksh{parseFloat(item.unit_price).toLocaleString()}
                  </p>
                </div>
                <span className="text-red-600 font-semibold flex-shrink-0">
                  Ksh{parseFloat(item.line_total).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>Ksh{parseFloat(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping ({order.delivery_method_display})</span>
              <span>
                {parseFloat(order.shipping_cost) === 0
                  ? 'FREE'
                  : `Ksh${parseFloat(order.shipping_cost).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax</span>
              <span>Ksh{parseFloat(order.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-semibold dark:text-white border-t dark:border-gray-700 pt-2">
              <span>Total</span>
              <span className="text-red-600">Ksh{parseFloat(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Shipping To
            </h3>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.shipping_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.shipping_address}</p>
            {order.shipping_phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.shipping_phone}</p>
            )}
            {order.shipping_email && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.shipping_email}</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              Payment
            </h3>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.payment_method_display}</p>
            <p className={`text-sm mt-1 font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment_status_display}
            </p>
            {order.payment?.mpesa_reference && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ref: {order.payment.mpesa_reference}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 mb-8">
            <h3 className="font-semibold dark:text-white mb-2">Order Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
