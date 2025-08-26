// prefs.js — shared UI preferences (fonts + colors) for multiple games

// Default theme you can tweak
export const defaultPreferences = {
  fontBase: 16,                     // base font size in px
  radius: 18,                       // corner radius in px
  shadow: '0 10px 30px rgba(0,0,0,.4)',
  colors: {
    bg: '#0b1020',
    panel: '#121a33',
    muted: '#8ea0d0',
    accent: '#6de2ff',
    accent2: '#9cff6d',
    danger: '#ff6d8a',
    warning: '#ffd166',
    good: '#77ffb4',
    tile: '#141e3f',
    tile2: '#1b2753',
    text: '#e8eeff'
  }
};

// Apply a preferences object by writing CSS variables to :root
export function applyPreferences(prefs) {
  if (!prefs) return;
  const root = document.documentElement;

  // Scalars
  if (prefs.fontBase != null) root.style.setProperty('--font-base', `${prefs.fontBase}px`);
  if (prefs.radius   != null) root.style.setProperty('--radius', `${prefs.radius}px`);
  if (prefs.shadow)            root.style.setProperty('--shadow', prefs.shadow);

  // Colors
  const c = prefs.colors || {};
  const set = (name, val) => { if (val != null) root.style.setProperty(`--${name}`, val); };
  set('bg', c.bg);
  set('panel', c.panel);
  set('muted', c.muted);
  set('accent', c.accent);
  set('accent2', c.accent2);
  set('danger', c.danger);
  set('warning', c.warning);
  set('good', c.good);
  set('tile', c.tile);
  set('tile2', c.tile2);
  set('text', c.text);
}

// Helper to create a new prefs object by merging overrides into the default
export function makePreferences(overrides = {}) {
  const deepMerge = (a, b) => {
    const out = { ...a };
    for (const k in b) {
      const av = a[k], bv = b[k];
      out[k] = (av && typeof av === 'object' && !Array.isArray(av))
        ? deepMerge(av, bv)
        : bv;
    }
    return out;
  };
  return deepMerge(defaultPreferences, overrides);
}
