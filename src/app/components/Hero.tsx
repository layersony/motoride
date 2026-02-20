import { Users, Star, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';

export function Hero() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50K+' },
    { icon: Star, label: 'Average Rating', value: '4.8' },
    { icon: Package, label: 'Products Sold', value: '25K+' },
    { icon: TrendingUp, label: 'Years in Business', value: '15+' },
  ];

  return (
    <section className="relative bg-gray-900 dark:bg-black text-white py-20 md:py-32 min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1675868934032-0607db7734dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcmlkZXIlMjBoaWdod2F5JTIwcm9hZHxlbnwxfHx8fDE3NzE2MTUwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Motorcycle rider on highway"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl mb-6">
            Ride Your Dreams
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Discover premium motorcycles, gear, and accessories for every adventure
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/products" className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-lg">
              Shop Collection
            </Link>
            <Link to="/products" className="px-8 py-4 border-2 border-white hover:bg-white hover:text-gray-900 rounded-lg transition-colors text-lg">
              View Categories
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center md:text-left p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Icon className="w-8 h-8 mb-3 text-red-500 mx-auto md:mx-0" />
                  <div className="text-2xl md:text-3xl mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}