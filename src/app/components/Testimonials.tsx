import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'James Wilson',
    image: 'https://images.unsplash.com/photo-1554765345-6ad6a5417cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE1NDAyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5,
    comment: 'Absolutely love my new bike! The customer service was exceptional and the delivery was quick. MotoRide has the best selection of motorcycles.',
  },
  {
    id: 2,
    name: 'Sarah Thompson',
    image: 'https://images.unsplash.com/photo-1745434159123-4908d0b9df94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmd8ZW58MXx8fHwxNzcxNTIwNzExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5,
    comment: "The quality of gear I received exceeded my expectations. From helmets to jackets, everything is top-notch. Highly recommend MotoRide!",
  },
  {
    id: 3,
    name: 'Michael Chen',
    image: 'https://images.unsplash.com/photo-1750741268857-7e44510f867d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc21hbiUyMHBvcnRyYWl0JTIwY2FzdWFsfGVufDF8fHx8MTc3MTYxNDc0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4,
    comment: 'Great experience shopping here! The website is easy to navigate, prices are competitive, and the products are authentic. Will buy again!',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-400">Real reviews from real riders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold dark:text-white">{testimonial.name}</h4>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
