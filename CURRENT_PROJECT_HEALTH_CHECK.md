# Current Project Health Check

**Date:** June 22, 2026  
**Repository:** e:\QFN\wayheld  
**Branch:** master

---

## Test Results

### 1. Does build pass?

**NO** ❌

Build command: `npm run build`  
Exit code: 1

---

### 2. Does lint pass?

**NO** ❌

Lint command: `npm run lint`  
Exit code: 1

---

### 3. Does TypeScript pass?

**NO** ❌

TypeScript command: `npx tsc --noEmit`  
Exit code: 1

---

## Full Command Output

### Build Output

```
> wayheld@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
✓ Compiled successfully in 15.1s
  Running TypeScript  ...Failed to type check.

./src/app/verify-email/content.tsx:21:5
Type error: Argument of type 'string | undefined' is not assignable to parameter of type 'string | (() => string)'.
  Type 'undefined' is not assignable to type 'string | (() => string)'.

  19 |   );
  20 |   const [error, setError] = useState<string>(
> 21 |     token ? undefined : "Invalid verification link.",
     |     ^
  22 |   );
  23 |
  24 |   useEffect(() => {
Next.js build worker exited with code: 1 and signal: null
```

---

### Lint Output

```
> wayheld@0.1.0 lint
> eslint


E:\QFN\wayheld\src\components\hero\AiInsightPanel.tsx
  35:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

E:\QFN\wayheld\src\components\hero\AiInsightPanel.tsx:35:7
  33 |   useEffect(() => {
  34 |     if (motionless) {
> 35 |       setTyped(insight.query);
     |       ^^^^^^^^ Avoid calling setState() directly within an effect
  36 |       setPhase("answering");
  37 |       return;
  38 |     }  react-hooks/set-state-in-effect

E:\QFN\wayheld\src\components\hero\ResilientImage.tsx
  32:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

E:\QFN\wayheld\src\components\hero\ResilientImage.tsx:32:5
  30 |   // Reset when the primary source changes (e.g. rotating destinations).
  31 |   useEffect(() => {
> 32 |     setSourceIndex(0);
     |     ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  33 |     setExhausted(false);
  34 |   }, [src]);
  35 |  react-hooks/set-state-in-effect

E:\QFN\wayheld\src\components\hero\useShowcaseRotation.ts
  61:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

E:\QFN\wayheld\src\components\hero\useShowcaseRotation.ts:61:5
  59 |     if (paused) return;
  60 |
> 61 |     resetTimer();
     |     ^^^^^^^^^^ Avoid calling setState() directly within an effect
  62 |
  63 |     const tick = (now: number) => {
  64 |       const elapsed = now - startRef.current;  react-hooks/set-state-in-effect

✖ 3 problems (3 errors, 0 warnings)
```

---

### TypeScript Output

```
src/app/verify-email/content.tsx:21:5 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string | (() => string)'.
  Type 'undefined' is not assignable to type 'string | (() => string)'.

21     token ? undefined : "Invalid verification link.",
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 1 error in src/app/verify-email/content.tsx:21
```

---

## 4. Every Current Error

| # | File | Line | Error Type | Error | Rule |
|---|------|------|-----------|-------|------|
| 1 | `src/app/verify-email/content.tsx` | 21 | TypeScript | `Argument of type 'string \| undefined' is not assignable to parameter of type 'string \| (() => string)'` | TS2345 |
| 2 | `src/components/hero/AiInsightPanel.tsx` | 35 | ESLint | `Calling setState synchronously within an effect can trigger cascading renders` | react-hooks/set-state-in-effect |
| 3 | `src/components/hero/ResilientImage.tsx` | 32 | ESLint | `Calling setState synchronously within an effect can trigger cascading renders` | react-hooks/set-state-in-effect |
| 4 | `src/components/hero/useShowcaseRotation.ts` | 61 | ESLint | `Calling setState synchronously within an effect can trigger cascading renders` | react-hooks/set-state-in-effect |

---

## 5. Total Error Count

**4 errors total**

- TypeScript errors: 1
- ESLint errors: 3
- Build-blocking: YES (1 error)

---

## Summary

| Check | Result | Status |
|-------|--------|--------|
| Build | FAILED | ❌ |
| Lint | FAILED | ❌ |
| TypeScript | FAILED | ❌ |
| Deployable | NO | ❌ |

**Project is not production-ready. Build pipeline is blocked.**
