import { createContext, useContext, useState, type ReactNode } from 'react';
import { en } from './en';
import { ja } from './ja';
import type { Translations } from './en';

export type Lang = 'en' | 'ja';

const STORAGE_KEY = 'flow-trigger-lang';

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ja') return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing restrictions)
  }
  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

const TRANSLATIONS: Record<Lang, Translations> = { en, ja };

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang());

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
