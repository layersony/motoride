import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  CheckCircle, Package, Truck, Clock, MapPin,
  Receipt, ArrowLeft, Loader2, ChevronRight,
  Smartphone, AlertCircle, X,
} from 'lucide-react';
import { ordersApi, paymentsApi, type ApiOrder } from '../services/api';
import { useApp } from '../context/AppContext';

// ── Status tracker ─────────────────────────────────────────────────────────────

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

// ── Make Payment Modal ─────────────────────────────────────────────────────────

interface MakePaymentModalProps {
  order: ApiOrder;
  onClose: () => void;
  onSuccess: () => void;
}

function MakePaymentModal({ order, onClose, onSuccess }: MakePaymentModalProps) {
  const [phone, setPhone] = useState(order.shipping_phone || '');
  const [status, setStatus] = useState<'checking' | 'idle' | 'sending' | 'waiting' | 'failed' | 'timeout'>('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const POLL_TIMEOUT_MS = 90_000; // 1 min 30 sec

  // On mount: check if a payment already exists for this order (async)
  useEffect(() => {
    let cancelled = false;

    paymentsApi.getStatus(order.id)
      .then((data) => {
        if (cancelled) return;
        if (data.status === 'completed') {
          // Already paid — close and refresh
          onSuccess();
        } else if (data.status === 'processing' || data.status === 'pending') {
          // STK push already sent — skip form, go straight to waiting
          if (data.phone_number) setPhone(data.phone_number);
          setStatus('waiting');
          startPolling();
        } else {
          // failed / cancelled / unknown — show form
          setStatus('idle');
        }
      })
      .catch(() => {
        // No payment record yet — show form
        if (!cancelled) setStatus('idle');
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up polling and timeout on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const startPolling = () => {
    stopPolling();

    // Hard stop after 1 min 30 sec
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setStatus('timeout');
    }, POLL_TIMEOUT_MS);

    pollRef.current = setInterval(async () => {
      try {
        const data = await paymentsApi.getStatus(order.id);
        if (data.status === 'completed') {
          stopPolling();
          onSuccess();
        } else if (data.status === 'failed') {
          stopPolling();
          setStatus('failed');
          setErrorMsg('Payment was not completed. Please try again.');
        }
      } catch {
        // keep polling
      }
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Please enter your M-Pesa phone number.');
      return;
    }
    setErrorMsg('');
    setStatus('sending');
    try {
      await paymentsApi.initiate(order.id, phone.trim());
      setStatus('waiting');
      startPolling();
    } catch (err: unknown) {
      const msg =
        (err as Record<string, string>)?.detail ||
        'Failed to initiate payment. Please try again.';
      setErrorMsg(msg);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={status === 'waiting' || status === 'checking'}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
        >
          <X className="w-5 h-5 dark:text-white" />
        </button>

        {status === 'checking' ? (
          /* Async pre-check in progress */
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Checking payment status…</p>
          </div>
        ) : status === 'waiting' ? (
          /* Waiting for STK push */
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold dark:text-white mb-2">Check Your Phone</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">
              An M-Pesa payment request has been sent to:
            </p>
            <p className="text-lg font-semibold text-red-600 mb-3">{phone}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Enter your M-Pesa PIN to complete payment of{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                Ksh{order.total.toLocaleString()}
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for confirmation…
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Request expires in 1 min 30 sec
            </p>
          </div>
        ) : status === 'timeout' ? (
          /* Polling timed out */
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold dark:text-white mb-2">Request Timed Out</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              We didn't receive a confirmation within 1 min 30 sec. If you completed
              the payment, your order will update shortly. Otherwise, try again.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={() => setStatus('idle')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Phone input form */
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Make Payment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Order #{order.order_number} · Ksh{order.total.toLocaleString()}
                </p>
              </div>
            </div>

            {order.payment_method === 'cod' && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
                This is a Cash on Delivery order. You can switch to M-Pesa payment now.
              </div>
            )}

            {status === 'failed' && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  M-Pesa Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  You will receive an STK push to enter your M-Pesa PIN.
                </p>
              </div>

              {errorMsg && status === 'idle' && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                {status === 'sending' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending Request…</>
                ) : (
                  <><Smartphone className="w-4 h-4" /> Pay with M-Pesa</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useApp();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?next=/orders', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const fetchOrder = () => {
    if (!id || !isAuthenticated) return;
    ordersApi
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id, isAuthenticated]);

  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setLoading(true);
    setOrder(null);
    fetchOrder();
  };

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
  const canPay = !isPaid && order.status !== 'cancelled';

  return (
    <>
      {showPayModal && (
        <MakePaymentModal
          order={order}
          onClose={() => setShowPayModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

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
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {order.status_display}
              </span>
              {canPay && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Make Payment
                </button>
              )}
            </div>
          </div>

          {/* Payment banner for unpaid orders */}
          {canPay && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    {order.payment_method === 'cod'
                      ? 'Cash on Delivery — Pay online instead'
                      : 'Payment Pending'}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-0.5">
                    {order.payment_method === 'cod'
                      ? 'You can switch to M-Pesa for faster processing.'
                      : 'Complete your M-Pesa payment to process this order.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Smartphone className="w-4 h-4" />
                Pay with M-Pesa
              </button>
            </div>
          )}

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
                      {item.quantity} × Ksh{item.unit_price.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-red-600 font-semibold flex-shrink-0">
                    Ksh{item.line_total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>Ksh{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping ({order.delivery_method_display})</span>
                <span>
                  {order.shipping_cost === 0 ? 'FREE' : `Ksh${order.shipping_cost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>Ksh{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-semibold dark:text-white border-t dark:border-gray-700 pt-2">
                <span>Total</span>
                <span className="text-red-600">Ksh{order.total.toLocaleString()}</span>
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
              {canPay && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium underline"
                >
                  Make Payment →
                </button>
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
            {canPay ? (
              <button
                onClick={() => setShowPayModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Make Payment
              </button>
            ) : (
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
