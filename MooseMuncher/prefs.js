// prefs.js — Theme & font preferences
// Exposes: applyPreferences(), loadPreferences(), savePreferences(), DEFAULT_PREFS

const ROOT = document.documentElement;
const VARS_COLOR = [
  '--bg','--panel','--muted','--accent','--accent2','--danger','--warning','--good',
  '--tile','--tile2','--tile-eaten','--tile-eaten2','--tile-stroke','--tile-stroke-eaten','--tile-text',
  '--progress-empty','--progress-border','--progress-start','--progress-end',
  '--correct-halo','--troggle-colors'
];

export const DEFAULT_PREFS = {
  fontScale: 1,
  fontFamily: null, // leave null to keep CSS default
  colors: {
    // leave undefined to keep CSS defaults; set any subset to override
    // Example: bg: '#10192b', accent: '#7cd4ff', ...
  }
};

export function applyPreferences(prefs = {}) {
  const p = { ...DEFAULT_PREFS, ...prefs };
  // Font scale (scales most UI text; canvas text is sized by tile, not UI scale)
  if (typeof p.fontScale === 'number' && isFinite(p.fontScale) && p.fontScale > 0) {
    ROOT.style.setProperty('--font-scale', String(p.fontScale));
  }
  // Optional font family
  if (p.fontFamily && typeof p.fontFamily === 'string') {
    ROOT.style.setProperty('--font-family', p.fontFamily);
  }
  // Colors
  if (p.colors && typeof p.colors === 'object') {
    for (const key of Object.keys(p.colors)) {
      const cssVar = '--' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase()); // camelCase -> --camel-case
      if (VARS_COLOR.includes(cssVar)) {
        ROOT.style.setProperty(cssVar, String(p.colors[key]));
      }
    }
    // Special case: troggle colors array
    if (Array.isArray(p.colors.troggleColors)) {
      ROOT.style.setProperty('--troggle-colors', p.colors.troggleColors.join(','));
    }
  }
}

const LS_KEY = 'moose-muncher:prefs';

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs));
  } catch {}
}
