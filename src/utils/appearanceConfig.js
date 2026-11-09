const COLOR_KEYS = new Set([
  'backgroundColor',
  'background',
  'callButton',
  'primary',
  'primaryContainer',
  'card',
  'onSurface',
  'onSurfaceVariant',
]);
const ROOT_KEYS = new Set(['version', 'reset', 'theme', 'layout', 'text']);

export function parseAppearanceConfig(json) {
  if (typeof json !== 'string' || json.length > 16000) {
    throw new Error('La configuration QR dépasse la taille maximale autorisée.');
  }

  let config;
  try {
    config = JSON.parse(json);
  } catch {
    throw new Error('Le contenu doit être un JSON valide.');
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('La configuration doit être un objet JSON.');
  }
  if (Object.keys(config).some((key) => !ROOT_KEYS.has(key))) {
    throw new Error('La configuration contient une option non prise en charge.');
  }
  if (config.version !== 1) {
    throw new Error('La version de configuration doit être 1.');
  }
  if (config.reset !== undefined && config.reset !== true) {
    throw new Error('« reset » doit être true pour réinitialiser la configuration.');
  }
  if (config.reset === true) {
    if (Object.keys(config).some((key) => !['version', 'reset'].includes(key))) {
      throw new Error('Une configuration de réinitialisation ne peut pas contenir d’autres options.');
    }
    return { reset: true, theme: {}, layout: {}, text: {} };
  }

  const theme = {};
  if (config.theme !== undefined) {
    if (!config.theme || typeof config.theme !== 'object' || Array.isArray(config.theme)) {
      throw new Error('La section « theme » doit être un objet.');
    }
    for (const [key, value] of Object.entries(config.theme)) {
      if (!COLOR_KEYS.has(key)) {
        throw new Error(`Couleur non prise en charge : ${key}.`);
      }
      if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        throw new Error(`La couleur « ${key} » doit être au format #RRGGBB.`);
      }
      theme[key === 'backgroundColor' ? 'background' : key] = value.toUpperCase();
    }
  }

  const layout = {};
  if (config.layout !== undefined) {
    if (!config.layout || typeof config.layout !== 'object' || Array.isArray(config.layout)) {
      throw new Error('La section « layout » doit être un objet.');
    }
    if (Object.keys(config.layout).some((key) => !['actions', 'order'].includes(key))) {
      throw new Error('La configuration de disposition contient une option inconnue.');
    }
    if (
      config.layout.actions !== undefined &&
      !['stacked', 'inline'].includes(config.layout.actions)
    ) {
      throw new Error('« layout.actions » doit être « stacked » ou « inline ».');
    }
    if (config.layout.actions !== undefined) layout.actions = config.layout.actions;
    if (config.layout.order !== undefined) {
      if (!['call-first', 'scan-first'].includes(config.layout.order)) {
        throw new Error('« layout.order » doit être « call-first » ou « scan-first ».');
      }
      layout.order = config.layout.order;
    }
  }

  const text = {};
  if (config.text !== undefined) {
    if (!config.text || typeof config.text !== 'object' || Array.isArray(config.text)) {
      throw new Error('La section « text » doit être un objet.');
    }
    const entries = Object.entries(config.text);
    if (entries.length > 100) {
      throw new Error('La configuration ne peut pas contenir plus de 100 textes.');
    }
    for (const [source, replacement] of entries) {
      if (!source.trim() || source.length > 250) {
        throw new Error('Chaque texte d’origine doit contenir entre 1 et 250 caractères.');
      }
      if (typeof replacement !== 'string' || replacement.length > 250) {
        throw new Error('Chaque nouveau texte doit être une chaîne de 250 caractères maximum.');
      }
      text[source] = replacement;
    }
  }

  if (
    Object.keys(theme).length === 0 &&
    Object.keys(layout).length === 0 &&
    Object.keys(text).length === 0
  ) {
    throw new Error('La configuration ne contient aucune couleur ou disposition.');
  }

  return { reset: false, theme, layout, text };
}
