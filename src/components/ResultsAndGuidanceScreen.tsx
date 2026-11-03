import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  HelpCircle,
  FileWarning,
  ClipboardCheck,
  XCircle,
  ExternalLink,
  Bookmark,
  Flag,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Download,
  Trash2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import {
  AnonymisedFeedbackReport,
  CitizenProfile,
  EligibilityResultCategory,
  LanguageCode,
  SchemeEvaluationResult,
  UserAccountRecord,
  UserPreferences,
} from '../types/govassist';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';
import {
  apiConvertGuestToAccount,
  apiDeleteUserAccount,
  apiReportSchemeProblem,
} from '../adapters/apiClientAdapter';

interface ResultsAndGuidanceScreenProps {
  t: TranslationDictionary;
  language: LanguageCode;
  voiceLangTag: string;
  profile: CitizenProfile;
  evaluations: SchemeEvaluationResult[];
  aiExplanation: { provider: string; isMock: boolean; summaryText: string } | null;
  savedSchemeIds: string[];
  onToggleSaveScheme: (schemeId: string) => void;
  onToggleDocumentHeld: (docId: string) => void;
  onBackToReview: () => void;
  userAccount: UserAccountRecord | null;
  onAccountUpdated: (account: UserAccountRecord | null) => void;
  preferences: UserPreferences;
}

const CATEGORY_ORDER: EligibilityResultCategory[] = [
  'appears_eligible',
  'potentially_eligible',
  'missing_documents',
  'requires_verification',
  'not_eligible',
];

function getLocalizedText(
  obj: { en: string; ta: string; hi: string },
  lang: LanguageCode
): string {
  if (lang === 'ta') return obj.ta;
  if (lang === 'hi') return obj.hi;
  return obj.en;
}

function getLocalizedArray(
  obj: { en: string[]; ta: string[]; hi: string[] },
  lang: LanguageCode
): string[] {
  if (lang === 'ta') return obj.ta;
  if (lang === 'hi') return obj.hi;
  return obj.en;
}

