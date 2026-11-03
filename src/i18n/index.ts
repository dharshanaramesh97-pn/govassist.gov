import { LanguageCode, LanguageOption } from '../types/govassist';
import { enTranslations, TranslationDictionary } from './locales/en';
import { taTranslations } from './locales/ta';
import { hiTranslations } from './locales/hi';

/**
 * All 22 Eighth Schedule Languages + English
 * Tamil, English, Hindi first as required by prompt, followed by Telugu, Malayalam, Kannada,
 * Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu (RTL), Assamese, and remaining Eighth Schedule languages.
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    dir: 'ltr',
    isFullyTranslated: true,
    voiceLangTag: 'ta-IN',
    sampleAudioGreeting: 'வணக்கம்! அரசு நலத்திட்ட வழிகாட்டிக்கு வரவேற்கிறோம். தமிழில் தொடர இந்த பொத்தானை அழுத்தவும்.',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    dir: 'ltr',
    isFullyTranslated: true,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Welcome to GovAssist, your independent citizen benefits guide. Tap to continue in English.',
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    dir: 'ltr',
    isFullyTranslated: true,
    voiceLangTag: 'hi-IN',
    sampleAudioGreeting: 'नमस्ते! गव-असिस्ट नागरिक सहायता में आपका स्वागत है। हिन्दी में जारी रखने के लिए चुनें।',
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'te-IN',
    sampleAudioGreeting: 'నమస్కారం! గవ్-అసిస్ట్‌కు స్వాగతం. (Shown in English fallback)',
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'ml-IN',
    sampleAudioGreeting: 'നമസ്കാരം! ഗവ്-അസിസ്റ്റിലേക്ക് സ്വാഗതം. (Shown in English fallback)',
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'kn-IN',
    sampleAudioGreeting: 'ನಮಸ್ಕಾರ! ಗವ್-ಅಸಿಸ್ಟ್‌ಗೆ ಸ್ವಾಗತ. (Shown in English fallback)',
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'bn-IN',
    sampleAudioGreeting: 'নমস্কার! গভ-অ্যাসিস্টে স্বাগতম। (Shown in English fallback)',
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'mr-IN',
    sampleAudioGreeting: 'नमस्कार! गव्ह-असिस्ट मध्ये आपले स्वागत आहे. (Shown in English fallback)',
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'gu-IN',
    sampleAudioGreeting: 'નમસ્તે! ગવ-આસિસ્ટમાં આપનું સ્વાગત છે. (Shown in English fallback)',
  },
  {
    code: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'pa-IN',
    sampleAudioGreeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਗਵ-ਅਸਿਸਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। (Shown in English fallback)',
  },
  {
    code: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'or-IN',
    sampleAudioGreeting: 'ନମସ୍କାର! ଗଭ-ଆସିଷ୍ଟକୁ ସ୍ୱାଗତ। (Shown in English fallback)',
  },
  {
    code: 'ur',
    nativeName: 'اردو',
    englishName: 'Urdu (RTL)',
    dir: 'rtl',
    isFullyTranslated: false,
    voiceLangTag: 'ur-IN',
    sampleAudioGreeting: 'آداب! گورنمنٹ اسسٹ میں خوش آمدید۔ دائیں سے بائیں لے آؤٹ فعال ہے۔',
  },
  {
    code: 'as',
    nativeName: 'অসমীয়া',
    englishName: 'Assamese',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'as-IN',
    sampleAudioGreeting: 'নমস্কাৰ! গৱ-এছিষ্টলৈ স্বাগতম। (Shown in English fallback)',
  },
  {
    code: 'ks',
    nativeName: 'कॉशुर / کٲشُر',
    englishName: 'Kashmiri',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Welcome to GovAssist — Kashmiri selection (Shown in English).',
  },
  {
    code: 'ne',
    nativeName: 'नेपाली',
    englishName: 'Nepali',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'ne-NP',
    sampleAudioGreeting: 'नमस्ते! गभ-असिस्टमा स्वागत छ। (Shown in English fallback)',
  },
  {
    code: 'sd',
    nativeName: 'सिन्धी / سنڌي',
    englishName: 'Sindhi',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Welcome to GovAssist — Sindhi selection (Shown in English).',
  },
  {
    code: 'kok',
    nativeName: 'कोंकणी',
    englishName: 'Konkani',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Welcome to GovAssist — Konkani selection (Shown in English).',
  },
  {
    code: 'doi',
    nativeName: 'डोगरी',
    englishName: 'Dogri',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Welcome to GovAssist — Dogri selection (Shown in English).',
  },
  {
    code: 'mai',
    nativeName: 'मैथिली',
    englishName: 'Maithili',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'प्रणाम! गव-असिस्ट मे स्वागत अछि। (Shown in English fallback)',
  },
  {
    code: 'sat',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    englishName: 'Santali',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Johar! Welcome to GovAssist — Santali selection (Shown in English).',
  },
  {
    code: 'mni',
    nativeName: 'মৈতৈলোন্',
    englishName: 'Manipuri',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Khurumjari! Welcome to GovAssist — Manipuri selection (Shown in English).',
  },
  {
    code: 'brx',
    nativeName: 'बर’',
    englishName: 'Bodo',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'Khulumbai! Welcome to GovAssist — Bodo selection (Shown in English).',
  },
  {
    code: 'sa',
    nativeName: 'संस्कृतम्',
    englishName: 'Sanskrit',
    dir: 'ltr',
    isFullyTranslated: false,
    voiceLangTag: 'en-IN',
    sampleAudioGreeting: 'नमस्कारः! गव-असिस्ट मध्ये स्वागतम्। (Shown in English fallback)',
  },
];

export function getTranslation(langCode: LanguageCode): {
  t: TranslationDictionary;
  langMeta: LanguageOption;
  isFallbackToEnglish: boolean;
} {
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[1];

  if (langCode === 'ta') {
    return { t: taTranslations, langMeta, isFallbackToEnglish: false };
  }
  if (langCode === 'hi') {
    return { t: hiTranslations, langMeta, isFallbackToEnglish: false };
  }
  if (langCode === 'en') {
    return { t: enTranslations, langMeta, isFallbackToEnglish: false };
  }

  // Other Eighth Schedule languages fall back to English with a visible "shown in English" label
  return {
    t: {
      ...enTranslations,
      meta: {
        langName: `${langMeta.nativeName} (${langMeta.englishName})`,
        shownInEnglishFallback: `${langMeta.nativeName} (${langMeta.englishName}) selected — Shown in English while official translation review completes`,
      },
    },
    langMeta,
    isFallbackToEnglish: true,
  };
}
