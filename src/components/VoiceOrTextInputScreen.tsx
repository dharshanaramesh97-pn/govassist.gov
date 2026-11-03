import React, { useState } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Keyboard,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import { LanguageCode } from '../types/govassist';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';
import { recordAndTranscribeSpeech } from '../adapters/speechToTextAdapter';

interface VoiceOrTextInputScreenProps {
  t: TranslationDictionary;
  language: LanguageCode;
  voiceLangTag: string;
  inputMode: 'voice' | 'text';
  onSwitchInputMode: (mode: 'voice' | 'text') => void;
  initialText: string;
  isExtracting: boolean;
  onConfirmDescription: (confirmedText: string) => void;
  onBack: () => void;
}

export const VoiceOrTextInputScreen: React.FC<VoiceOrTextInputScreenProps> = ({
  t,
  language,
  voiceLangTag,
  inputMode,
  onSwitchInputMode,
  initialText,
  isExtracting,
  onConfirmDescription,
  onBack,
}) => {
  const [draftText, setDraftText] = useState<string>(initialText || t.inputScreen.sample1);
  const [isRecording, setIsRecording] = useState(false);
  const [sttConfidence, setSttConfidence] = useState<number | null>(null);
  const [lowConfidenceAlert, setLowConfidenceAlert] = useState(false);
  const [piiDetectedAlert, setPiiDetectedAlert] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  // Guard against accidental Aadhaar (12 digits) or PIN entry
  const handleTextChange = (raw: string) => {
    const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
    if (aadhaarPattern.test(raw)) {
      setPiiDetectedAlert(true);
      setDraftText(raw.replace(aadhaarPattern, '[REDACTED-ID]'));
    } else {
      setDraftText(raw);
    }
  };

  const handleToggleRecording = async (simulateLowConfidence = false) => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setLowConfidenceAlert(false);

    // Simulate 1.2s active recording before adapter returns transcript
    setTimeout(async () => {
      try {
        const res = await recordAndTranscribeSpeech({
          language,
          simulateLowConfidence,
          sampleScenarioIndex: sampleIndex,
        });
        setSampleIndex((prev) => prev + 1);
        setDraftText(res.transcript);
        setSttConfidence(res.confidence);
        setLowConfidenceAlert(res.requiresReRecordOrEdit || res.confidence < 0.65);
      } finally {
        setIsRecording(false);
      }
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;
    onConfirmDescription(draftText.trim());
  };

  return (
    <section aria-labelledby="input-screen-heading" className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        {/* Step Header & Listen Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              {t.inputScreen.stepLabel}
            </div>
            <h1
              id="input-screen-heading"
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1"
            >
              {t.inputScreen.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              ttsAdapter.speak(
                `${t.inputScreen.title}. ${t.inputScreen.subtitle}`,
                voiceLangTag
              )
            }
            className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-sm font-semibold flex items-center gap-2 hover:bg-sky-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{t.inputScreen.readPromptAloud}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          {t.inputScreen.subtitle}
        </p>

        {/* Switchable Voice / Text Mode Tabs (Minimum 48px height) */}
        <div
          role="tablist"
          aria-label="Choose Voice or Text input"
          className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'voice'}
            onClick={() => onSwitchInputMode('voice')}
            className={`min-h-[48px] px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              inputMode === 'voice'
                ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span>{t.inputScreen.voiceTab}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'text'}
            onClick={() => onSwitchInputMode('text')}
            className={`min-h-[48px] px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              inputMode === 'text'
                ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 shrink-0" />
            <span>{t.inputScreen.textTab}</span>
          </button>
        </div>

        {/* Voice Recording Panel */}
        {inputMode === 'voice' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-6 text-center space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleToggleRecording(false)}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 font-bold text-white shadow-md transition-transform active:scale-95 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-sky-700 hover:bg-sky-800 dark:bg-sky-600'
                }`}
                aria-label={
                  isRecording ? t.inputScreen.micTapToStop : t.inputScreen.micTapToStart
                }
              >
                {isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>

              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isRecording ? t.inputScreen.micRecording : t.inputScreen.micTapToStart}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleRecording(true)}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {t.inputScreen.simulateLowConfidenceBtn}
                </button>
              </div>
            </div>

            {sttConfidence !== null && (
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Mock Bhashini STT Adapter · Confidence: {Math.round(sttConfidence * 100)}%
              </div>
            )}
          </div>
        )}

        {/* Low Confidence Warning Banner */}
        {lowConfidenceAlert && (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm text-amber-950 dark:text-amber-200">
              <p className="font-bold">{t.inputScreen.lowConfidenceWarning}</p>
            </div>
          </div>
        )}

        {/* PII / Aadhaar Redaction Alert */}
        {piiDetectedAlert && (
          <div
            role="alert"
            className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              {t.inputScreen.piiBlockedAlert}
            </p>
          </div>
        )}

        {/* Transcript / Text Confirmation & Edit Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="situation-textarea"
                className="block text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                {t.inputScreen.transcriptLabel}
              </label>
              <button
                type="button"
                onClick={() => ttsAdapter.speak(draftText, voiceLangTag)}
                className="min-h-[40px] px-3 py-1 rounded-lg text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.common.listen}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.inputScreen.transcriptConfirmHint}
            </p>
            <textarea
              id="situation-textarea"
              rows={4}
              value={draftText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={t.inputScreen.textPlaceholder}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-base text-slate-900 dark:text-slate-100 focus:border-sky-600 focus:outline-none"
            />
          </div>

          {/* Sample Citizen Situations for One-Tap Testing */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.inputScreen.sampleScenariosLabel}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[t.inputScreen.sample1, t.inputScreen.sample2, t.inputScreen.sample3].map(
                (sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDraftText(sample);
                      setLowConfidenceAlert(false);
                    }}
                    className="min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-sky-50/60 dark:hover:bg-slate-800 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="line-clamp-2">{sample}</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>{t.common.back}</span>
            </button>

            <button
              type="submit"
              disabled={isExtracting || !draftText.trim()}
              className="min-h-[52px] px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-base font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                {isExtracting
                  ? t.inputScreen.analyzingBtn
                  : t.inputScreen.analyzeSituationBtn}
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
