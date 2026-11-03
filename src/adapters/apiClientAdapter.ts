import {
  AnonymisedFeedbackReport,
  CitizenProfile,
  ConsentRecord,
  LanguageCode,
  MakerCheckerStatus,
  SchemeEvaluationResult,
  SchemeRecord,
  UserAccountRecord,
  UserPreferences,
} from '../types/govassist';

/**
 * CENTRALIZED BACKEND API ADAPTER
 * All AI, session, scheme evaluation, feedback, account, and admin operations
 * go strictly through backend endpoints. No API keys exist in frontend code.
 */

export async function apiClearGuestSession(sessionId: string): Promise<void> {
  await fetch('/api/session/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
}

export async function apiExtractSmartProfile(
  text: string,
  language: LanguageCode
): Promise<{
  provider: string;
  isMock: boolean;
  extracted: Partial<CitizenProfile>;
  piiScrubbedWarning: boolean;
}> {
  const res = await fetch('/api/ai/extract-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error('Failed to extract profile');
  return res.json();
}

export async function apiEvaluateSchemes(
  profile: CitizenProfile,
  language: LanguageCode
): Promise<{
  evaluations: SchemeEvaluationResult[];
  explanation: { provider: string; isMock: boolean; summaryText: string };
  evaluatedAt: string;
}> {
  const res = await fetch('/api/schemes/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, language }),
  });
  if (!res.ok) throw new Error('Failed to evaluate schemes');
  return res.json();
}

export async function apiReportSchemeProblem(params: {
  schemeId: string;
  schemeCode: string;
  issueType: AnonymisedFeedbackReport['issueType'];
  comment: string;
  language: LanguageCode;
}): Promise<{ ok: boolean; report: AnonymisedFeedbackReport }> {
  const res = await fetch('/api/feedback/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return res.json();
}

export async function apiConvertGuestToAccount(params: {
  sessionId: string;
  phone: string;
  otpCode: string;
  consentedItems: ConsentRecord['consentedItems'];
  consentStatementText: string;
  language: LanguageCode;
  savedSchemeIds: string[];
  profile: CitizenProfile;
  preferences: UserPreferences;
}): Promise<{
  ok: boolean;
  error?: string;
  account?: UserAccountRecord;
  guestSessionWiped?: boolean;
}> {
  const res = await fetch('/api/account/convert-guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiDeleteUserAccount(userId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/account/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function apiGetAdminDashboardData(): Promise<{
  schemes: SchemeRecord[];
  feedback: AnonymisedFeedbackReport[];
  privacyEnforcementNotice: string;
}> {
  const res = await fetch('/api/admin/dashboard-data');
  if (!res.ok) throw new Error('Failed to load admin data');
  return res.json();
}

export async function apiSaveAdminScheme(
  scheme: SchemeRecord,
  staffId: string
): Promise<{ ok: boolean; scheme: SchemeRecord }> {
  const res = await fetch('/api/admin/schemes/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheme, staffId }),
  });
  return res.json();
}

export async function apiTransitionSchemeWorkflow(params: {
  schemeId: string;
  targetStatus: MakerCheckerStatus;
  staffId: string;
}): Promise<{ ok: boolean; error?: string; scheme?: SchemeRecord }> {
  const res = await fetch('/api/admin/schemes/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiUpdateFeedbackStatus(
  reportId: string,
  status: AnonymisedFeedbackReport['status']
): Promise<{ ok: boolean; report: AnonymisedFeedbackReport }> {
  const res = await fetch('/api/admin/feedback/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, status }),
  });
  return res.json();
}
