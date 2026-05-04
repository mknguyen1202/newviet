import { createContext, useContext } from 'react';

export type Lang = 'en' | 'vi';
export const LangContext = createContext<Lang>('en');
export function useLang(): Lang {
    return useContext(LangContext);
}
