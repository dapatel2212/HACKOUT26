import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';
import ta from './ta.json';
import mr from './mr.json';
import kn from './kn.json';
import bn from './bn.json';
import te from './te.json';
import ml from './ml.json';
import pa from './pa.json';
import or from './or.json';
import as from './as.json';

const savedLang = localStorage.getItem('preferred_language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
    ta: { translation: ta },
    mr: { translation: mr },
    kn: { translation: kn },
    bn: { translation: bn },
    te: { translation: te },
    ml: { translation: ml },
    pa: { translation: pa },
    or: { translation: or },
    as: { translation: as },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
