import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  CheckCircle, Package, Truck, Clock, MapPin,
  Receipt, ArrowRight, Loader2,
} from 'lucide-react';
import { ordersApi, type ApiOrder } from '../services/api';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: Receipt },
  { key: 'confirmed', label: 'Confirmed',        icon: CheckCircle },
  { key: 'processing',label: 'Processing',       icon: Package },
  { key: 'shipped',   label: 'Shipped',          icon: Truck },
  { key: 'delivered', label: 'Delivered',        icon: MapPin },
];

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
              <span className={`text-xs mt-1 text-center whitespace-nowrap ${done ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-5 transition-colors ${i < currentIdx ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
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
          <Link to="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isCod = order.payment_method === 'cod';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
            ${isPaid ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
            {isPaid
              ? <CheckCircle className="w-10 h-10 text-green-600" />
              : <Clock className="w-10 h-10 text-yellow-600" />
            }
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold dark:text-white mb-2">
            {isPaid ? 'Payment Confirmed!' : 'Order Received!'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isPaid
              ? 'Your payment was successful and your order is being processed.'
              : isCod
              ? 'Your order has been placed. Please have the exact amount ready on delivery.'
              : 'We are awaiting your payment. Please check your phone for the M-Pesa prompt.'
            }
          </p>
        </div>

        {/* Order number banner */}
        <div className="bg-red-600 text-white rounded-xl p-5 mb-6 text-center">
          <p className="text-sm mb-1 opacity-80">Order Number</p>
          <p className="text-3xl font-bold tracking-widest">{order.order_number}</p>
          <p className="text-sm mt-1 opacity-80">
            Placed on {new Date(order.created_at).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Order tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold dark:text-white mb-5">Order Status</h2>
          <StatusTracker status={order.status} />
        </div>

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
                    {item.quantity} × ${parseFloat(item.unit_price).toLocaleString()}
                  </p>
                </div>
                <span className="text-red-600 font-semibold">
                  ${parseFloat(item.line_total).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${parseFloat(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping ({order.delivery_method_display})</span>
              <span>{parseFloat(order.shipping_cost) === 0 ? 'FREE' : `$${parseFloat(order.shipping_cost).toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span>${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold dark:text-white border-t dark:border-gray-700 pt-2">
              <span>Total</span>
              <span className="text-red-600">${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & payment details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              Shipping To
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{order.shipping_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.shipping_address}</p>
            {order.shipping_phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.shipping_phone}</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
            <h3 className="font-semibold dark:text-white mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              Payment
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{order.payment_method_display}</p>
            <p className={`text-sm mt-1 font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment_status_display}
            </p>
            {order.tracking_number && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tracking: {order.tracking_number}
              </p>
            )}
          </div>
        </div>

        {/* What's next */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 mb-8 text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-semibold dark:text-white mb-2">What happens next?</h3>
          {isCod ? (
            <ol className="list-decimal list-inside space-y-1">
              <li>We will confirm your order and prepare it for dispatch.</li>
              <li>Our courier will contact you before delivery.</li>
              <li>Please have the exact amount of <strong className="dark:text-white">${parseFloat(order.total).toFixed(2)}</strong> ready.</li>
            </ol>
          ) : isPaid ? (
            <ol className="list-decimal list-inside space-y-1">
              <li>Payment received — your order is being processed.</li>
              <li>You will receive a shipment confirmation with tracking details.</li>
              <li>Expected delivery: {order.delivery_method === 'express' ? '1–2' : '3–5'} business days.</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your phone for an M-Pesa STK push prompt.</li>
              <li>Enter your M-Pesa PIN to complete payment.</li>
              <li>Once confirmed, your order will be processed immediately.</li>
            </ol>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center gap-2 px-6 py-3 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
