import React from 'react';
import { HelpCircle, ShieldAlert, CheckCircle2, X, Volume2 } from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';

interface HumanHelpModalProps {
  t: TranslationDictionary;
  voiceLangTag: string;
  isOpen: boolean;
  onClose: () => void;
}

export const HumanHelpModal: React.FC<HumanHelpModalProps> = ({
  t,
  voiceLangTag,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="human-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-sky-700 dark:text-sky-400 shrink-0" />
            <h2
              id="human-help-title"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {t.helpModal.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                ttsAdapter.speak(
                  `${t.helpModal.title}. ${t.helpModal.noPartnershipDisclaimer}. ${t.helpModal.whereToGoDesc}`,
                  voiceLangTag
                )
              }
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-900 dark:text-sky-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.common.listen}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.helpModal.closeBtn}
              className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mandatory No-Partnership Disclaimer */}
        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <span>{t.helpModal.noPartnershipDisclaimer}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.helpModal.whereToGoTitle}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {t.helpModal.whereToGoDesc}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.helpModal.safetyRulesTitle}
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.helpModal.safetyRule1}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.helpModal.safetyRule2}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.helpModal.safetyRule3}</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-sm font-bold"
        >
          {t.helpModal.closeBtn}
        </button>
      </div>
    </div>
  );
};
