import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PageHero, ContentBlock, FeatureGrid, FinalCta } from "@/components/sections";

export const metadata: Metadata = {
  title: "Commitment — Wayheld",
  description: "We encourage travelers to move through places with care, curiosity, and cultural respect.",
  openGraph: {
    title: "Commitment — Wayheld",
    description: "We encourage travelers to move through places with care, curiosity, and cultural respect.",
    url: "https://wayheld.com/commitment",
    siteName: "Wayheld",
    images: [
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Wayheld Commitment",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

const COMMITMENTS = [
  {
    title: "The Art of Slow Travel",
    description: "Speed destroys the subtle textures of experience. When we rush through places, we miss the quiet conversations, the hidden pathways, and the gentle rhythms that define a destination's true character. Slow travel is not about taking more time, it's about being present to the time you have.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800",
    alt: "Traveler standing overlooking a vast misty mountain range",
  },
  {
    title: "Honoring Cultural Heritage",
    description: "Every destination carries the weight of history, the wisdom of traditions, and the hopes of its people. Respectful travel means approaching these places as a gracious guest, not a consumer of someone else's heritage. At Wayheld, that responsibility runs through every decision we make.",
    image: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&q=80&w=800",
    alt: "Local market in an old town",
    reverse: true,
  },
  {
    title: "Discovering Meaningful Routes",
    description: "The path between destinations can be as transformative as the destinations themselves. We believe in routes that reveal a landscape's character, connect communities, and tell stories through geography. These are not the fastest routes, they are the most honest ones.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    alt: "Small village nestled in green hills",
  },
];

export default function CommitmentPage() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <PageHero
          title="Commitment"
          subtitle="We encourage travelers to move through places with care, curiosity, and cultural respect. These are standards we share."
          image="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=2000"
          alt="Mist rolling over a dense green forest"
          kicker="Our Promise"
        />

        <ContentBlock
          id="intro"
          kickerText="Our Commitment"
          title={<>Building tools for <br /><span className="italic text-[#74876B]">better travel.</span></>}
          bgWhite={true}
        >
          <p>
            We are not a perfect company navigating an imperfect world without contradiction. We take the contradictions seriously, work on them continuously, and believe that travel, done with care and in right relationship, is one of the most powerful experiences for human connection and understanding.
          </p>
          <p>
            Wayheld uses AI. We want to be honest about what that means, and why we believe it serves our mission rather than contradicting it. Technology doesn&apos;t decide what&apos;s worth experiencing in a place. The community does. Wayheld helps the traveler find their way there.
          </p>
        </ContentBlock>

        <div className="py-24 bg-[#F4EFE6]">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 mb-16">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#74876B] mb-6">
              Core Principles
            </p>
            <h2 className="font-display text-4xl text-[#33332F] sm:text-5xl">
              How we <span className="italic text-[#74876B]">stand behind</span> our words.
            </h2>
          </div>
          <FeatureGrid id="commitments-grid" features={COMMITMENTS} bgWhite={false} />
        </div>

        <FinalCta
          headlineLead="Travel with"
          headlineAccent="purpose"
          headlineTail="."
          subtitle="Join a community of travelers committed to leaving places better than they found them."
          buttonText="Travel With Purpose"
        />
      </main>
    </MarketingLayout>
  );
}
