import { Helmet } from 'react-helmet-async';
import Hero from '@/components/Hero';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedListings from '@/components/FeaturedListings';
import HowItWorks from '@/components/HowItWorks';
import TopSellers from '@/components/TopSellers';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>FarmDirect - Local Farm Produce Marketplace</title>
        <meta
          name="description"
          content="Discover and purchase homegrown produce from local farmers and gardeners near you. Fresh from local farms direct to your table."
        />
      </Helmet>
      
      <Hero />
      <FeaturedCategories />
      <FeaturedListings />
      <HowItWorks />
      <TopSellers />
      <Testimonials />
      <CTASection />
    </>
  );
}
