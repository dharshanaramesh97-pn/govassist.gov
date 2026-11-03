import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Send,
  MessageSquareWarning,
  FileSpreadsheet,
  UserCog,
} from 'lucide-react';
import {
  AnonymisedFeedbackReport,
  MakerCheckerStatus,
  RuleFieldKey,
  RuleOperator,
  SchemeRecord,
  StructuredEligibilityRule,
} from '../types/govassist';
import {
  apiGetAdminDashboardData,
  apiSaveAdminScheme,
  apiTransitionSchemeWorkflow,
  apiUpdateFeedbackStatus,
} from '../adapters/apiClientAdapter';

interface AdminDashboardScreenProps {
  onExitAdmin: () => void;
}

const STRUCTURED_RULE_FIELDS: { key: RuleFieldKey; label: string }[] = [
  { key: 'stateCode', label: 'State Code (e.g. TN)' },
  { key: 'age', label: 'Applicant Age (Years)' },
  { key: 'residenceType', label: 'Residence Area (rural / urban)' },
  { key: 'maritalVulnerability', label: 'Household Status (widow_single_parent / married / etc.)' },
  { key: 'occupation', label: 'Occupation (daily_wage_farm / smallholder_farmer / etc.)' },
  { key: 'annualHouseholdIncomeINR', label: 'Annual Household Income (INR)' },
  { key: 'familyChildCount', label: 'Number of Children in Household' },
  { key: 'communityCategory', label: '[SENSITIVE] Community Category (obc_bc_mbc / sc / st)' },
  { key: 'disabilityStatus', label: '[SENSITIVE] Disability Status (yes_certified_40_plus)' },
];

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onExitAdmin,
}) => {
  // Staff Login with MFA Placeholder
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffEmail, setStaffEmail] = useState<'editor@govassist.org' | 'reviewer@govassist.org'>(
    'editor@govassist.org'
  );
  const [mfaCode, setMfaCode] = useState('654321');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Data
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [feedback, setFeedback] = useState<AnonymisedFeedbackReport[]>([]);
  const [privacyNotice, setPrivacyNotice] = useState('');
  const [activeTab, setActiveTab] = useState<'catalogue' | 'rule_editor' | 'feedback'>('catalogue');
  const [workflowFilter, setWorkflowFilter] = useState<MakerCheckerStatus | 'all' | 'expired'>(
    'all'
  );
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = async () => {
    const data = await apiGetAdminDashboardData();
    setSchemes(data.schemes);
    setFeedback(data.feedback);
    setPrivacyNotice(data.privacyEnforcementNotice);
    if (!selectedScheme && data.schemes.length > 0) {
      setSelectedScheme(structuredClone(data.schemes[0]));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim() !== '654321') {
      setLoginError('Invalid placeholder MFA TOTP code. Use test code 654321.');
      return;
    }
    setLoginError(null);
    setIsAuthenticated(true);
  };

  const handleSaveSchemeAsMaker = async () => {
    if (!selectedScheme) return;
    setStatusMessage(null);
    const res = await apiSaveAdminScheme(selectedScheme, staffEmail);
    if (res.ok) {
      setSelectedScheme(res.scheme);
      await loadData();
      setStatusMessage({
        type: 'success',
        text: `Saved by Maker (${staffEmail}). Workflow reset to "Draft" for Maker-Checker review.`,
      });
    }
  };

  const handleTransitionWorkflow = async (
    schemeId: string,
    targetStatus: MakerCheckerStatus
  ) => {
    setStatusMessage(null);
    const res = await apiTransitionSchemeWorkflow({
      schemeId,
      targetStatus,
      staffId: staffEmail,
    });
    if (!res.ok) {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Workflow transition rejected.',
      });
      return;
    }
    if (res.scheme && selectedScheme?.id === res.scheme.id) {
      setSelectedScheme(res.scheme);
    }
    await loadData();
    setStatusMessage({
      type: 'success',
      text: `Workflow transitioned to "${targetStatus.toUpperCase()}" by ${staffEmail}.`,
    });
  };

  const handleAddStructuredRule = () => {
    if (!selectedScheme) return;
    const newRule: StructuredEligibilityRule = {
      id: `rule_${Date.now().toString(36)}`,
      field: 'annualHouseholdIncomeINR',
      operator: 'lte',
      value: 150000,
      label: {
        en: 'Annual household income up to ₹1,50,000',
        ta: 'ஆண்டு குடும்ப வருமானம் ₹1,50,000-க்குள் இருக்க வேண்டும்',
        hi: 'वार्षिक पारिवारिक आय ₹1,50,000 तक',
      },
      isSensitive: false,
    };
    setSelectedScheme({
      ...selectedScheme,
      rules: [...selectedScheme.rules, newRule],
    });
  };

  const handleCreateNewSampleScheme = () => {
    const newScheme: SchemeRecord = {
      id: `scheme-custom-${Date.now().toString(36)}`,
      code: `TN-SAMPLE-0${schemes.length + 1}`,
      isSamplePlaceholder: true,
      level: 'State',
      stateCode: 'TN',
      applicableLocations: 'All Districts in Tamil Nadu (Sample)',
      department: {
        en: '[SAMPLE] Labour Welfare & Skill Development Department, TN',
        ta: '[மாதிரி] தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை',
        hi: '[नमूना] श्रम कल्याण एवं कौशल विकास विभाग, तमिलनाडु',
      },
      title: {
        en: '[SAMPLE PLACEHOLDER] Unorganised Welfare Board Tool-Kit Grant',
        ta: '[மாதிரித் திட்டம்] அமைப்புசாரா தொழிலாளர் நல வாரிய உபகரண மானியம்',
        hi: '[नमूना योजना] असंगठित श्रमिक कल्याण बोर्ड टूल-किट अनुदान',
      },
      shortSummary: {
        en: 'Sample placeholder scheme created in Admin Dashboard.',
        ta: 'நிர்வாகத் தளத்தில் உருவாக்கப்பட்ட மாதிரித் திட்டம்.',
        hi: 'एडमिन डैशबोर्ड में बनाई गई नमूना योजना।',
      },
      benefits: {
        en: '[SAMPLE BENEFIT] ₹5,000 tool-kit voucher via Welfare Board.',
        ta: '[மாதிரிப் பலன்] ₹5,000 தொழில் உபகரண உதவி.',
        hi: '[नमूना लाभ] ₹5,000 टूल-किट वाउचर।',
      },
      rules: [
        {
          id: 'r-new-1',
          field: 'stateCode',
          operator: 'eq',
          value: 'TN',
          label: {
            en: 'Resident of Tamil Nadu',
            ta: 'தமிழ்நாட்டில் வசிப்பவர்',
            hi: 'तमिलनाडु का निवासी',
          },
          isSensitive: false,
        },
      ],
      requiresDepartmentalInspection: false,
      requiredDocuments: [],
      applicationRoutes: {
        online: {
          available: true,
          portalNameOrCentre: 'TNUWWB Sample Portal',
          steps: {
            en: ['Submit online with Welfare Board ID card.'],
            ta: ['நல வாரிய அடையாள அட்டையுடன் விண்ணப்பிக்கவும்.'],
            hi: ['कल्याण बोर्ड आईडी कार्ड के साथ आवेदन करें।'],
          },
          whatToCarryOrWarnings: { en: [], ta: [], hi: [] },
        },
        assisted: {
          available: true,
          portalNameOrCentre: 'e-Sevai Centre',
          steps: {
            en: ['Visit nearest e-Sevai centre.'],
            ta: ['அருகிலுள்ள இ-சேவை மையத்தை அணுகவும்.'],
            hi: ['नजदीकी ई-सेवा केंद्र पर जाएं।'],
          },
          whatToCarryOrWarnings: { en: [], ta: [], hi: [] },
        },
        offline: {
          available: true,
          portalNameOrCentre: 'Assistant Commissioner of Labour (Social Security Scheme)',
          steps: {
            en: ['Apply at District Labour Welfare Board office.'],
            ta: ['மாவட்ட தொழிலாளர் நல வாரிய அலுவலகத்தில் விண்ணப்பிக்கவும்.'],
            hi: ['जिला श्रम कल्याण कार्यालय में आवेदन करें।'],
          },
          whatToCarryOrWarnings: { en: [], ta: [], hi: [] },
        },
      },
      officialLink: 'https://tnuwwb.tn.gov.in/sample-placeholder',
      officialSourceUrl: 'https://www.tn.gov.in/department/labour-sample',
      lastVerifiedDate: '2026-11-01',
      nextReviewDueDate: '2027-02-01',
      verificationStatus: 'verified_sample',
      workflowStatus: 'draft',
      lastEditedByStaffId: staffEmail,
      lastApprovedByStaffId: null,
      updatedAt: new Date().toISOString(),
    };
    setSelectedScheme(newScheme);
    setActiveTab('rule_editor');
  };

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto py-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300">
            <Lock className="w-4 h-4" />
            <span>Protected Route · Staff Governance & Maker-Checker Portal</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Staff Admin Login (MFA Placeholder)
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Admin users manage scheme rules, official source URLs, and maker-checker approvals.
            Admin users NEVER have access to citizen personal profiles.
          </p>

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Staff Role Account
              </label>
              <select
                value={staffEmail}
                onChange={(e) =>
                  setStaffEmail(
                    e.target.value as 'editor@govassist.org' | 'reviewer@govassist.org'
                  )
                }
                className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm font-medium"
              >
                <option value="editor@govassist.org">
                  editor@govassist.org (Maker — Policy Editor)
                </option>
                <option value="reviewer@govassist.org">
                  reviewer@govassist.org (Checker — Senior Approver)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                6-Digit Hardware / Authenticator MFA Code (Placeholder: 654321)
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-base font-mono"
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{loginError}</p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onExitAdmin}
                className="min-h-[48px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Back to Citizen App
              </button>

              <button
                type="submit"
                className="min-h-[48px] px-6 rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-sm font-bold"
              >
                Verify MFA & Enter Admin
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  const filteredSchemes = schemes.filter((s) => {
    if (workflowFilter === 'all') return true;
    if (workflowFilter === 'expired') {
      return (
        s.verificationStatus === 'expired_outdated' ||
        new Date(s.nextReviewDueDate) < new Date('2026-11-01')
      );
    }
    return s.workflowStatus === workflowFilter;
  });

  return (
    <section className="space-y-6">
      {/* Admin Top Workspace Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-800 dark:text-sky-300">
              GovAssist Staff Governance Console · Maker-Checker Workflow
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Scheme Catalogue, Structured Rule Builder & Verification Audit
            </h1>
          </div>

          {/* Live Role Switcher so Evaluators can test Maker vs Checker in 1 click */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-950">
              <UserCog className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span className="text-xs font-bold">Active Staff:</span>
              <select
                value={staffEmail}
                onChange={(e) =>
                  setStaffEmail(
                    e.target.value as 'editor@govassist.org' | 'reviewer@govassist.org'
                  )
                }
                aria-label="Switch Active Staff Role"
                className="text-xs font-mono font-bold bg-transparent focus:outline-none"
              >
                <option value="editor@govassist.org">
                  editor@govassist.org (Maker)
                </option>
                <option value="reviewer@govassist.org">
                  reviewer@govassist.org (Checker)
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Return to Citizen View
            </button>
          </div>
        </div>

        {/* Strict Citizen Privacy Isolation Notice */}
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-emerald-950 dark:text-emerald-200">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            {privacyNotice ||
              'STRICT PRIVACY ISOLATION: Admin users never see personal citizen profiles or household records.'}
          </span>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            role="alert"
            className={`rounded-xl border p-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 ${
              statusMessage.type === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                : 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200'
            }`}
          >
            {statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Primary Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                activeTab === 'catalogue'
                  ? 'bg-slate-900 text-white dark:bg-sky-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Scheme Catalogue & Maker-Checker ({schemes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rule_editor')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                activeTab === 'rule_editor'
                  ? 'bg-slate-900 text-white dark:bg-sky-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Structured Rule Builder & Source Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-slate-900 text-white dark:bg-sky-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>Anonymised Feedback & Unanswered Questions ({feedback.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreateNewSampleScheme}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Sample Scheme</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCHEME CATALOGUE & MAKER-CHECKER WORKFLOW */}
      {activeTab === 'catalogue' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Maker-Checker Workflow Queue (Draft &gt; In review &gt; Approved &gt; Published)
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Schemes' },
                  { id: 'draft', label: 'Draft' },
                  { id: 'in_review', label: 'In Review' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'published', label: 'Published' },
                  { id: 'expired', label: 'Expired / Review Overdue' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setWorkflowFilter(f.id)}
                  className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold ${
                    workflowFilter === f.id
                      ? 'bg-sky-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-3">Code & Title</th>
                  <th className="py-3 px-3">Verification Dates</th>
                  <th className="py-3 px-3">Workflow Status</th>
                  <th className="py-3 px-3">Maker / Checker</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredSchemes.map((s) => {
                  const isExpired =
                    s.verificationStatus === 'expired_outdated' ||
                    new Date(s.nextReviewDueDate) < new Date('2026-11-01');
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-sky-800 dark:text-sky-300">
                          {s.code} ({s.level})
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {s.title.en}
                        </div>
                        <div className="text-xs text-slate-500 break-all">
                          Source: {s.officialSourceUrl}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono tabular-nums text-xs">
                        <div>Verified: {s.lastVerifiedDate}</div>
                        <div
                          className={
                            isExpired
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        >
                          Due: {s.nextReviewDueDate} {isExpired && ' (OUTDATED)'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold uppercase text-xs">
                        {s.workflowStatus.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-3 text-xs font-mono">
                        <div>Maker: {s.lastEditedByStaffId}</div>
                        <div>Checker: {s.lastApprovedByStaffId || 'Pending'}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedScheme(structuredClone(s));
                            setActiveTab('rule_editor');
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
                        >
                          Edit Rules
                        </button>

                        {s.workflowStatus === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleTransitionWorkflow(s.id, 'in_review')}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
                          >
                            Submit to Review
                          </button>
                        )}

                        {s.workflowStatus === 'in_review' && (
                          <button
                            type="button"
                            onClick={() => handleTransitionWorkflow(s.id, 'approved')}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                          >
                            Approve (Checker)
                          </button>
                        )}

                        {(s.workflowStatus === 'approved' || s.workflowStatus === 'in_review') && (
                          <button
                            type="button"
                            onClick={() => handleTransitionWorkflow(s.id, 'published')}
                            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                          >
                            Publish
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STRUCTURED RULE BUILDER (NO FREE-TEXT RULES) & SOURCE VERIFICATION */}
      {activeTab === 'rule_editor' && selectedScheme && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Editing Scheme: {selectedScheme.code}
              </h2>
              <p className="text-xs text-slate-500">
                Current Status: {selectedScheme.workflowStatus.toUpperCase()} · Last Edited By:{' '}
                {selectedScheme.lastEditedByStaffId}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSchemeAsMaker}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save as Draft (Maker: {staffEmail})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTransitionWorkflow(selectedScheme.id, 'in_review')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit to Review</span>
              </button>
            </div>
          </div>

          {/* Official Verification Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Scheme Title (English — Must retain [SAMPLE PLACEHOLDER] prefix)
              </label>
              <input
                type="text"
                value={selectedScheme.title.en}
                onChange={(e) =>
                  setSelectedScheme({
                    ...selectedScheme,
                    title: { ...selectedScheme.title, en: e.target.value },
                  })
                }
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Source URL (G.O. / Notification)
              </label>
              <input
                type="url"
                value={selectedScheme.officialSourceUrl}
                onChange={(e) =>
                  setSelectedScheme({
                    ...selectedScheme,
                    officialSourceUrl: e.target.value,
                  })
                }
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Last Verified Date
              </label>
              <input
                type="date"
                value={selectedScheme.lastVerifiedDate}
                onChange={(e) =>
                  setSelectedScheme({
                    ...selectedScheme,
                    lastVerifiedDate: e.target.value,
                  })
                }
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Next Review Due Date
              </label>
              <input
                type="date"
                value={selectedScheme.nextReviewDueDate}
                onChange={(e) =>
                  setSelectedScheme({
                    ...selectedScheme,
                    nextReviewDueDate: e.target.value,
                  })
                }
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs font-mono"
              />
            </div>
          </div>

          {/* Structured Eligibility Rule Builder (No Free-Text Rules Allowed) */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Structured Eligibility Rule Builder (Deterministic — No Free-Text Rules)
                </h3>
                <p className="text-xs text-slate-500">
                  Every rule uses typed Profile Field + Operator + Structured Value for deterministic evaluation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStructuredRule}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Structured Condition</span>
              </button>
            </div>

            <div className="space-y-3">
              {selectedScheme.rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Rule #{idx + 1} · Structured Field
                    </label>
                    <select
                      value={rule.field}
                      onChange={(e) => {
                        const updated = [...selectedScheme.rules];
                        updated[idx] = {
                          ...rule,
                          field: e.target.value as RuleFieldKey,
                        };
                        setSelectedScheme({ ...selectedScheme, rules: updated });
                      }}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium"
                    >
                      {STRUCTURED_RULE_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Operator
                    </label>
                    <select
                      value={rule.operator}
                      onChange={(e) => {
                        const updated = [...selectedScheme.rules];
                        updated[idx] = {
                          ...rule,
                          operator: e.target.value as RuleOperator,
                        };
                        setSelectedScheme({ ...selectedScheme, rules: updated });
                      }}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-mono"
                    >
                      <option value="eq">== (Equals)</option>
                      <option value="lte">&lt;= (Max)</option>
                      <option value="gte">&gt;= (Min)</option>
                      <option value="in">IN (List)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Target Value
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(rule.value) ? rule.value.join(',') : String(rule.value)
                      }
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsedVal =
                          rule.operator === 'in'
                            ? raw.split(',').map((s) => s.trim())
                            : !isNaN(Number(raw)) && raw.trim() !== ''
                            ? Number(raw)
                            : raw;
                        const updated = [...selectedScheme.rules];
                        updated[idx] = { ...rule, value: parsedVal };
                        setSelectedScheme({ ...selectedScheme, rules: updated });
                      }}
                      className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer min-h-[42px]">
                      <input
                        type="checkbox"
                        checked={rule.isSensitive}
                        onChange={(e) => {
                          const updated = [...selectedScheme.rules];
                          updated[idx] = { ...rule, isSensitive: e.target.checked };
                          setSelectedScheme({ ...selectedScheme, rules: updated });
                        }}
                        className="w-4 h-4 accent-sky-700"
                      />
                      <span>Sensitive</span>
                    </label>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = selectedScheme.rules.filter((r) => r.id !== rule.id);
                        setSelectedScheme({ ...selectedScheme, rules: updated });
                      }}
                      aria-label="Delete rule"
                      className="min-h-[42px] px-3 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANONYMISED CITIZEN FEEDBACK & UNANSWERED QUESTIONS */}
      {activeTab === 'feedback' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Anonymised Citizen Problem Reports & Unanswered Questions
          </h2>
          <p className="text-xs text-slate-500">
            All personal identifiers and 10/12-digit numbers are automatically scrubbed before storage.
          </p>

          <div className="space-y-3">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="font-bold text-sky-800 dark:text-sky-300">
                      {item.schemeCode}
                    </span>
                    <span>·</span>
                    <span>{item.issueType.replace(/_/g, ' ').toUpperCase()}</span>
                    <span>·</span>
                    <span>Lang: {item.language}</span>
                    <span>·</span>
                    <span>Status: {item.status.toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                    {item.comment}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await apiUpdateFeedbackStatus(item.id, 'resolved');
                        await loadData();
                      }}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
