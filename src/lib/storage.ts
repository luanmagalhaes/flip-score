import type { Match } from "@/types/game";

const matchKey = "flipscore.match";
const tutorialKey = "flipscore.tutorial";
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: Match | null = null;

function announce() {
  listeners.forEach((listener) => listener());
}

export function subscribeMatch(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function matchSnapshot(): Match | null {
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(matchKey);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;

    try {
      const parsed = raw ? (JSON.parse(raw) as Match) : null;

      cached = parsed && Array.isArray(parsed.players) ? parsed : null;
    } catch {
      cached = null;
    }
  }

  return cached;
}

export function serverMatchSnapshot(): Match | null {
  return null;
}

export function saveMatch(match: Match) {
  try {
    window.localStorage.setItem(matchKey, JSON.stringify(match));
  } catch {
    return;
  }

  announce();
}

export function clearMatch() {
  try {
    window.localStorage.removeItem(matchKey);
  } catch {
    return;
  }

  announce();
}

export function tutorialSnapshot(): boolean {
  try {
    return window.localStorage.getItem(tutorialKey) === "1";
  } catch {
    return true;
  }
}

export function serverTutorialSnapshot(): boolean {
  return true;
}

export function rememberTutorialSeen() {
  try {
    window.localStorage.setItem(tutorialKey, "1");
  } catch {
    return;
  }

  announce();
}
