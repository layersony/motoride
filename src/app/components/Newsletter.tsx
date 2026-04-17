import { useState } from 'react';
import { Mail, Gift, TrendingUp, RotateCcw } from 'lucide-react';
import { coreApi } from '../services/api';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await coreApi.subscribeNewsletter(email);
      setMessage(res.detail);
      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      const detail = (err as Record<string, string>)?.detail ?? 'Failed to subscribe. Please try again.';
      setMessage(detail);
      setStatus('error');
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: 'Exclusive Offers',
      description: 'Get special deals only for subscribers',
    },
    {
      icon: TrendingUp,
      title: 'New Arrivals',
      description: 'Be the first to know about new products',
    },
    {
      icon: RotateCcw,
      title: 'Free Returns',
      description: 'Easy 30-day return policy on all orders',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">Join Our Newsletter</h2>
            <p className="text-gray-600 dark:text-gray-400">Subscribe to get special offers and updates</p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700"
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-red-600" />
                  <h3 className="text-lg mb-2 dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* Subscription Form */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-8 md:p-10 text-white">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Mail className="w-12 h-12 flex-shrink-0" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl mb-2">Stay Connected</h3>
                <p>Get the latest news, deals, and exclusive offers delivered to your inbox</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3 bg-white text-red-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-sm ${status === 'success' ? 'text-white' : 'text-yellow-200'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
