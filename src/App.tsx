/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  RotateCcw,
  Sun,
  Moon,
  Zap,
  Globe,
  ShieldCheck,
  VolumeX,
} from 'lucide-react';
import {
  CitizenProfile,
  LanguageCode,
  SchemeEvaluationResult,
  UserAccountRecord,
  UserPreferences,
} from './types/govassist';
import { getTranslation } from './i18n';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { WelcomeGuestScreen } from './components/WelcomeGuestScreen';
import { VoiceOrTextInputScreen } from './components/VoiceOrTextInputScreen';
import { SmartProfileWizardScreen } from './components/SmartProfileWizardScreen';
import { ReviewDetailsScreen } from './components/ReviewDetailsScreen';
import { ResultsAndGuidanceScreen } from './components/ResultsAndGuidanceScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { HumanHelpModal } from './components/HumanHelpModal';
import { PWAInstallButton, OfflineIndicator } from './pwa/PWAInstallButton';
import {
  apiClearGuestSession,
  apiEvaluateSchemes,
  apiExtractSmartProfile,
} from './adapters/apiClientAdapter';
import { ttsAdapter } from './adapters/textToSpeechAdapter';
import { INITIAL_SAMPLE_SCHEMES } from './data/sampleSchemes';
import { evaluateAllSchemes } from './engine/eligibilityEngine';

type AppStep =
  | 'language_select'
  | 'welcome_guest'
  | 'voice_or_text'
  | 'smart_profile'
  | 'review_details'
  | 'results'
  | 'admin_dashboard';

function createInitialGuestProfile(): CitizenProfile {
  return {
    sessionId: `guest_${Date.now().toString(36)}`,
    stateCode: 'TN',
    district: 'Madurai',
    age: 38,
    gender: 'female',
    residenceType: 'rural',
    occupation: 'daily_wage_farm',
    employmentStatus: 'employed_informal',
    isStudent: false,
    annualHouseholdIncomeINR: 75000,
    maritalVulnerability: 'widow_single_parent',
    hasAgriculturalLand: false,
    hasPattaLandRecordVerified: false,
    // Sensitive attributes start unknown and are NEVER inferred from name/location
    communityCategory: 'unknown',
    minorityStatus: 'unknown',
    disabilityStatus: 'unknown',
    hasFirstGraduateChildInCollege: 'unknown',
    familyMembers: [
      {
        id: 'fam_child_1',
        relation: 'child',
        label: 'Child 1 (School Student)',
        age: 11,
        isStudent: true,
        educationLevel: 'school',
        independentCommunityCategory: 'unknown',
        independentDisabilityStatus: 'unknown',
      },
      {
        id: 'fam_child_2',
        relation: 'child',
        label: 'Child 2 (School Student)',
        age: 8,
        isStudent: true,
        educationLevel: 'school',
        independentCommunityCategory: 'unknown',
        independentDisabilityStatus: 'unknown',
      },
    ],
    // Pre-check basic Widow + Ration + Bank documents so Scheme 1 Appears Eligible
    // while Scheme 3 demonstrates "Missing documents or requirements"
    availableDocumentIds: [
      'doc_widow_or_death_cert',
      'doc_family_ration_card',
      'doc_bank_passbook',
    ],
    rawSituationDescription: '',
  };
}

