import Hero from "@/modules/home/components/Hero";
import TrustSection from "@/modules/home/components/TrustSection";
import Testimonials from "@/modules/home/components/Testimonials";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <TrustSection />
      <Testimonials />
    </div>
  );
}
