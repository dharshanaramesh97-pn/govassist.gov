import React, { useState } from 'react';
import {
  Volume2,
  ArrowRight,
  ArrowLeft,
  Info,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { TranslationDictionary } from '../i18n/locales/en';
import {
  CitizenProfile,
  CommunityCategory,
  DisabilityStatus,
  FamilyMemberRecord,
  MaritalVulnerabilityStatus,
  OccupationType,
  ResidenceType,
} from '../types/govassist';
import { STATES_CONFIG } from '../data/statesConfig';
import { ttsAdapter } from '../adapters/textToSpeechAdapter';

interface SmartProfileWizardScreenProps {
  t: TranslationDictionary;
  voiceLangTag: string;
  profile: CitizenProfile;
  llmAdapterUsed: string;
  onUpdateProfile: (updated: CitizenProfile) => void;
  onProceedToReview: () => void;
  onBack: () => void;
}

interface QuestionDef {
  id: string;
  title: string;
  isSensitive: boolean;
  whyWeAsk?: string;
}

export const SmartProfileWizardScreen: React.FC<SmartProfileWizardScreenProps> = ({
  t,
  voiceLangTag,
  profile,
  llmAdapterUsed,
  onUpdateProfile,
  onProceedToReview,
  onBack,
}) => {
  // Determine which questions are still missing or relevant to ask one-at-a-time
  // Sensitive questions (communityCategory, disabilityStatus) are included ONLY when a candidate
  // scheme in our Tamil Nadu + Central pilot needs them, with a mandatory "Why we ask" note
  // and explicit "Skip" and "I'd rather not say" buttons.
  const questions: QuestionDef[] = [
    {
      id: 'district',
      title: t.smartProfile.questions.district,
      isSensitive: false,
    },
    {
      id: 'age',
      title: t.smartProfile.questions.age,
      isSensitive: false,
    },
    {
      id: 'residenceType',
      title: t.smartProfile.questions.residenceType,
      isSensitive: false,
    },
    {
      id: 'maritalVulnerability',
      title: t.smartProfile.questions.maritalVulnerability,
      isSensitive: false,
    },
    {
      id: 'occupation',
      title: t.smartProfile.questions.occupation,
      isSensitive: false,
    },
    {
      id: 'annualIncome',
      title: t.smartProfile.questions.annualIncome,
      isSensitive: false,
    },
    {
      id: 'communityCategory',
      title: t.smartProfile.questions.communityCategory,
      isSensitive: true,
      whyWeAsk:
        'Asked ONLY because [SAMPLE] Tamil Nadu Student Educational Grant checks BC/MBC/SC/ST welfare eligibility. We never infer this from your name, village, or language.',
    },
  ];

  // Start at the first unanswered question (or index 6 sensitive question if basic ones were extracted by AI)
  const findFirstUnansweredIndex = (): number => {
    if (!profile.district) return 0;
    if (!profile.age) return 1;
    if (profile.residenceType === 'unknown') return 2;
    if (profile.maritalVulnerability === 'unknown') return 3;
    if (profile.occupation === 'unknown') return 4;
    if (profile.annualHouseholdIncomeINR === null) return 5;
    return 6; // Sensitive optional question
  };

  const [currentIndex, setCurrentIndex] = useState<number>(findFirstUnansweredIndex);
  const currentQ = questions[currentIndex] || questions[0];

  const tnDistricts = STATES_CONFIG[0].districts;

  const advanceOrFinish = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAddFamilyMember = () => {
    const nextNum = profile.familyMembers.length + 1;
    const newMember: FamilyMemberRecord = {
      id: `fam_${Date.now().toString(36)}_${nextNum}`,
      relation: 'child',
      label: `Family Member ${nextNum} (Child)`,
      age: 10,
      isStudent: true,
      educationLevel: 'school',
      // Never copy parent's community or disability category to child
      independentCommunityCategory: 'unknown',
      independentDisabilityStatus: 'unknown',
    };
    onUpdateProfile({
      ...profile,
      familyMembers: [...profile.familyMembers, newMember],
    });
  };

  const handleUpdateFamilyMember = (
    memberId: string,
    patch: Partial<FamilyMemberRecord>
  ) => {
    onUpdateProfile({
      ...profile,
      familyMembers: profile.familyMembers.map((m) =>
        m.id === memberId ? { ...m, ...patch } : m
      ),
    });
  };

  const handleRemoveFamilyMember = (memberId: string) => {
    onUpdateProfile({
      ...profile,
      familyMembers: profile.familyMembers.filter((m) => m.id !== memberId),
    });
  };

  return (
    <section aria-labelledby="smart-profile-heading" className="max-w-3xl mx-auto space-y-6">
      {/* One-at-a-Time Question Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              {t.smartProfile.stepLabel} · {t.smartProfile.questionProgress} {currentIndex + 1} /{' '}
              {questions.length}
            </div>
            <h1
              id="smart-profile-heading"
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1"
            >
              {t.smartProfile.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => ttsAdapter.speak(currentQ.title, voiceLangTag)}
            className="min-h-[48px] px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-sm font-semibold flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{t.common.listen}</span>
          </button>
        </div>

        {/* Question Step Pills (Interactive navigation buttons) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                idx === currentIndex
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {idx + 1}. {q.id === 'communityCategory' ? 'Sensitive (Optional)' : q.id}
            </button>
          ))}
        </div>

        {/* Active Single Question Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {currentQ.title}
          </h2>

          {/* Sensitive Question One-Line "Why we ask" Note */}
          {currentQ.isSensitive && currentQ.whyWeAsk && (
            <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-sky-950 dark:text-sky-200">
              <Info className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t.smartProfile.whyWeAskLabel} </span>
                <span>{currentQ.whyWeAsk}</span>
              </div>
            </div>
          )}

          {/* Question 1: District */}
          {currentQ.id === 'district' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {tnDistricts.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ ...profile, district: d.id });
                    advanceOrFinish();
                  }}
                  className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-left transition-colors ${
                    profile.district === d.id
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  {d.en}
                </button>
              ))}
            </div>
          )}

          {/* Question 2: Age */}
          {currentQ.id === 'age' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[24, 32, 38, 45, 55, 65].map((presetAge) => (
                  <button
                    key={presetAge}
                    type="button"
                    onClick={() => {
                      onUpdateProfile({ ...profile, age: presetAge });
                      advanceOrFinish();
                    }}
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-bold tabular-nums ${
                      profile.age === presetAge
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {presetAge} yrs
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={110}
                  value={profile.age ?? ''}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      age: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="Enter exact age"
                  className="min-h-[48px] w-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-base font-mono"
                />
                <button
                  type="button"
                  onClick={advanceOrFinish}
                  className="min-h-[48px] px-5 rounded-xl bg-sky-700 text-white text-sm font-bold"
                >
                  {t.common.next}
                </button>
              </div>
            </div>
          )}

          {/* Question 3: Residence Type */}
          {currentQ.id === 'residenceType' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { val: 'rural', label: 'Rural (Village Panchayat / கிராம ஊராட்சி)' },
                  { val: 'urban', label: 'Urban (Municipality / Corporation / நகர்ப்புறம்)' },
                ] as { val: ResidenceType; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ ...profile, residenceType: opt.val });
                    advanceOrFinish();
                  }}
                  className={`min-h-[54px] px-4 py-3 rounded-xl border text-sm font-bold text-left ${
                    profile.residenceType === opt.val
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Question 4: Marital / Household Status */}
          {currentQ.id === 'maritalVulnerability' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    val: 'widow_single_parent',
                    label: 'Widow / Single Mother supporting family (விதவை / தனிப் பெற்றோர்)',
                  },
                  { val: 'married', label: 'Married household (திருமணமானவர்)' },
                  { val: 'unmarried_single', label: 'Unmarried / Youth applicant (திருமணமாகாதவர்)' },
                  { val: 'elderly_destitute', label: 'Senior Citizen needing support (மூத்த குடிமக்கள்)' },
                ] as { val: MaritalVulnerabilityStatus; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ ...profile, maritalVulnerability: opt.val });
                    advanceOrFinish();
                  }}
                  className={`min-h-[54px] px-4 py-3 rounded-xl border text-sm font-bold text-left ${
                    profile.maritalVulnerability === opt.val
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Question 5: Occupation */}
          {currentQ.id === 'occupation' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { val: 'daily_wage_farm', label: 'Daily Wage Farm Worker (விவசாயக் கூலி)' },
                  { val: 'smallholder_farmer', label: 'Smallholder Farmer (சிறு/குறு விவசாயி)' },
                  { val: 'unorganised_worker', label: 'Unorganised Sector Worker (அமைப்புசாரா தொழிலாளி)' },
                  { val: 'self_employed_micro', label: 'Small Trade / Self-Employed (சுயதொழில்)' },
                  { val: 'homemaker_unemployed', label: 'Homemaker / Seeking Work (இல்லத்தரசி)' },
                  { val: 'student', label: 'Student (மாணவர்)' },
                ] as { val: OccupationType; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ ...profile, occupation: opt.val });
                    advanceOrFinish();
                  }}
                  className={`min-h-[54px] px-4 py-3 rounded-xl border text-sm font-bold text-left ${
                    profile.occupation === opt.val
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Question 6: Annual Income */}
          {currentQ.id === 'annualIncome' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { val: 60000, label: 'Up to ₹60,000 / year (₹5,000/month)' },
                { val: 75000, label: 'Around ₹75,000 / year (₹6,250/month)' },
                { val: 110000, label: 'Around ₹1,10,000 / year' },
                { val: 180000, label: '₹1,20,000 to ₹2,00,000 / year' },
                { val: 300000, label: 'Above ₹2,50,000 / year' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ ...profile, annualHouseholdIncomeINR: opt.val });
                    advanceOrFinish();
                  }}
                  className={`min-h-[54px] px-4 py-3 rounded-xl border text-sm font-bold tabular-nums text-left ${
                    profile.annualHouseholdIncomeINR === opt.val
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Question 7: Sensitive Community Category (Always offers Skip & I'd rather not say) */}
          {currentQ.id === 'communityCategory' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { val: 'obc_bc_mbc', label: 'BC / MBC / DNC Category' },
                    { val: 'sc', label: 'Scheduled Caste (SC / Adi Dravidar)' },
                    { val: 'st', label: 'Scheduled Tribe (ST)' },
                    { val: 'general', label: 'General / OC Category' },
                  ] as { val: CommunityCategory; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      onUpdateProfile({ ...profile, communityCategory: opt.val })
                    }
                    className={`min-h-[52px] px-4 py-3 rounded-xl border text-sm font-bold text-left ${
                      profile.communityCategory === opt.val
                        ? 'border-sky-700 bg-sky-700 text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Mandatory Skip and I'd rather not say buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProfile({ ...profile, communityCategory: 'skip' })
                  }
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                    profile.communityCategory === 'skip'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t.common.skip}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateProfile({
                      ...profile,
                      communityCategory: 'prefer_not_to_say',
                    })
                  }
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                    profile.communityCategory === 'prefer_not_to_say'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t.common.preferNotToSay}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Household > Persons Separate Records Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
                <span>{t.smartProfile.householdSectionTitle}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {t.smartProfile.householdSectionDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFamilyMember}
              className="min-h-[48px] px-4 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 text-sm font-bold flex items-center gap-1.5 hover:bg-sky-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.smartProfile.addFamilyMemberBtn}</span>
            </button>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{t.smartProfile.noCategoryCopyRule}</span>
          </div>

          {profile.familyMembers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No additional household members listed yet. Tap &ldquo;{t.smartProfile.addFamilyMemberBtn}&rdquo; if you have children or dependents.
            </p>
          ) : (
            <div className="space-y-3">
              {profile.familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Member Label
                      </label>
                      <input
                        type="text"
                        value={member.label}
                        onChange={(e) =>
                          handleUpdateFamilyMember(member.id, { label: e.target.value })
                        }
                        className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Relation
                      </label>
                      <select
                        value={member.relation}
                        onChange={(e) =>
                          handleUpdateFamilyMember(member.id, {
                            relation: e.target.value as FamilyMemberRecord['relation'],
                          })
                        }
                        className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm"
                      >
                        <option value="child">Child</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Elderly Parent</option>
                        <option value="sibling">Sibling</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Age & Independent Category
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={110}
                          value={member.age ?? ''}
                          onChange={(e) =>
                            handleUpdateFamilyMember(member.id, {
                              age: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          className="min-h-[44px] w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-sm font-mono"
                        />
                        <span className="text-xs text-slate-500">
                          Cat: {member.independentCommunityCategory || 'unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFamilyMember(member.id)}
                    className="min-h-[44px] px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 flex items-center gap-1 self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.smartProfile.removeMemberBtn}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{t.common.back}</span>
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            AI Profile Adapter: {llmAdapterUsed}
          </div>

          <button
            type="button"
            onClick={onProceedToReview}
            className="min-h-[52px] px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-base font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>{t.smartProfile.proceedToReviewBtn}</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
};
