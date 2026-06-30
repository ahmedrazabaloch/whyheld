"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../..");
const chunksDir = path.join(root, ".next/static/chunks");

// Signatures we want to detect in each chunk
const SIGS = {
  "motion/react":     ["AnimatePresence","useScroll","useTransform","useMotionValue","createMotionComponent"],
  "next-auth/react":  ["signIn","signOut","useSession","SessionProvider"],
  "react-hook-form":  ["useForm","Controller","FormProvider","useFormContext"],
  "next/navigation":  ["usePathname","useRouter","useSearchParams"],
  "next/image":       ["ImageElement","optimizeImage"],
  "next-auth":        ["__nextAuth","authConfig","getSession"],
  "Prisma":           ["PrismaClient","prisma_1"],
  "bcrypt":           ["bcryptjs","SALT_ROUNDS"],
  "zod":              ["ZodString","z.object","ZodObject"],
  "zustand":          ["createStore","zustand"],
  "stripe":           ["Stripe","StripeElements"],
};

// Build manifest can tell us which chunks are app-router internals
const buildManifestPath = path.join(root, ".next/static");
const builds = fs.readdirSync(buildManifestPath).filter(d => {
  const p = path.join(buildManifestPath, d);
  return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "_buildManifest.js"));
});

console.log("=== CHUNK CONTENT ANALYSIS ===");
const allChunks = fs.readdirSync(chunksDir)
  .filter(f => f.endsWith(".js"))
  .map(f => ({ name: f, size: fs.statSync(path.join(chunksDir, f)).size }))
  .sort((a, b) => b.size - a.size);

allChunks.forEach(chunk => {
  const text = fs.readFileSync(path.join(chunksDir, chunk.name), "utf8");
  const found = {};
  Object.entries(SIGS).forEach(([lib, keywords]) => {
    found[lib] = keywords.some(k => text.includes(k));
  });
  const flags = Object.entries(found).filter(([,v]) => v).map(([k]) => k);
  console.log(`\n${chunk.name} (${(chunk.size/1024).toFixed(1)} KB):`);
  if (flags.length === 0) {
    console.log(`  libraries: [none detected]`);
  } else {
    console.log(`  libraries: ${flags.join(", ")}`);
  }
  // Peek at first 400 chars of the chunk to see what it defines
  const preview = text.slice(0, 400).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");
  console.log(`  preview: ${preview.slice(0, 250)}...`);
});

// Look at build manifest to correlate chunks → page routes
const buildFolder = builds[0];
if (buildFolder) {
  const bm = path.join(buildManifestPath, buildFolder, "_buildManifest.js");
  const bmText = fs.readFileSync(bm, "utf8");
  console.log("\n=== BUILD MANIFEST (route → chunk mapping) ===");
  console.log(bmText.slice(0, 3000));
}
