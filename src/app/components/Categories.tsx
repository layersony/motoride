import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const categories = [
  {
    id: 1,
    name: 'Helmets',
    image: 'https://images.unsplash.com/photo-1685826398847-0a5744b8be1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MTYxNDc0MHww&ixlib=rb-4.1.0&q=80&w=1080',
    count: '120+ Products',
  },
  {
    id: 2,
    name: 'Jackets',
    image: 'https://images.unsplash.com/photo-1654720498638-46c8d93bc32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwamFja2V0JTIwbGVhdGhlcnxlbnwxfHx8fDE3NzE1ODk4MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '85+ Products',
  },
  {
    id: 3,
    name: 'Gloves',
    image: 'https://images.unsplash.com/photo-1763919417453-dea1172b98fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZ2xvdmVzJTIwZ2VhcnxlbnwxfHx8fDE3NzE2MTQ3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '65+ Products',
  },
  {
    id: 4,
    name: 'Parts & Accessories',
    image: 'https://images.unsplash.com/photo-1759665996019-c2bdf600b90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcGFydHMlMjBlbmdpbmV8ZW58MXx8fHwxNzcxNjE0NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    count: '200+ Products',
  },
];

export function Categories() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">Shop by Category</h2>
          <p className="text-gray-600 dark:text-gray-400">Find exactly what you need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-72">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl mb-2">{category.name}</h3>
                  <p className="text-gray-300 mb-4">{category.count}</p>
                  <div className="flex items-center gap-2 text-red-500 group-hover:gap-4 transition-all">
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}