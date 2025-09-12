const dictionaries = {
  pt: () => import('../dictionaries/pt.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  es: () => import('../dictionaries/es.json').then((module) => module.default),
}

export const getDictionary = async (locale: 'pt' | 'en' | 'es') =>
  dictionaries[locale]?.() ?? dictionaries.pt()