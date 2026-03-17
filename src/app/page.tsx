import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Highlights } from "@/components/site/Highlights";
import { Features } from "@/components/site/Features";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Downloads } from "@/components/site/Downloads";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <Hero />
        <Highlights />
        <Features />
        <HowItWorks />
        <Downloads />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
