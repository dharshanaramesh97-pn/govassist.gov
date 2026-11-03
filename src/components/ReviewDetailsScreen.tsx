import React from 'react';
import {
  Volume2,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Users,
} from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import { CitizenProfile } from '../types/govassist';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';

interface ReviewDetailsScreenProps {
  t: TranslationDictionary;
  voiceLangTag: string;
  profile: CitizenProfile;
  isEvaluating: boolean;
  onUpdateProfile: (updated: CitizenProfile) => void;
  onEditSmartProfile: () => void;
  onConfirmAndEvaluate: () => void;
}

const SAMPLE_DOCUMENTS_CHECKLIST = [
  {
    id: 'doc_widow_or_death_cert',
    label: 'Spouse Death Certificate or Widow Certificate (विदवा / கணவர் இறப்புச் சான்றிதழ்)',
  },
  {
    id: 'doc_family_ration_card',
    label: 'Tamil Nadu Smart Family Card / Ration Card (ஸ்மார்ட் குடும்ப அட்டை)',
  },
  {
    id: 'doc_bank_passbook',
    label: 'Active Bank Passbook Front Page (வங்கி பாஸ்புக் முதல் பக்கம்)',
  },
  {
    id: 'doc_tahsildar_income_cert',
    label: 'Recent Tahsildar Income Certificate (வட்டாட்சியர் வருமானச் சான்றிதழ்)',
  },
  {
    id: 'doc_children_birth_certs',
    label: 'Children Official Birth Certificates (குழந்தைகள் பிறப்புச் சான்றிதழ்)',
  },
  {
    id: 'doc_community_cert',
    label: 'Student Community Certificate (மாணவர் சமூகச் சான்றிதழ்)',
  },
  {
    id: 'doc_school_bonafide',
    label: 'School / College Bonafide Certificate & EMIS ID',
  },
];

export const ReviewDetailsScreen: React.FC<ReviewDetailsScreenProps> = ({
  t,
  voiceLangTag,
  profile,
  isEvaluating,
  onUpdateProfile,
  onEditSmartProfile,
  onConfirmAndEvaluate,
}) => {
  const toggleDocument = (docId: string) => {
    const exists = profile.availableDocumentIds.includes(docId);
    const updatedDocs = exists
      ? profile.availableDocumentIds.filter((id) => id !== docId)
      : [...profile.availableDocumentIds, docId];
    onUpdateProfile({
      ...profile,
      availableDocumentIds: updatedDocs,
    });
  };

  return (
    <section aria-labelledby="review-screen-heading" className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              {t.reviewScreen.stepLabel}
            </div>
            <h1
              id="review-screen-heading"
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1"
            >
              {t.reviewScreen.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                ttsAdapter.speak(
                  `${t.reviewScreen.title}. ${t.reviewScreen.subtitle}`,
                  voiceLangTag
                )
              }
              className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-sm font-semibold flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span>{t.common.listen}</span>
            </button>

            <button
              type="button"
              onClick={onEditSmartProfile}
              className="min-h-[48px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t.reviewScreen.editFieldBtn}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.reviewScreen.subtitle}
        </p>

        {/* Primary Citizen Summary Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.reviewScreen.primaryCitizenHeader}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">State & District</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tamil Nadu · {profile.district || 'Not specified'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Age</div>
              <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {profile.age !== null ? `${profile.age} years` : 'Not specified'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Area Type</div>
              <div className="text-sm font-bold capitalize text-slate-900 dark:text-slate-100">
                {profile.residenceType}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Occupation</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile.occupation.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Household Status</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile.maritalVulnerability.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Annual Household Income</div>
              <div className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {profile.annualHouseholdIncomeINR !== null
                  ? `₹${profile.annualHouseholdIncomeINR.toLocaleString('en-IN')}`
                  : 'Not specified'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Sensitive Community Category (Optional)
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile.communityCategory === 'skip' ||
                profile.communityCategory === 'prefer_not_to_say' ||
                profile.communityCategory === 'unknown'
                  ? `Not provided (${profile.communityCategory}) — Schemes requiring this will show under "Potentially eligible, more details needed"`
                  : profile.communityCategory.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Household Members Summary */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            <span>
              {t.reviewScreen.householdMembersHeader} ({profile.familyMembers.length})
            </span>
          </h2>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2">
            {profile.familyMembers.length === 0 ? (
              <p className="text-xs text-slate-500">No separate family members added.</p>
            ) : (
              profile.familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm border-b last:border-b-0 border-slate-200 dark:border-slate-800 pb-2 last:pb-0"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {m.label} ({m.relation})
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    Age: {m.age ?? 'N/A'} · Independent Category:{' '}
                    {m.independentCommunityCategory || 'Not copied from parent'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documents Held Checklist */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            <span>{t.reviewScreen.documentsHeldHeader}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t.reviewScreen.documentsHeldHint}
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {SAMPLE_DOCUMENTS_CHECKLIST.map((doc) => {
              const checked = profile.availableDocumentIds.includes(doc.id);
              return (
                <label
                  key={doc.id}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    checked
                      ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDocument(doc.id)}
                    className="w-5 h-5 accent-sky-700 rounded"
                  />
                  <span className="text-sm font-medium">{doc.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Confirm & Run Deterministic Engine */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onEditSmartProfile}
            className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{t.common.back}</span>
          </button>

          <button
            type="button"
            disabled={isEvaluating}
            onClick={onConfirmAndEvaluate}
            className="min-h-[54px] px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-base font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{t.reviewScreen.checkEligibilityBtn}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
