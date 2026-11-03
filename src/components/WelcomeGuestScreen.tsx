import React from 'react';
import { Volume2, ShieldAlert, Lock, ArrowRight, RotateCcw, Globe } from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';

interface WelcomeGuestScreenProps {
  t: TranslationDictionary;
  voiceLangTag: string;
  onContinueAsGuest: () => void;
  onChangeLanguage: () => void;
  onClearEverythingNow: () => void;
}

export const WelcomeGuestScreen: React.FC<WelcomeGuestScreenProps> = ({
  t,
  voiceLangTag,
  onContinueAsGuest,
  onChangeLanguage,
  onClearEverythingNow,
}) => {
  const handleListenWelcome = () => {
    const fullSpokenText = `${t.welcome.title}. ${t.welcome.subtitle}. ${t.welcome.notGovWarningTitle}. ${t.welcome.privacyText}`;
    ttsAdapter.speak(fullSpokenText, voiceLangTag);
  };

  return (
    <section aria-labelledby="welcome-heading" className="space-y-6 max-w-3xl mx-auto">
      {/* Main Hero Welcome Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
            {t.common.independentBadge}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleListenWelcome}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-sm font-semibold flex items-center gap-2 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors whitespace-nowrap shrink-0"
            >
              <Volume2 className="w-5 h-5 shrink-0" />
              <span>{t.common.listen}</span>
            </button>

            <button
              type="button"
              onClick={onChangeLanguage}
              className="min-h-[48px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>{t.welcome.changeLanguage}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h1
            id="welcome-heading"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            {t.welcome.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.welcome.subtitle}
          </p>
        </div>

        {/* Non-Government Mandatory Disclaimer Box */}
        <div
          role="note"
          className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-1.5"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-amber-950 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>{t.welcome.notGovWarningTitle}</span>
          </div>
          <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
            {t.welcome.notGovWarningBody}
          </p>
        </div>

        {/* Translated Privacy Promise */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Lock className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
              <span>{t.welcome.privacyTitle}</span>
            </div>
            <button
              type="button"
              onClick={() => ttsAdapter.speak(t.welcome.privacyText, voiceLangTag)}
              className="min-h-[40px] px-3 py-1 rounded-lg text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.common.listen}</span>
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {t.welcome.privacyText}
          </p>
        </div>

        {/* Primary Action: Continue as Guest (No account creation shown before results) */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-base sm:text-lg font-bold flex items-center justify-center gap-3 shadow-sm transition-colors"
          >
            <span>{t.welcome.continueAsGuest}</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.welcome.guestSessionNote}
            </p>
            <button
              type="button"
              onClick={onClearEverythingNow}
              className="min-h-[44px] px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.common.clearEverythingNow}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
