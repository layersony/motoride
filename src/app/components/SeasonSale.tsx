import { Tag } from 'lucide-react';
import { Link } from 'react-router';

const saleProducts = [
  {
    id: 1,
    name: 'Speedster Sport X1',
    originalPrice: 12999,
    salePrice: 9999,
    discount: 23,
    image: 'https://images.unsplash.com/photo-1609142297440-7ab128d4a5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBibGFja3xlbnwxfHx8fDE3NzE1Njk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Classic Cruiser 500',
    originalPrice: 9999,
    salePrice: 7499,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1761227762792-eea264a70fd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnVpc2VyJTIwbW90b3JjeWNsZSUyMGNocm9tZXxlbnwxfHx8fDE3NzE2MTQ3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Vintage Classic 350',
    originalPrice: 7999,
    salePrice: 5999,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1565625078391-42a8daecf4bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGNsYXNzaWN8ZW58MXx8fHwxNzcxNTU4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function SeasonSale() {
  return (
    <section className="py-16 bg-gradient-to-br from-red-600 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 text-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl">Winter Season Sale</h2>
          </div>
          <p className="text-lg mb-4">Save up to 25% on selected motorcycles - Limited time only!</p>
          <Link
            to="/products?filter=sale"
            className="inline-block px-6 py-3 bg-white text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            View All Sale Items
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {saleProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <div className="absolute top-4 right-4 z-10 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg">
                  -{product.discount}%
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg mb-3 dark:text-white">{product.name}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl text-red-600">Ksh {product.salePrice.toLocaleString()}</span>
                  <span className="text-lg text-gray-500 line-through">
                    Ksh {product.originalPrice.toLocaleString()}
                  </span>
                </div>
                <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Grab the Deal
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}