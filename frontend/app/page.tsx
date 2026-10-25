import { Navbar } from "@/app/components/layout/Navbar";
import { Hero } from "@/app/components/landing/Hero";
import SmartJobInput from "@/app/components/landing/SmartJobInput";
import CategoriesGrid from "@/app/components/landing/CategoriesGrid";
import HowItWorks from "@/app/components/landing/HowItWorks";
import PricingInsight from "@/app/components/landing/PricingInsight";
import PlanComparison from "@/app/components/landing/PlanComparison";
import Testimonials from "@/app/components/landing/Testimonials";
import CTASection from "@/app/components/landing/CTASection";
import Footer from "@/app/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SmartJobInput />
      <CategoriesGrid />
      <HowItWorks />
      <PricingInsight />
      <PlanComparison />
      <Testimonials />
      <CTASection />
      <Footer />
    </>
  );
}