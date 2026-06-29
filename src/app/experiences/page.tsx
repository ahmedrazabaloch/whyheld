import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PageHero, ContentBlock, FeatureGrid, FinalCta } from "@/components/sections";

export const metadata: Metadata = {
  title: "Experiences — Wayheld",
  description: "Discover meaningful travel experiences that foster deeper connections with places, culture, and history.",
  openGraph: {
    title: "Experiences — Wayheld",
    description: "Discover meaningful travel experiences that foster deeper connections with places, culture, and history.",
    url: "https://wayheld.com/experiences",
    siteName: "Wayheld",
    images: [
      {
        url: "/images/experiences/experiences-og.webp",
        width: 1200,
        height: 630,
        alt: "Wayheld Experiences",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

const EXPERIENCES = [
  {
    title: "Cultural Immersion",
    description: "Step beyond tourist attractions and engage with local communities, traditions, and ways of life. Our cultural experiences connect you with artisans, storytellers, and locals who share their heritage and perspectives.",
    image: "/images/experiences/experiences-feature-1.webp",
    alt: "Artisan working in a traditional workshop",
  },
  {
    title: "Historical Discovery",
    description: "Uncover the layers of history that shape destinations today. Our historical experiences go beyond guidebook facts to reveal the human stories, conflicts, and triumphs that have shaped places over time. Walk ancient paths with local historians.",
    image: "/images/experiences/experiences-feature-2.webp",
    alt: "Ancient stone pathway in a remote village",
    reverse: true,
  },
  {
    title: "Mindful Exploration",
    description: "Embrace slow travel that prioritizes depth over breadth. Our mindful exploration experiences encourage you to spend quality time in fewer places, allowing for genuine understanding and connection. Contemplative walks through landscapes and quiet reflection.",
    image: "/images/experiences/experiences-feature-3.webp",
    alt: "Solitary figure walking through a quiet misty valley",
  },
];

export default function ExperiencesPage() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <PageHero
          title="Experiences"
          subtitle="Discover meaningful travel experiences that foster deeper connections with places, culture, and history. Moving beyond surface-level tourism to create lasting memories."
          image="/images/experiences/experiences-hero.webp"
          alt="Peaceful sunset over rolling hills"
          kicker="Journey Deeply"
        />

        <ContentBlock
          id="intro"
          kickerText="Introduction"
          title={<>The essence of <br /><span className="italic text-[#74876B]">slow travel.</span></>}
          bgWhite={true}
        >
          <p>
            An experience should leave you fundamentally changed, even in small ways. We believe that true travel is an exchange, not a transaction. By engaging deeply with local customs, food, and people, we open ourselves up to a broader understanding of the world.
          </p>
        </ContentBlock>

        <div className="py-24 bg-[#F4EFE6]">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 mb-16">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#74876B] mb-6">
              Our Experiences
            </p>
            <h2 className="font-display text-4xl text-[#33332F] sm:text-5xl">
              Curated for <span className="italic text-[#74876B]">curiosity.</span>
            </h2>
          </div>
          <FeatureGrid id="experiences-grid" features={EXPERIENCES} bgWhite={false} />
        </div>

        <FinalCta
          headlineLead="Find your"
          headlineAccent="next path"
          headlineTail="."
          subtitle="Explore the landscapes and communities waiting for those willing to travel slowly."
          buttonText="Explore Meaningful Experiences"
        />
      </main>
    </MarketingLayout>
  );
}