export default function App() {
  const [step, setStep] = useState<AppStep>('language_select');
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    preferredInputMode: 'voice',
    liteMode: false,
    darkMode: false,
    textScale: '100',
    optInSmsReminders: false,
  });

  const [profile, setProfile] = useState<CitizenProfile>(createInitialGuestProfile);
  const [llmAdapterUsed, setLlmAdapterUsed] = useState<string>('mock-fallback-adapter');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<SchemeEvaluationResult[]>([]);
  const [aiExplanation, setAiExplanation] = useState<{
    provider: string;
    isMock: boolean;
    summaryText: string;
  } | null>(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [userAccount, setUserAccount] = useState<UserAccountRecord | null>(null);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [clearedToast, setClearedToast] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const { t, langMeta, isFallbackToEnglish } = getTranslation(preferences.language);

  // Sync dark mode and text scale with <html>
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-text-scale', preferences.textScale);
    root.setAttribute('dir', langMeta.dir);
    root.setAttribute('lang', preferences.language);
  }, [preferences.darkMode, preferences.textScale, preferences.language, langMeta.dir]);

  useEffect(() => {
    return ttsAdapter.onStateChange((speaking) => setIsAudioPlaying(speaking));
  }, []);

  // Working "Clear everything now" action that wipes both client state and backend guest session
  const handleClearEverythingNow = async () => {
    ttsAdapter.stop();
    try {
      await apiClearGuestSession(profile.sessionId);
    } catch {
      // Offline resilient
    }
    setProfile(createInitialGuestProfile());
    setEvaluations([]);
    setAiExplanation(null);
    setSavedSchemeIds([]);
    setUserAccount(null);
    setStep('welcome_guest');
    setClearedToast(t.common.clearedConfirmToast);
    setTimeout(() => setClearedToast(null), 3500);
  };

  const handleConfirmNaturalDescription = async (confirmedText: string) => {
    setIsExtracting(true);
    try {
      const res = await apiExtractSmartProfile(confirmedText, preferences.language);
      setLlmAdapterUsed(res.provider);
      setProfile((prev) => ({
        ...prev,
        rawSituationDescription: confirmedText,
        district: res.extracted.district || prev.district,
        age: res.extracted.age ?? prev.age,
        residenceType:
          res.extracted.residenceType && res.extracted.residenceType !== 'unknown'
            ? res.extracted.residenceType
            : prev.residenceType,
        occupation:
          res.extracted.occupation && res.extracted.occupation !== 'unknown'
            ? res.extracted.occupation
            : prev.occupation,
        maritalVulnerability:
          res.extracted.maritalVulnerability &&
          res.extracted.maritalVulnerability !== 'unknown'
            ? res.extracted.maritalVulnerability
            : prev.maritalVulnerability,
        annualHouseholdIncomeINR:
          res.extracted.annualHouseholdIncomeINR ?? prev.annualHouseholdIncomeINR,
        familyMembers:
          res.extracted.familyMembers && res.extracted.familyMembers.length > 0
            ? res.extracted.familyMembers
            : prev.familyMembers,
      }));
      setStep('smart_profile');
    } catch {
      setStep('smart_profile');
    } finally {
      setIsExtracting(false);
    }
  };

  const runEligibilityEvaluation = async (targetProfile: CitizenProfile) => {
    setIsEvaluating(true);
    try {
      const res = await apiEvaluateSchemes(targetProfile, preferences.language);
      setEvaluations(res.evaluations);
      setAiExplanation(res.explanation);
      setStep('results');
    } catch {
      // Offline local fallback using deterministic rules engine
      const localEvals = evaluateAllSchemes(
        targetProfile,
        INITIAL_SAMPLE_SCHEMES,
        preferences.language
      );
      setEvaluations(localEvals);
      setAiExplanation({
        provider: 'offline-local-rules-engine',
        isMock: true,
        summaryText:
          'Evaluated offline using cached sample scheme rules. Guidance only — the official department decides.',
      });
      setStep('results');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleToggleDocumentFromResults = (docId: string) => {
    const exists = profile.availableDocumentIds.includes(docId);
    const updatedDocs = exists
      ? profile.availableDocumentIds.filter((id) => id !== docId)
      : [...profile.availableDocumentIds, docId];
    const updatedProfile: CitizenProfile = {
      ...profile,
      availableDocumentIds: updatedDocs,
    };
    setProfile(updatedProfile);
    runEligibilityEvaluation(updatedProfile);
  };

  const handleToggleSaveScheme = (schemeId: string) => {
    setSavedSchemeIds((prev) =>
      prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]
    );
  };

  return (
    <div
      dir={langMeta.dir}
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single Text Wordmark */}
          <button
            type="button"
            onClick={() => setStep('welcome_guest')}
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            GovAssist
          </button>

          {/* Zone 2: 4–5 Concise Single-Line Nav Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <button
              type="button"
              onClick={() => setStep('language_select')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.common.languageButton} ({langMeta.nativeName})
            </button>
            <button
              type="button"
              onClick={() => setStep('voice_or_text')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.common.citizenView}
            </button>
            <button
              type="button"
              onClick={() => runEligibilityEvaluation(profile)}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Sample Results
            </button>
            <button
              type="button"
              onClick={() => setStep('admin_dashboard')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {t.common.adminPortal}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action ("Need help?" Button on Every Screen) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{t.common.needHelp}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Accessibility, Lite Mode, Language & "Clear Everything Now" Utility Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile-accessible Language Switcher */}
            <button
              type="button"
              onClick={() => setStep('language_select')}
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              <span>{langMeta.nativeName}</span>
            </button>

            {/* Lite Mode Toggle (Low-bandwidth text-first) */}
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({ ...prev, liteMode: !prev.liteMode }))
              }
              aria-pressed={preferences.liteMode}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                preferences.liteMode
                  ? 'border-amber-600 bg-amber-600 text-white'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t.common.liteMode}</span>
            </button>

            {/* Font Size Scaler (WCAG 2.2 AA Scalable Text) */}
            <div
              role="group"
              aria-label="Text size scaling"
              className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5"
            >
              {(['100', '115', '130'] as const).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, textScale: scale }))
                  }
                  className={`min-h-[34px] px-2.5 rounded-md font-bold transition-colors ${
                    preferences.textScale === scale
                      ? 'bg-sky-700 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {scale === '100' ? 'A' : scale === '115' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Light / Dark Theme Toggle */}
            <button
              type="button"
              onClick={() =>
                setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }))
              }
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap"
            >
              {preferences.darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.common.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>{t.common.darkMode}</span>
                </>
              )}
            </button>

            <PWAInstallButton />
          </div>

          <div className="flex items-center gap-2">
            {isAudioPlaying && (
              <button
                type="button"
                onClick={() => ttsAdapter.stop()}
                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold flex items-center gap-1.5"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>{t.common.stopAudio}</span>
              </button>
            )}

            {/* Admin Portal Quick Toggle for Mobile */}
            <button
              type="button"
              onClick={() =>
                setStep(step === 'admin_dashboard' ? 'welcome_guest' : 'admin_dashboard')
              }
              className="md:hidden min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {step === 'admin_dashboard' ? t.common.citizenView : t.common.adminPortal}
            </button>

            {/* Always-Visible "Clear everything now" Button */}
            <button
              type="button"
              onClick={handleClearEverythingNow}
              className="min-h-[40px] px-3.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>{t.common.clearEverythingNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Fallback Banner when a non-TN/HI/EN Eighth Schedule Language is selected */}
      {isFallbackToEnglish && (
        <div
          role="status"
          className="bg-sky-900 text-white px-4 py-2 text-center text-xs sm:text-sm font-semibold"
        >
          {t.meta.shownInEnglishFallback}
          {langMeta.dir === 'rtl' && ' · Right-to-Left (RTL) layout active for Urdu (اردو)'}
        </div>
      )}

      {/* Lite Mode Active Notice */}
      {preferences.liteMode && (
        <div className="bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 px-4 py-1.5 text-center text-xs font-semibold border-b border-amber-200 dark:border-amber-800">
          {t.common.liteModeActive}
        </div>
      )}

      {/* Sample Placeholder Data Notice Banner */}
      <div className="bg-slate-200/70 dark:bg-slate-900/90 border-b border-slate-300 dark:border-slate-800 px-4 py-1.5 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
        {t.common.samplePlaceholderBanner}
      </div>

      {/* Cleared Session Confirmation Toast */}
      {clearedToast && (
        <div
          role="status"
          aria-live="polite"
          className="max-w-3xl mx-auto mt-4 px-4 py-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 text-sm font-bold flex items-center gap-2 shadow-sm"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{clearedToast}</span>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 'language_select' && (
          <LanguageSelectionScreen
            selectedLanguage={preferences.language}
            liteMode={preferences.liteMode}
            onSelectLanguageAndContinue={(lang) => {
              setPreferences((prev) => ({ ...prev, language: lang }));
              setStep('welcome_guest');
            }}
          />
        )}

        {step === 'welcome_guest' && (
          <WelcomeGuestScreen
            t={t}
            voiceLangTag={langMeta.voiceLangTag}
            onContinueAsGuest={() => setStep('voice_or_text')}
            onChangeLanguage={() => setStep('language_select')}
            onClearEverythingNow={handleClearEverythingNow}
          />
        )}

        {step === 'voice_or_text' && (
          <VoiceOrTextInputScreen
            t={t}
            language={preferences.language}
            voiceLangTag={langMeta.voiceLangTag}
            inputMode={preferences.preferredInputMode}
            onSwitchInputMode={(mode) =>
              setPreferences((prev) => ({ ...prev, preferredInputMode: mode }))
            }
            initialText={profile.rawSituationDescription}
            isExtracting={isExtracting}
            onConfirmDescription={handleConfirmNaturalDescription}
            onBack={() => setStep('welcome_guest')}
          />
        )}

        {step === 'smart_profile' && (
          <SmartProfileWizardScreen
            t={t}
            voiceLangTag={langMeta.voiceLangTag}
            profile={profile}
            llmAdapterUsed={llmAdapterUsed}
            onUpdateProfile={setProfile}
            onProceedToReview={() => setStep('review_details')}
            onBack={() => setStep('voice_or_text')}
          />
        )}

        {step === 'review_details' && (
          <ReviewDetailsScreen
            t={t}
            voiceLangTag={langMeta.voiceLangTag}
            profile={profile}
            isEvaluating={isEvaluating}
            onUpdateProfile={setProfile}
            onEditSmartProfile={() => setStep('smart_profile')}
            onConfirmAndEvaluate={() => runEligibilityEvaluation(profile)}
          />
        )}

        {step === 'results' && (
          <ResultsAndGuidanceScreen
            t={t}
            language={preferences.language}
            voiceLangTag={langMeta.voiceLangTag}
            profile={profile}
            evaluations={evaluations}
            aiExplanation={aiExplanation}
            savedSchemeIds={savedSchemeIds}
            onToggleSaveScheme={handleToggleSaveScheme}
            onToggleDocumentHeld={handleToggleDocumentFromResults}
            onBackToReview={() => setStep('review_details')}
            userAccount={userAccount}
            onAccountUpdated={setUserAccount}
            preferences={preferences}
          />
        )}

        {step === 'admin_dashboard' && (
          <AdminDashboardScreen onExitAdmin={() => setStep('welcome_guest')} />
        )}
      </main>

      {/* Mandatory Footer with Non-Government Disclaimer + Privacy & Contact Links */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="space-y-1">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {t.footer.independentDisclaimer}
            </p>
            <p className="text-xs text-slate-500">
              Pilot: Tamil Nadu State Schemes + Central Schemes · Guidance only; official departments decide eligibility.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              {t.footer.privacyLink}
            </button>
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              {t.footer.contactLink}
            </button>
            <button
              type="button"
              onClick={() => setStep('admin_dashboard')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              {t.common.adminPortal}
            </button>
          </div>
        </div>
      </footer>

      {/* Human Help Modal ("Need help?" available from every screen) */}
      <HumanHelpModal
        t={t}
        voiceLangTag={langMeta.voiceLangTag}
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Privacy Promise Modal */}
      {isPrivacyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.welcome.privacyTitle}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {t.welcome.privacyText}
            </p>
            <p className="text-xs text-slate-500">
              {t.footer.independentDisclaimer}
            </p>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full min-h-[48px] rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-sm font-bold"
            >
              {t.helpModal.closeBtn}
            </button>
          </div>
        </div>
      )}

      {/* PWA Offline Banner */}
      <OfflineIndicator />
    </div>
  );
}
