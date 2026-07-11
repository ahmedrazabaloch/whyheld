import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import {
  PageHero,
  ContentBlock,
  FeatureGrid,
  FinalCta,
} from "@/components/sections";

export const metadata: Metadata = {
  title: "Experiences — Wayheld",
  description:
    "Discover meaningful travel experiences that foster deeper connections with places, culture, and history.",
  openGraph: {
    title: "Experiences — Wayheld",
    description:
      "Discover meaningful travel experiences that foster deeper connections with places, culture, and history.",
    url: "/experiences",
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
    description:
      "There’s a potter in Puglia that has used the same wheel for forty years, a grandmother in Crail who still wraps fish suppers in yesterday's paper. We route you toward the people a place actually belongs to instead of a staged cultural event. We’d rather give you an afternoon that happens to include them.",
    image: "/images/hero/hero-4.webp",
    alt: "Artisan working in a traditional workshop",
  },
  {
    title: "Historical Discovery",
    description:
      "Every guidebook gives you the date. Almost none give you the argument of who built it, who paid for it, who it displaced. We pair you with people who've spent decades in the archive or the village, so the ruins stop being scenery and start being evidence.",
    image: "/images/hero/hero-3.webp",
    alt: "Ancient stone pathway in a remote village",
    reverse: true,
  },
  {
    title: "Mindful Exploration",
    description:
      "Two places in nine days, not nine places in two. We'd rather you leave knowing one valley's weather, its market days, its quiet hour, than have an itinerary filled with places and no memory of any single afternoon.",
    image: "/images/travel-assets/07_desert_hiker.jpg",
    alt: "Solitary figure walking through a quiet misty valley",
  },
];

export default function ExperiencesPage() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <PageHero
          title="Experiences"
          subtitle="Discover meaningful travel experiences that foster deeper connections with places, culture, and history. Go fewer places. Stay longer. Leave changed."
          image="/images/experiences/experiences-hero.webp"
          alt="Peaceful sunset over rolling hills"
          kicker="Journey Deeply"
        />

        <ContentBlock
          id="intro"
          kickerText="Introduction"
          title={
            <>
              The essence of <br />
              <span className="italic text-[#74876B]">slow travel.</span>
            </>
          }
          bgWhite={true}
        >
          <p>
            Most trips are spent arriving. You land, orient, photograph, and
            leave just as the place starts to make sense. We build experiences
            around the part that usually gets cut after the jet lag wears off,
            when a town stops being scenery and starts being somewhere you know.
          </p>
        </ContentBlock>

        <div className="py-24 bg-[#F4EFE6]">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 mb-16">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#74876B] mb-6">
              Our Experiences
            </p>
            <h2 className="font-display text-4xl text-[#33332F] sm:text-5xl">
              Curated for{" "}
              <span className="italic text-[#74876B]">curiosity.</span>
            </h2>
          </div>
          <FeatureGrid
            id="experiences-grid"
            features={EXPERIENCES}
            bgWhite={false}
          />
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
