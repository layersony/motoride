import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';

const newProducts = [
  {
    id: 1,
    name: 'Carbon Fiber Helmet Pro',
    price: 599,
    image: 'https://images.unsplash.com/photo-1685826398847-0a5744b8be1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MTYxNDc0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
  },
  {
    id: 2,
    name: 'Premium Leather Jacket',
    price: 449,
    image: 'https://images.unsplash.com/photo-1654720498638-46c8d93bc32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwamFja2V0JTIwbGVhdGhlcnxlbnwxfHx8fDE3NzE1ODk4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Racing Gloves Pro',
    price: 129,
    image: 'https://images.unsplash.com/photo-1763919417453-dea1172b98fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZ2xvdmVzJTIwZ2VhcnxlbnwxfHx8fDE3NzE2MTQ3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
  },
  {
    id: 4,
    name: 'Performance Exhaust Kit',
    price: 899,
    image: 'https://images.unsplash.com/photo-1759665996019-c2bdf600b90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcGFydHMlMjBlbmdpbmV8ZW58MXx8fHwxNzcxNjE0NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
  },
];

export function NewArrivals() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">New Arrivals</h2>
            <p className="text-gray-600 dark:text-gray-400">Latest gear and accessories</p>
          </div>
          <Link to="/products?filter=new" className="text-red-600 hover:text-red-700 font-medium">
            View All New Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
            >
              {product.badge && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  {product.badge}
                </div>
              )}
              <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-red-600">${product.price}</span>
                  <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}