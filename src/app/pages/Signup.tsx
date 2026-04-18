import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useApp();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const next = searchParams.get('next') || '/';

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
      });
      navigate(next, { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const errs = err as Record<string, string | string[]>;
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(errs)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(mapped);
      } else {
        setErrors({ non_field_errors: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        required
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
      />
      {errors[id] && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[id]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-2xl dark:text-white">MotoRide</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-8">
          {errors.non_field_errors && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.non_field_errors}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {field('first_name', 'First name', 'text', 'John')}
              {field('last_name', 'Last name', 'text', 'Doe')}
            </div>

            {field('username', 'Username', 'text', 'johndoe')}
            {field('email', 'Email address', 'email', 'you@example.com')}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 pr-11 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password2}
                onChange={set('password2')}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
              />
              {errors.password2 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password2}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
