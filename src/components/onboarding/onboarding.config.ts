export interface Option {
  id: string;
  label: string;
  description: string;
  /** Small emoji/glyph used as a quiet visual anchor (decorative). */
  glyph: string;
}

export interface StepMeta {
  id: string;
  /** 1-based number shown in the rail. */
  index: number;
  /** Short rail label. */
  label: string;
  /** Eyebrow above the step title. */
  eyebrow: string;
  /** Step title (serif). */
  title: string;
  /** Supporting subtitle. */
  subtitle: string;
}

export const STEPS: StepMeta[] = [
  {
    id: "account",
    index: 1,
    label: "Account",
    eyebrow: "Step 1 of 6",
    title: "Welcome to Wayheld.",
    subtitle:
      "Let's confirm a few details, then tune Wayheld to the way you like to travel.",
  },
  {
    id: "style",
    index: 2,
    label: "Travel style",
    eyebrow: "Step 2 of 6",
    title: "How do you like to travel?",
    subtitle: "Pick the style that feels most like you. You can refine this later.",
  },
  {
    id: "interests",
    index: 3,
    label: "Interests",
    eyebrow: "Step 3 of 6",
    title: "What pulls you somewhere?",
    subtitle: "Choose a few interests so we can shape journeys around them.",
  },
  {
    id: "pace",
    index: 4,
    label: "Pace",
    eyebrow: "Step 4 of 6",
    title: "What's your natural pace?",
    subtitle: "Wayheld is built for slowness — but slowness looks different for everyone.",
  },
  {
    id: "preferences",
    index: 5,
    label: "Preferences",
    eyebrow: "Step 5 of 6",
    title: "A few travel preferences.",
    subtitle: "These help us honour the things that matter to you on the road.",
  },
  {
    id: "complete",
    index: 6,
    label: "Complete",
    eyebrow: "All set",
    title: "Your profile is ready.",
    subtitle: "Wayheld now understands how you like to move through the world.",
  },
];

export const TRAVEL_STYLES: Option[] = [
  {
    id: "cultural",
    label: "Cultural immersion",
    description: "Living traditions, craft, food and local rhythms.",
    glyph: "🏛️",
  },
  {
    id: "nature",
    label: "Nature & wilderness",
    description: "Landscapes, trails and the deep quiet of wild places.",
    glyph: "🏔️",
  },
  {
    id: "heritage",
    label: "Heritage & history",
    description: "Old towns, sacred sites and the weight of the past.",
    glyph: "🗿",
  },
  {
    id: "coastal",
    label: "Coastal & water",
    description: "Harbours, islands, rivers and the pull of the tide.",
    glyph: "🌊",
  },
  {
    id: "culinary",
    label: "Food & markets",
    description: "Kitchens, markets and meals that tell a place's story.",
    glyph: "🍲",
  },
  {
    id: "wellness",
    label: "Quiet & wellness",
    description: "Stillness, retreats and journeys that restore you.",
    glyph: "🧘",
  },
];

export const INTERESTS: Option[] = [
  { id: "architecture", label: "Architecture", description: "", glyph: "🏰" },
  { id: "cuisine", label: "Local cuisine", description: "", glyph: "🥘" },
  { id: "crafts", label: "Artisan crafts", description: "", glyph: "🧵" },
  { id: "hiking", label: "Hiking & trails", description: "", glyph: "🥾" },
  { id: "history", label: "History", description: "", glyph: "📜" },
  { id: "music", label: "Music & festivals", description: "", glyph: "🎶" },
  { id: "wildlife", label: "Wildlife", description: "", glyph: "🦋" },
  { id: "photography", label: "Photography", description: "", glyph: "📷" },
  { id: "spirituality", label: "Spirituality", description: "", glyph: "🕉️" },
  { id: "gardens", label: "Gardens & nature", description: "", glyph: "🌿" },
  { id: "markets", label: "Markets", description: "", glyph: "🛍️" },
  { id: "literature", label: "Literature", description: "", glyph: "📖" },
];

export const PACES: Option[] = [
  {
    id: "very-slow",
    label: "One place, deeply",
    description: "Settle into a single region and let it unfold completely.",
    glyph: "🐌",
  },
  {
    id: "slow",
    label: "Slow & unhurried",
    description: "A few stops, long stays, plenty of room to breathe.",
    glyph: "🌾",
  },
  {
    id: "balanced",
    label: "Gently balanced",
    description: "A considered mix of movement and stillness.",
    glyph: "⚖️",
  },
];

export const PREFERENCES: Option[] = [
  {
    id: "regenerative",
    label: "Regenerative stays",
    description: "Prioritise locally-owned, low-impact places to stay.",
    glyph: "🌱",
  },
  {
    id: "avoid-crowds",
    label: "Avoid the crowds",
    description: "Steer away from overtouristed hotspots.",
    glyph: "🍃",
  },
  {
    id: "rail-first",
    label: "Rail & slow transit",
    description: "Favour trains and ground travel over flights.",
    glyph: "🚂",
  },
  {
    id: "local-guides",
    label: "Local guides",
    description: "Connect with people who live where you're going.",
    glyph: "🧭",
  },
  {
    id: "small-group",
    label: "Quiet & small-scale",
    description: "Intimate experiences over big-group tours.",
    glyph: "🤍",
  },
  {
    id: "plastic-free",
    label: "Low-waste travel",
    description: "Reduce single-use plastics and footprint.",
    glyph: "♻️",
  },
];
