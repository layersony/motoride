import { Hero } from '../components/Hero';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { Categories } from '../components/Categories';
import { NewArrivals } from '../components/NewArrivals';
import { SeasonSale } from '../components/SeasonSale';
import { Testimonials } from '../components/Testimonials';
import { Newsletter } from '../components/Newsletter';

export function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <NewArrivals />
      <SeasonSale />
      <Testimonials />
      <Newsletter />
    </>
  );
}
