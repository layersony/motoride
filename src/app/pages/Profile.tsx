import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Heart, Lock, MapPin, Phone, Mail, ShoppingBag, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, updatePassword, favorites, toggleFavorite, isAuthenticated, isAuthLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'password'>('profile');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?next=/profile', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters');
      return;
    }
    const success = updatePassword(passwordData.oldPassword, passwordData.newPassword);
    if (success) {
      setPasswordMessage('Password updated successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMessage('Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl mb-8 dark:text-white">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl dark:text-white">{user.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'favorites'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    Favorites ({favorites.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'password'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    Change Password
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl dark:text-white">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div>
                        <label className="block mb-2 dark:text-white">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 dark:text-white">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 dark:text-white">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 dark:text-white">Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                            rows={3}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(user);
                          }}
                          className="px-6 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                          <p className="text-lg dark:text-white">{user.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                          <p className="text-lg dark:text-white">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                          <p className="text-lg dark:text-white">{user.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                          <p className="text-lg dark:text-white">{user.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 border dark:border-gray-700">
                  <h2 className="text-2xl mb-6 dark:text-white">My Favorites</h2>

                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                      <h3 className="text-xl mb-4 dark:text-white">No Favorites Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start adding items to your favorites to see them here
                      </p>
                      <Link
                        to="/products"
                        className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {favorites.map((product) => (
                        <div
                          key={product.id}
                          className="group relative bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-600"
                        >
                          <Link to={`/product/${product.id}`} className="block">
                            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                  to={`/product/${product.id}`}
                                  className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Eye className="w-5 h-5 text-gray-700 dark:text-white" />
                                </Link>
                                <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-white" />
                                </button>
                              </div>
                            </div>
                          </Link>
                          <div className="p-4">
                            <div className="text-sm text-red-600 mb-2">{product.category}</div>
                            <h3 className="mb-2 dark:text-white">{product.name}</h3>
                            <div className="flex justify-between items-center">
                              <span className="text-xl text-red-600">
                                ${product.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => toggleFavorite(product)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                              >
                                <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 border dark:border-gray-700">
                  <h2 className="text-2xl mb-6 dark:text-white">Change Password</h2>

                  <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block mb-2 dark:text-white">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, oldPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 dark:text-white">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                          required
                          minLength={8}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div>
                      <label className="block mb-2 dark:text-white">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    {passwordMessage && (
                      <div
                        className={`p-4 rounded-lg ${
                          passwordMessage.includes('success')
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {passwordMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
