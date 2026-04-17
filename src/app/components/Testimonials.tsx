import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { coreApi, type ApiTestimonial } from '../services/api';

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coreApi
      .getTestimonials()
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-2 dark:text-white">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-400">Real reviews from real riders</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  {testimonial.avatar_image ? (
                    <img
                      src={testimonial.avatar_image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 text-xl font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold dark:text-white">{testimonial.name}</h4>
                    {testimonial.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                    )}
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
                <p className="text-gray-600 dark:text-gray-400 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
