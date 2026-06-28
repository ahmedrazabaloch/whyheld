import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PageHero, ContactSection, FinalCta } from "@/components/sections";

export const metadata: Metadata = {
  title: "Contact — Wayheld",
  description: "Get in touch with the Wayheld team. We're here to help you plan your next meaningful journey.",
  openGraph: {
    title: "Contact — Wayheld",
    description: "Get in touch with the Wayheld team. We're here to help you plan your next meaningful journey.",
    url: "https://wayheld.com/contact",
    siteName: "Wayheld",
    images: [
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Wayheld Contact",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col bg-white">
        <PageHero
          title="Contact Us"
          subtitle="Whether you have a question about our journeys, want to partner with us, or just want to say hello, we are here."
          image="https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&q=80&w=2000"
          alt="Vintage writing desk overlooking a garden"
          kicker="Reach Out"
        />

        <div className="py-24">
          <ContactSection />
        </div>

        <FinalCta
          headlineLead="Ready to"
          headlineAccent="begin"
          headlineTail="?"
          subtitle="Or if you're ready to start planning, explore our platform."
          buttonText="Go to Dashboard"
        />
      </main>
    </MarketingLayout>
  );
}
