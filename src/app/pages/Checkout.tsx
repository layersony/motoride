import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  ChevronRight, ChevronLeft, Check, Truck, Zap, Store,
  Smartphone, Package, Loader2, AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ordersApi, paymentsApi } from '../services/api';

// ── Types ────────────────────────────────────────────────────────────────────

type DeliveryMethod = 'standard' | 'express' | 'pickup';
type PaymentMethod = 'mpesa' | 'cod';

interface ShippingForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const DELIVERY_OPTIONS: {
  id: DeliveryMethod;
  label: string;
  description: string;
  icon: typeof Truck;
  price: (subtotal: number) => number;
  priceLabel: (subtotal: number) => string;
}[] = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: '3–5 business days',
    icon: Truck,
    price: (s) => (s >= 100 ? 0 : 15),
    priceLabel: (s) => (s >= 100 ? 'FREE' : 'Ksh15.00'),
  },
  {
    id: 'express',
    label: 'Express Delivery',
    description: '1–2 business days',
    icon: Zap,
    price: () => 35,
    priceLabel: () => 'Ksh35.00',
  },
  {
    id: 'pickup',
    label: 'Store Pickup',
    description: 'Ready in 2 hours',
    icon: Store,
    price: () => 0,
    priceLabel: () => 'FREE',
  },
];

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    description: 'Pay via M-Pesa STK push',
    icon: Smartphone,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Package,
  },
];

// ── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = ['Shipping', 'Delivery & Payment', 'Review'];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                  ${done ? 'bg-red-600 border-red-600 text-white' : active ? 'border-red-600 text-red-600' : 'border-gray-300 text-gray-400'}`}
              >
                {done ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${active ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-2 mb-5 transition-colors ${step > idx ? 'bg-red-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Checkout() {
  const navigate = useNavigate();
  const { cart, isAuthenticated, user, clearCart } = useApp();

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!isAuthenticated) navigate('/login?next=/checkout', { replace: true });
  }, [isAuthenticated, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [step, setStep] = useState(1);

  const [shipping, setShipping] = useState<ShippingForm>({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const [delivery, setDelivery] = useState<DeliveryMethod>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [mpesaPhone, setMpesaPhone] = useState(user.phone || '');
  const [notes, setNotes] = useState('');

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // M-Pesa waiting state
  const [mpesaOrderId, setMpesaOrderId] = useState<number | null>(null);
  const [mpesaStatus, setMpesaStatus] = useState<string>('processing');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep shipping pre-filled when user loads
  useEffect(() => {
    setShipping((prev) => ({
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
      address: prev.address || user.address || '',
    }));
    setMpesaPhone((prev) => prev || user.phone || '');
  }, [user]);

  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === delivery)!;
  const shippingCost = deliveryOption.price(subtotal);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  // ── Polling payment status for M-Pesa ──────────────────────────────────────
  useEffect(() => {
    if (!mpesaOrderId) return;

    pollRef.current = setInterval(async () => {
      try {
        const data = await paymentsApi.getStatus(mpesaOrderId);
        setMpesaStatus(data.status);
        if (data.status === 'completed') {
          clearInterval(pollRef.current!);
          navigate(`/order-confirmation/${mpesaOrderId}`);
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current!);
        }
      } catch {
        // keep polling
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [mpesaOrderId, navigate]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!shipping.name.trim()) return 'Full name is required.';
    if (!shipping.email.trim()) return 'Email is required.';
    if (!shipping.address.trim()) return 'Delivery address is required.';
    return '';
  };

  const validateStep2 = () => {
    if (payment === 'mpesa' && !mpesaPhone.trim()) {
      return 'Enter your M-Pesa phone number.';
    }
    return '';
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep((s) => s + 1);
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setError('');
    setPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_phone: shipping.phone,
        shipping_address: shipping.address,
        delivery_method: delivery,
        payment_method: payment,
        mpesa_phone: payment === 'mpesa' ? mpesaPhone : undefined,
        notes,
      });

      clearCart();

      if (payment === 'mpesa') {
        setMpesaOrderId(order.id);
        setMpesaStatus(order.payment?.status ?? 'processing');
        // Don't navigate yet — show the waiting screen below
      } else {
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as Record<string, string>)?.detail ||
        (err as Record<string, string[]>)?.non_field_errors?.[0] ||
        'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  // ── M-Pesa waiting screen ───────────────────────────────────────────────────
  if (mpesaOrderId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border dark:border-gray-700">
          {mpesaStatus === 'failed' ? (
            <>
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-semibold dark:text-white mb-2">Payment Failed</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The M-Pesa payment was not completed. Your order has been saved.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to={`/order-confirmation/${mpesaOrderId}`}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  View Order
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold dark:text-white mb-2">Check Your Phone</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                An M-Pesa payment request has been sent to:
              </p>
              <p className="text-lg font-semibold text-red-600 mb-4">{mpesaPhone}</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Enter your M-Pesa PIN to complete the payment of{' '}
                <span className="font-semibold text-gray-800 dark:text-white">
                  Ksh{Math.round(total).toLocaleString()}
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for payment confirmation…
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty.</p>
          <Link to="/products" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl md:text-4xl mb-2 dark:text-white text-center">Checkout</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </p>

        <StepBar step={step} />

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left panel ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* Step 1 — Shipping */}
            {step === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold dark:text-white mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0712 345 678"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Address <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Street, City, County"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Any special instructions…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Delivery & Payment */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Delivery method */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold dark:text-white mb-4">Delivery Method</h2>
                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors
                            ${delivery === opt.id
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                          <input
                            type="radio"
                            name="delivery"
                            value={opt.id}
                            checked={delivery === opt.id}
                            onChange={() => setDelivery(opt.id)}
                            className="sr-only"
                          />
                          <Icon className={`w-6 h-6 flex-shrink-0 ${delivery === opt.id ? 'text-red-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="font-medium dark:text-white">{opt.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{opt.description}</div>
                          </div>
                          <span className={`font-semibold ${delivery === opt.id ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {opt.priceLabel(subtotal)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold dark:text-white mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {PAYMENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors
                            ${payment === opt.id
                              ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={payment === opt.id}
                            onChange={() => setPayment(opt.id)}
                            className="sr-only"
                          />
                          <Icon className={`w-6 h-6 flex-shrink-0 ${payment === opt.id ? 'text-red-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="font-medium dark:text-white">{opt.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{opt.description}</div>
                          </div>
                          {payment === opt.id && <Check className="w-5 h-5 text-red-600" />}
                        </label>
                      );
                    })}
                  </div>

                  {/* M-Pesa phone input */}
                  {payment === 'mpesa' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        M-Pesa Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0712 345 678"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        You will receive an STK push on this number to enter your M-Pesa PIN.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold dark:text-white mb-6">Review Your Order</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border dark:border-gray-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium dark:text-white truncate">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} × {item.quantity}</p>
                      </div>
                      <span className="text-red-600 font-semibold">
                        Ksh{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t dark:border-gray-700 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping to</span>
                    <span className="text-right max-w-[60%] font-medium dark:text-gray-300">{shipping.address}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span className="font-medium dark:text-gray-300">{deliveryOption.label}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Payment</span>
                    <span className="font-medium dark:text-gray-300">
                      {payment === 'mpesa' ? `M-Pesa (${mpesaPhone})` : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <button
                  onClick={() => { setError(''); setStep((s) => s - 1); }}
                  className="flex items-center gap-2 px-5 py-3 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="flex items-center gap-2 px-5 py-3 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Cart
                </Link>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                  ) : (
                    <>{payment === 'mpesa' ? 'Pay with M-Pesa' : 'Place Order'}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Order summary sidebar ──────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 sticky top-24">
              <h3 className="text-lg font-semibold dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="truncate max-w-[70%]">{item.name} ×{item.quantity}</span>
                    <span>Ksh{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-gray-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>Ksh{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `Ksh${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8%)</span>
                  <span>Ksh{Math.round(tax).toLocaleString()}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-base font-semibold dark:text-white">
                  <span>Total</span>
                  <span className="text-red-600">Ksh{Math.round(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
