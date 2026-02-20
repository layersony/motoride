import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Speedster Sport X1',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sport Bikes',
  },
  {
    id: 2,
    name: 'Classic Cruiser 500',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1761227762792-eea264a70fd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZSUyMGNocm9tZXxlbnwxfHx8fDE3NzE2MTQ3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Cruisers',
  },
  {
    id: 3,
    name: 'Adventure Pro 800',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1767652784202-214920d12a85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBtb3RvcmN5Y2xlJTIwdG91cmluZ3xlbnwxfHx8fDE3NzE0OTA3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Adventure',
  },
  {
    id: 4,
    name: 'Racer Elite R1',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1758887699099-efa710f06a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBtb3RvcmN5Y2xlJTIwcmVkfGVufDF8fHx8MTc3MTYxNDczOXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Racing',
  },
  {
    id: 5,
    name: 'Vintage Classic 350',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1565625078391-42a8daecf4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGNsYXNzaWN8ZW58MXx8fHwxNzcxNTU4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Vintage',
  },
  {
    id: 6,
    name: 'E-Rider Future',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1701666469257-319f272914c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMG1vdG9yY3ljbGUlMjBtb2Rlcm58ZW58MXx8fHwxNzcxNTU4NDM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electric',
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Discover our top-selling motorcycles</p>
          </div>
          <Link to="/products" className="text-red-600 hover:text-red-700 font-medium">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
            >
              <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/product/${product.id}`} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Eye className="w-5 h-5 text-gray-700 dark:text-white" />
                  </Link>
                  <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-white" />
                  </button>
                </div>
              </div>
              <Link to={`/product/${product.id}`} className="block p-5">
                <div className="text-sm text-red-600 mb-2">{product.category}</div>
                <h3 className="text-lg mb-2 dark:text-white">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-red-600">Ksh {product.price.toLocaleString()}</span>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}