export const ResultsAndGuidanceScreen: React.FC<ResultsAndGuidanceScreenProps> = ({
  t,
  language,
  voiceLangTag,
  profile,
  evaluations,
  aiExplanation,
  savedSchemeIds,
  onToggleSaveScheme,
  onToggleDocumentHeld,
  onBackToReview,
  userAccount,
  onAccountUpdated,
  preferences,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EligibilityResultCategory | 'all'>(
    'all'
  );
  const [activeRouteTabByScheme, setActiveRouteTabByScheme] = useState<
    Record<string, 'online' | 'assisted' | 'offline'>
  >({});
  const [expandedDocGuideKey, setExpandedDocGuideKey] = useState<string | null>(null);

  // Report a Problem Modal State
  const [reportingScheme, setReportingScheme] = useState<{
    id: string;
    code: string;
    title: string;
  } | null>(null);
  const [reportIssueType, setReportIssueType] =
    useState<AnonymisedFeedbackReport['issueType']>('outdated_rule');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmittedMsg, setReportSubmittedMsg] = useState<string | null>(null);

  // Post-Results Optional Account Creation & Consent State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [consentedItems, setConsentedItems] = useState({
    saveSchemes: true,
    saveBasicProfile: true,
    savePreferences: true,
    optInReminders: false,
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('123456');
  const [accountError, setAccountError] = useState<string | null>(null);
  const [guestWipedBanner, setGuestWipedBanner] = useState(false);

  const filteredEvaluations =
    selectedCategory === 'all'
      ? evaluations
      : evaluations.filter((ev) => ev.category === selectedCategory);

  const getCategoryMeta = (cat: EligibilityResultCategory) => {
    switch (cat) {
      case 'appears_eligible':
        return {
          label: t.resultsScreen.categories.appears_eligible,
          icon: CheckCircle2,
          colorClass:
            'text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        };
      case 'potentially_eligible':
        return {
          label: t.resultsScreen.categories.potentially_eligible,
          icon: HelpCircle,
          colorClass:
            'text-sky-800 dark:text-sky-300 bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
        };
      case 'missing_documents':
        return {
          label: t.resultsScreen.categories.missing_documents,
          icon: FileWarning,
          colorClass:
            'text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        };
      case 'requires_verification':
        return {
          label: t.resultsScreen.categories.requires_verification,
          icon: ClipboardCheck,
          colorClass:
            'text-indigo-900 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
        };
      case 'not_eligible':
        return {
          label: t.resultsScreen.categories.not_eligible,
          icon: XCircle,
          colorClass:
            'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700',
        };
    }
  };

  const handleSubmitProblemReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingScheme || !reportComment.trim()) return;
    await apiReportSchemeProblem({
      schemeId: reportingScheme.id,
      schemeCode: reportingScheme.code,
      issueType: reportIssueType,
      comment: reportComment.trim(),
      language,
    });
    setReportSubmittedMsg(
      'Thank you. Your anonymised report has been added to the Staff Admin review queue.'
    );
    setReportComment('');
    setTimeout(() => {
      setReportingScheme(null);
      setReportSubmittedMsg(null);
    }, 1800);
  };

  const handleCreateAccountWithConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);

    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length === 12) {
      setAccountError(
        'Safety Block: Never enter a 12-digit Aadhaar number. Please enter a 10-digit mobile number.'
      );
      return;
    }
    if (digits.length < 10) {
      setAccountError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const res = await apiConvertGuestToAccount({
      sessionId: profile.sessionId,
      phone: digits,
      otpCode: otpInput,
      consentedItems,
      consentStatementText: `${t.accountFlow.consentIntro} [Items: ${JSON.stringify(
        consentedItems
      )}]`,
      language,
      savedSchemeIds,
      profile,
      preferences,
    });

    if (!res.ok || !res.account) {
      setAccountError(res.error || 'Could not verify OTP.');
      return;
    }

    onAccountUpdated(res.account);
    setGuestWipedBanner(true);
    setShowAccountModal(false);
  };

  const handleDownloadAccountJson = () => {
    if (!userAccount) return;
    const blob = new Blob([JSON.stringify(userAccount, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `govassist-my-data-${userAccount.userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!userAccount) return;
    await apiDeleteUserAccount(userAccount.userId);
    onAccountUpdated(null);
    setGuestWipedBanner(false);
  };

  return (
    <section aria-labelledby="results-heading" className="space-y-8">
      {/* Top Summary & AI Plain-Language Explanation */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              {t.resultsScreen.stepLabel}
            </div>
            <h1
              id="results-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1"
            >
              {t.resultsScreen.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToReview}
              className="min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.resultsScreen.editProfileAgainBtn}</span>
            </button>

            {aiExplanation && (
              <button
                type="button"
                onClick={() => ttsAdapter.speak(aiExplanation.summaryText, voiceLangTag)}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span>{t.common.listen}</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Plain-Language Explanation Box (Strictly non-decisional) */}
        {aiExplanation && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {t.resultsScreen.aiExplanationHeader}
              </span>
              <span className="font-mono">
                Explanation Adapter: {aiExplanation.provider} · Eligibility Engine: Deterministic 3-Valued Rules
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
              {aiExplanation.summaryText}
            </p>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 pt-1">
              {t.resultsScreen.deterministicNotice}
            </p>
          </div>
        )}

        {/* 5 Result Categories Interactive Filter Bar (Icon + Text + Count — No Color-Only Meaning) */}
        <div
          role="tablist"
          aria-label="Filter schemes by eligibility category"
          className="flex flex-wrap items-center gap-2 pt-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[48px] px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-sky-500 dark:bg-sky-600'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>All Categories</span>
            <span className="font-mono tabular-nums">({evaluations.length})</span>
          </button>

          {CATEGORY_ORDER.map((cat) => {
            const meta = getCategoryMeta(cat);
            const Icon = meta.icon;
            const count = evaluations.filter((e) => e.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[48px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : meta.colorClass
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{meta.label}</span>
                <span className="font-mono tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scheme Cards List */}
      <div className="space-y-6">
        {filteredEvaluations.map((item) => {
          const { scheme, category, matchedReasons, missingOrUnknownReasons, failedReasons, missingDocuments } = item;
          const catMeta = getCategoryMeta(category);
          const CatIcon = catMeta.icon;
          const title = getLocalizedText(scheme.title, language);
          const department = getLocalizedText(scheme.department, language);
          const benefits = getLocalizedText(scheme.benefits, language);
          const activeRoute = activeRouteTabByScheme[scheme.id] || 'assisted';
          const routeData = scheme.applicationRoutes[activeRoute];
          const isSaved = savedSchemeIds.includes(scheme.id);

          return (
            <article
              key={scheme.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6"
            >
              {/* Card Kicker: Clean Unboxed Metadata with · Separators (Zero-Pill Discipline) */}
              <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="text-amber-800 dark:text-amber-300 font-mono">
                      {t.resultsScreen.cardLabels.sampleTag} ({scheme.code})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{scheme.level} Scheme</span>
                    <span aria-hidden="true">·</span>
                    <span>{scheme.applicableLocations}</span>
                  </div>

                  {/* Category Status Label with Icon + Text */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${catMeta.colorClass}`}
                  >
                    <CatIcon className="w-4 h-4 shrink-0" />
                    <span>{catMeta.label}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {department}
                </p>

                {/* Card Top Actions: Listen, Save, Report a Problem */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      ttsAdapter.speak(
                        `${title}. ${catMeta.label}. ${benefits}. ${t.resultsScreen.cardLabels.guidanceOnlyFooter}`,
                        voiceLangTag
                      )
                    }
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span>{t.common.listen}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleSaveScheme(scheme.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                      isSaved
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 shrink-0" />
                    <span>
                      {isSaved
                        ? t.resultsScreen.cardLabels.savedScheme
                        : t.resultsScreen.cardLabels.saveScheme}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReportingScheme({
                        id: scheme.id,
                        code: scheme.code,
                        title,
                      })
                    }
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Flag className="w-4 h-4 shrink-0" />
                    <span>{t.resultsScreen.cardLabels.reportProblem}</span>
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t.resultsScreen.cardLabels.benefits}
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  {benefits}
                </p>
              </div>

              {/* Why It Matches & What Is Missing / Needs Attention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {t.resultsScreen.cardLabels.whyMatches} ({matchedReasons.length})
                  </h3>
                  {matchedReasons.length === 0 ? (
                    <p className="text-xs text-slate-500">No rules matched yet.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {matchedReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    {t.resultsScreen.cardLabels.whatIsMissing}
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {failedReasons.map((reason, idx) => (
                      <li key={`f-${idx}`} className="flex items-start gap-2 text-rose-700 dark:text-rose-300 font-medium">
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                    {missingOrUnknownReasons.map((reason, idx) => (
                      <li key={`u-${idx}`} className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                    {missingDocuments.map((doc) => (
                      <li key={doc.id} className="flex items-start gap-2">
                        <FileWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Missing document: {getLocalizedText(doc.name, language)}
                        </span>
                      </li>
                    ))}
                    {scheme.requiresDepartmentalInspection && scheme.inspectionNote && (
                      <li className="flex items-start gap-2">
                        <ClipboardCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{getLocalizedText(scheme.inspectionNote, language)}</span>
                      </li>
                    )}
                    {failedReasons.length === 0 &&
                      missingOrUnknownReasons.length === 0 &&
                      missingDocuments.length === 0 &&
                      !scheme.requiresDepartmentalInspection && (
                        <li className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          All known sample rules and mandatory documents are marked present.
                        </li>
                      )}
                  </ul>
                </div>
              </div>

              {/* Document Checklist & "How to get this document" */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.resultsScreen.cardLabels.requiredDocs}
                </h3>
                <div className="space-y-2">
                  {scheme.requiredDocuments.map((doc) => {
                    const isHeld = profile.availableDocumentIds.includes(doc.id);
                    const guideKey = `${scheme.id}_${doc.id}`;
                    const isExpanded = expandedDocGuideKey === guideKey;

                    return (
                      <div
                        key={doc.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3.5 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-h-[40px]">
                            <input
                              type="checkbox"
                              checked={isHeld}
                              onChange={() => onToggleDocumentHeld(doc.id)}
                              className="w-5 h-5 accent-sky-700 rounded"
                            />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {getLocalizedText(doc.name, language)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Issuing Authority: {doc.issuingAuthority}
                              </div>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDocGuideKey(isExpanded ? null : guideKey)
                            }
                            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1"
                          >
                            <span>{t.resultsScreen.cardLabels.howToGetDoc}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {doc.howToGet ? (
                              <p>{getLocalizedText(doc.howToGet, language)}</p>
                            ) : (
                              <p className="font-semibold text-amber-800 dark:text-amber-300">
                                {t.resultsScreen.cardLabels.notConfirmedDept}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Application Route Tabs: Online | Assisted (CSC / e-Sevai) | Offline */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.resultsScreen.cardLabels.appRoutes}
                </h3>

                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {(
                    [
                      { key: 'assisted', label: t.resultsScreen.cardLabels.routeAssisted },
                      { key: 'online', label: t.resultsScreen.cardLabels.routeOnline },
                      { key: 'offline', label: t.resultsScreen.cardLabels.routeOffline },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() =>
                        setActiveRouteTabByScheme((prev) => ({
                          ...prev,
                          [scheme.id]: tab.key,
                        }))
                      }
                      className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                        activeRoute === tab.key
                          ? 'bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/70 dark:bg-slate-950/40">
                  {routeData.portalNameOrCentre && (
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {routeData.portalNameOrCentre}
                    </div>
                  )}

                  {!routeData.available && (
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      {t.resultsScreen.cardLabels.notConfirmedDept}
                    </div>
                  )}

                  <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {getLocalizedArray(routeData.steps, language).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>

                  {getLocalizedArray(routeData.whatToCarryOrWarnings, language).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        What to carry / Important Warnings:
                      </div>
                      {getLocalizedArray(routeData.whatToCarryOrWarnings, language).map(
                        (w, idx) => (
                          <div key={idx}>• {w}</div>
                        )
                      )}
                    </div>
                  )}

                  {routeData.contactAsPublished && (
                    <div className="text-xs text-slate-500">
                      Published Contact: {routeData.contactAsPublished}
                    </div>
                  )}
                </div>
              </div>

              {/* Official Source, Last Verified Date, Verification Status & Mandatory Card Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                  <span>
                    {t.resultsScreen.cardLabels.lastVerified}: {scheme.lastVerifiedDate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t.resultsScreen.cardLabels.nextReviewDue}: {scheme.nextReviewDueDate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      scheme.verificationStatus === 'expired_outdated'
                        ? 'text-rose-700 dark:text-rose-400 font-bold'
                        : 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    }
                  >
                    Status: {scheme.verificationStatus.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-sky-800 dark:text-sky-300 font-medium break-all">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {t.resultsScreen.cardLabels.officialLink}: {scheme.officialLink}
                    </span>
                  </span>
                  <span className="text-slate-500 break-all">
                    {t.resultsScreen.cardLabels.officialSource}: {scheme.officialSourceUrl}
                  </span>
                </div>

                {/* Mandatory Footer on Every Card */}
                <div className="pt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.resultsScreen.cardLabels.guidanceOnlyFooter}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* SECTION 7: POST-RESULTS OPTIONAL ACCOUNT & SAVED SCHEMES (Shown ONLY after results) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
        {guestWipedBanner && (
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex items-center gap-3 text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{t.accountFlow.guestSessionWipedNotice}</span>
          </div>
        )}

        {!userAccount ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
                <span>{t.resultsScreen.postResultsAccountPromptTitle}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.resultsScreen.postResultsAccountPromptDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              className="min-h-[52px] px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-sm font-bold whitespace-nowrap shrink-0"
            >
              {t.resultsScreen.createOptionalAccountBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t.accountFlow.myAccountTitle} ({userAccount.maskedPhone})
                </h2>
                <p className="text-xs font-mono text-slate-500">
                  Account ID: {userAccount.userId} · Saved Schemes: {userAccount.savedSchemeIds.length}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAccountJson}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.accountFlow.downloadDataBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.accountFlow.deleteAccountBtn}</span>
                </button>
              </div>
            </div>

            {/* Recorded Consent Audit Trail */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {t.accountFlow.consentRecordHeader}
              </h3>
              {userAccount.consentHistory.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs font-mono space-y-1"
                >
                  <div>
                    Consent ID: {c.id} · Timestamp: {c.timestamp} · Version: {c.policyVersion} · Language: {c.language}
                  </div>
                  <div>
                    Saved Items: Schemes={String(c.consentedItems.saveSchemes)}, BasicProfile=
                    {String(c.consentedItems.saveBasicProfile)}, Preferences=
                    {String(c.consentedItems.savePreferences)}, Reminders=
                    {String(c.consentedItems.optInReminders)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Guest-to-Account Plain-Language Consent + Mock Phone OTP */}
      {showAccountModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xl">
            <h2
              id="consent-modal-title"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {t.accountFlow.consentHeading}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.accountFlow.consentIntro}
            </p>

            <form onSubmit={handleCreateAccountWithConsent} className="space-y-4">
              <div className="space-y-2">
                {(
                  [
                    {
                      key: 'saveSchemes',
                      label: `${t.accountFlow.itemSaveSchemes} (${savedSchemeIds.length} selected)`,
                    },
                    { key: 'saveBasicProfile', label: t.accountFlow.itemSaveProfile },
                    { key: 'savePreferences', label: t.accountFlow.itemSavePrefs },
                    { key: 'optInReminders', label: t.accountFlow.itemOptInReminders },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    className="min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={consentedItems[item.key]}
                      onChange={(e) =>
                        setConsentedItems((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-sky-700 rounded"
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.accountFlow.phoneLabel}
                </label>
                <p className="text-xs text-slate-500">{t.accountFlow.noAadhaarNote}</p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    maxLength={12}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={t.accountFlow.phonePlaceholder}
                    className="min-h-[48px] flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="min-h-[48px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    {t.accountFlow.sendOtpBtn}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.accountFlow.enterOtpLabel}
                  </label>
                  <p className="text-xs font-mono text-amber-800 dark:text-amber-300">
                    {t.accountFlow.mockOtpNotice}
                  </p>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="min-h-[48px] w-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-base font-mono"
                  />
                </div>
              )}

              {accountError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {accountError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold"
                >
                  {t.accountFlow.verifyAndSaveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report a Problem on Scheme Card */}
      {reportingScheme && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t.resultsScreen.cardLabels.reportProblem}: {reportingScheme.code}
            </h3>
            <p className="text-xs text-slate-500">
              Reports are strictly anonymised. Do not include your name, phone, or Aadhaar number.
            </p>
            {reportSubmittedMsg ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                {reportSubmittedMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitProblemReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Issue Category
                  </label>
                  <select
                    value={reportIssueType}
                    onChange={(e) =>
                      setReportIssueType(
                        e.target.value as AnonymisedFeedbackReport['issueType']
                      )
                    }
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm"
                  >
                    <option value="outdated_rule">Outdated eligibility rule or amount</option>
                    <option value="broken_link">Official portal link not working</option>
                    <option value="office_refused">Local office asked for extra documents</option>
                    <option value="unanswered_question">Unanswered citizen question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    What went wrong or what question was unanswered?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Describe the issue..."
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingScheme(null)}
                    className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-4 rounded-xl bg-sky-700 text-white text-xs font-bold"
                  >
                    Submit Anonymised Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
