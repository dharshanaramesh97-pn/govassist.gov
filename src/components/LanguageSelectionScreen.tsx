import React, { useState } from 'react';
import { Volume2, Check, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { LanguageCode, LanguageOption } from '../types/govassist';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';

interface LanguageSelectionScreenProps {
  selectedLanguage: LanguageCode;
  onSelectLanguageAndContinue: (lang: LanguageCode) => void;
  liteMode: boolean;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  selectedLanguage,
  onSelectLanguageAndContinue,
  liteMode,
}) => {
  const [playingCode, setPlayingCode] = useState<LanguageCode | null>(null);

  const handlePlaySample = (e: React.MouseEvent, lang: LanguageOption) => {
    e.stopPropagation();
    setPlayingCode(lang.code);
    ttsAdapter.speak(lang.sampleAudioGreeting, lang.voiceLangTag);
    setTimeout(() => {
      setPlayingCode((prev) => (prev === lang.code ? null : prev));
    }, 2800);
  };

  // Primary languages first (Tamil, English, Hindi) then remaining Eighth Schedule languages
  const primaryLanguages = SUPPORTED_LANGUAGES.slice(0, 3);
  const eighthScheduleOthers = SUPPORTED_LANGUAGES.slice(3);

  return (
    <section aria-labelledby="lang-screen-heading" className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          <Globe className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
          <span>உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்</span>
          <span aria-hidden="true">·</span>
          <span>Choose your language</span>
          <span aria-hidden="true">·</span>
          <span>अपनी भाषा चुनें</span>
        </div>
        <h1
          id="lang-screen-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          மொழியைத் தேர்ந்தெடுக்கவும் / Select Your Language / अपनी भाषा चुनें
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">
          Tap the speaker icon beside any language to hear a voice greeting, or tap the language button to start.
        </p>
      </div>

      {/* Primary Pilot Languages: Tamil, English, Hindi */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Primary Fully Translated Languages (Tamil Nadu + Central Pilot)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryLanguages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            const isPlaying = playingCode === lang.code;
            return (
              <div
                key={lang.code}
                className={`flex items-stretch rounded-2xl border transition-colors ${
                  isSelected
                    ? 'border-sky-700 dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectLanguageAndContinue(lang.code)}
                  className="flex-1 min-h-[68px] px-5 py-4 text-left flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-sky-600 rounded-l-2xl"
                >
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{lang.englishName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Full UI Translation</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0"
                      aria-label="Selected"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handlePlaySample(e, lang)}
                  aria-label={`Listen to ${lang.englishName} audio prompt`}
                  title={`Listen in ${lang.englishName}`}
                  className={`min-w-[56px] min-h-[68px] px-4 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1 rounded-r-2xl transition-colors ${
                    isPlaying
                      ? 'bg-sky-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="text-[11px] font-semibold">
                    {isPlaying ? 'Playing' : 'Listen'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Eighth Schedule Languages */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Other Eighth Schedule Indian Languages
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any language below • Uses English fallback with a visible &ldquo;Shown in English&rdquo; notice (Urdu switches to Right-to-Left layout)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {eighthScheduleOthers.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            const isPlaying = playingCode === lang.code;
            return (
              <div
                key={lang.code}
                dir={lang.dir}
                className={`flex items-stretch rounded-xl border transition-colors ${
                  isSelected
                    ? 'border-sky-700 dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectLanguageAndContinue(lang.code)}
                  className="flex-1 min-h-[56px] px-4 py-3 text-left flex items-center justify-between gap-2 focus-visible:outline-2 focus-visible:outline-sky-600"
                >
                  <div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {lang.englishName}
                      {!liteMode && ' · Shown in English'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => handlePlaySample(e, lang)}
                  aria-label={`Play ${lang.englishName} audio prompt`}
                  className={`min-w-[48px] min-h-[56px] px-3 border-s border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors ${
                    isPlaying
                      ? 'bg-sky-700 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
