import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PageHero, ContentBlock, FeatureGrid, FinalCta } from "@/components/sections";

export const metadata: Metadata = {
  title: "About Wayheld — Our Philosophy",
  description: "Wayheld is a slow travel companion designed for intentional, regenerative journeys. Discover our philosophy and how we guide travelers to deeper connections.",
  openGraph: {
    title: "About Wayheld — Our Philosophy",
    description: "Wayheld is a slow travel companion designed for intentional, regenerative journeys.",
    url: "https://wayheld.com/about",
    siteName: "Wayheld",
    images: [
      {
        url: "/images/about/about-og.webp",
        width: 1200,
        height: 630,
        alt: "Wayheld About Cover",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Wayheld — Our Philosophy",
    description: "Wayheld is a slow travel companion designed for intentional, regenerative journeys.",
    images: ["/images/about/about-og.webp"],
  },
};

const GUIDING_PRINCIPLES = [
  {
    title: "Travel Slowly",
    description: "Take time to truly experience each destination, allowing for spontaneous discoveries and meaningful connections. We believe the rush of checking boxes is the enemy of travel.",
    image: "/images/about/about-feature-1.webp",
    alt: "Quiet misty forest trail",
  },
  {
    title: "Honor Heritage",
    description: "Appreciate the history and culture of every place, understanding the stories that shaped each destination. We center the voices of the people who live there.",
    image: "/images/about/about-feature-2.webp",
    alt: "Artisan working on traditional pottery",
    reverse: true,
  },
  {
    title: "Discover Beyond",
    description: "Venture beyond common tourist routes to find authentic experiences and hidden cultural gems. It’s the quiet cafes and narrow alleys that leave the longest impression.",
    image: "/images/about/about-feature-3.webp",
    alt: "Small cobblestone village street",
  },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <PageHero
          title="About Wayheld"
          subtitle="Wayheld means to be held by a place, to slow down enough that somewhere can actually change you. That’s what we’ve always believed travel could be."
          image="/images/about/about-hero.webp"
          alt="Majestic quiet mountain valley"
          kicker="Our Story"
        />

        <ContentBlock
          id="philosophy"
          kickerText="Our Philosophy"
          title={<>The world is not <br /><span className="italic text-[#74876B]">a checklist.</span></>}
          bgWhite={true}
        >
          <p>
            Most travel concentrates crowds in fragile places, extracts culture as spectacle and leaves communities managing the aftermath. For years, our sister company, Traceless Tours, has operated on a different premise: We believe communities we visit are not the backdrop, but the authors.
          </p>
          <p>
            We know that how we travel matters as much as where we go. True discovery doesn&apos;t happen when you&apos;re rushing to the next landmark—it happens when you sit still long enough to understand the rhythm of a new place.
          </p>
        </ContentBlock>

        <ContentBlock
          id="purpose"
          kickerText="Our Purpose"
          title={<>Scale intimacy, <br /><span className="italic text-[#74876B]">reduce impact.</span></>}
          bgWhite={false}
        >
          <p>
            Wayheld carries our &quot;Traceless Tours&quot; ethos into the wider world by curating slow travel routes, cultural experiences off the beaten path and connecting travelers with the heart of communities.
          </p>
          <p>
            The problem with extractive tourism is too large to solve one hand-curated itinerary at a time. Using AI in a measured way helps more people travel to more places. It matches travelers to slow, low-carbon journeys, encourages fewer flights, longer stays and deeper connections.
          </p>
        </ContentBlock>

        <div className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 mb-16">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#74876B] mb-6">
              Guiding Principles
            </p>
            <h2 className="font-display text-4xl text-[#33332F] sm:text-5xl">
              The values that <span className="italic text-[#74876B]">shape our platform.</span>
            </h2>
          </div>
          <FeatureGrid id="principles" features={GUIDING_PRINCIPLES} bgWhite={true} />
        </div>

        <FinalCta
          headlineLead="The journey"
          headlineAccent="starts slowly"
          headlineTail="."
          subtitle="Join Wayheld today and start exploring the world with intention, curiosity, and respect for the places you visit."
          buttonText="Discover the Wayheld Philosophy"
        />
      </main>
    </MarketingLayout>
  );
}
