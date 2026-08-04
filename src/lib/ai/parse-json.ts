/**
 * Extract and repair JSON from AI text responses.
 * Models often wrap JSON in markdown fences or emit minor key/colon typos
 * (especially on long first Discovery payloads).
 */

export function extractJsonCandidate(rawText: string): string {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  // Bare object / array somewhere in the text
  const firstObj = trimmed.indexOf("{");
  const firstArr = trimmed.indexOf("[");
  let start = -1;
  if (firstObj >= 0 && firstArr >= 0) start = Math.min(firstObj, firstArr);
  else start = Math.max(firstObj, firstArr);

  if (start < 0) return trimmed;

  const lastObj = trimmed.lastIndexOf("}");
  const lastArr = trimmed.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (end > start) return trimmed.slice(start, end + 1).trim();

  return trimmed.slice(start).trim();
}

/**
 * Fix common model JSON defects that break JSON.parse.
 */
export function repairAiJsonText(text: string): string {
  let s = text.trim();

  // Normalize smart quotes
  s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // "weatherNote "\n\n:  →  "weatherNote":
  // Trailing spaces inside object keys + whitespace before colon
  s = s.replace(/"([^"\\]+?)\s+"\s*:/g, (_m, key: string) => {
    return `"${key.trim()}":`;
  });

  // Newlines / spaces between closing quote of key and colon (when already trimmed)
  s = s.replace(/"(\s*\n\s*)+:/g, '":');

  // Trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  // Remove BOM
  s = s.replace(/^\uFEFF/, "");

  return s;
}

export function parseAiJson(rawText: string): unknown {
  const candidate = extractJsonCandidate(rawText);

  try {
    return JSON.parse(candidate);
  } catch {
    // fall through to repair
  }

  const repaired = repairAiJsonText(candidate);
  try {
    return JSON.parse(repaired);
  } catch {
    // Last resort: drop incomplete trailing place objects if array truncated mid-key
    const truncated = tryRecoverTruncatedPlacesJson(repaired);
    if (truncated !== null) return truncated;
    throw new Error("Invalid JSON after repair");
  }
}

/**
 * If places JSON is truncated mid-object, keep complete place objects only.
 */
function tryRecoverTruncatedPlacesJson(text: string): unknown | null {
  const placesIdx = text.search(/"places"\s*:/);
  if (placesIdx < 0) return null;

  const arrStart = text.indexOf("[", placesIdx);
  if (arrStart < 0) return null;

  const places: unknown[] = [];
  let i = arrStart + 1;

  while (i < text.length) {
    while (i < text.length && /[\s,]/.test(text[i]!)) i++;
    if (text[i] === "]") break;
    if (text[i] !== "{") break;

    let depth = 0;
    let inString = false;
    let escape = false;
    const start = i;

    for (; i < text.length; i++) {
      const ch = text[i]!;
      if (inString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          const slice = text.slice(start, i + 1);
          try {
            places.push(JSON.parse(repairAiJsonText(slice)));
          } catch {
            // incomplete object — stop
            return places.length > 0 ? { places } : null;
          }
          i++;
          break;
        }
      }
    }

    if (depth !== 0) {
      return places.length > 0 ? { places } : null;
    }
  }

  return places.length > 0 ? { places } : null;
}
