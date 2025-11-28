import Header from '@/components/layout/header';
import Hero from '@/components/landing/hero';
import About from '@/components/landing/about';
import Features from '@/components/landing/features';
import APIServices from '@/components/landing/apis-services';
import Testimonials from '@/components/landing/testimonials';
import Footer from '@/components/layout/footer';
import CTA from '@/components/landing/cta';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Features />
      <APIServices />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
