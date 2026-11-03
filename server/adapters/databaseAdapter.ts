import {
  AnonymisedFeedbackReport,
  CitizenProfile,
  ConsentRecord,
  MakerCheckerStatus,
  SchemeRecord,
  UserAccountRecord,
  UserPreferences,
} from '../../src/types/govassist';
import { INITIAL_SAMPLE_SCHEMES } from '../../src/data/sampleSchemes';

/**
 * DATABASE ABSTRACTION LAYER (Replaceable Provider Pattern)
 *
 * TODO [PRODUCTION DATABASE INTEGRATION]:
 * Swap `InMemoryDatabaseAdapter` with a PostgreSQL implementation using `pg` / Drizzle ORM
 * backed by `server/db/postgresSchema.sql`.
 *
 * PRIVACY & ARCHITECTURAL INVARIANTS ENFORCED HERE:
 * 1. Guest sessions live ONLY in an ephemeral session map (`guestSessions`) and are never
 *    written to permanent tables.
 * 2. `clearGuestSession(sessionId)` wipes all temporary data immediately.
 * 3. `convertGuestToAccount(...)` saves ONLY the user-consented items, writes an immutable
 *    `ConsentRecord` with timestamp, version, and language, and immediately deletes the guest session.
 * 4. Admin methods (`getAdminSchemes`, `getAnonymisedFeedback`, `transitionSchemeWorkflow`)
 *    have ZERO access to `guestSessions` or `userAccounts` (strict separation of citizen PII).
 * 5. Maker-Checker enforcement: `transitionSchemeWorkflow` rejects approval if
 *    `approverStaffId === scheme.lastEditedByStaffId`.
 */

export interface IDatabaseAdapter {
  // Ephemeral Guest Session Store (Short-lived, never persisted)
  saveGuestSession(sessionId: string, profile: CitizenProfile): Promise<void>;
  getGuestSession(sessionId: string): Promise<CitizenProfile | null>;
  clearGuestSession(sessionId: string): Promise<void>;

  // Public Scheme Catalogue
  getPublishedSchemes(): Promise<SchemeRecord[]>;

  // Optional User Account & Consent Records
  convertGuestToAccount(params: {
    sessionId: string;
    phone: string;
    consentedItems: ConsentRecord['consentedItems'];
    consentStatementText: string;
    policyVersion: string;
    language: ConsentRecord['language'];
    savedSchemeIds: string[];
    profile: CitizenProfile;
    preferences: UserPreferences;
  }): Promise<UserAccountRecord>;
  getUserAccount(userId: string): Promise<UserAccountRecord | null>;
  updateUserAccount(
    userId: string,
    updates: {
      savedSchemeIds?: string[];
      savedProfile?: Partial<CitizenProfile> | null;
      preferences?: Partial<UserPreferences>;
    }
  ): Promise<UserAccountRecord | null>;
  deleteUserAccount(userId: string): Promise<boolean>;

  // Anonymised Feedback & Problem Reports
  submitAnonymisedFeedback(
    report: Omit<AnonymisedFeedbackReport, 'id' | 'createdAt' | 'status'>
  ): Promise<AnonymisedFeedbackReport>;

  // Protected Admin Operations (Never exposes citizen profiles)
  getAdminSchemes(): Promise<SchemeRecord[]>;
  upsertSchemeByMaker(scheme: SchemeRecord, makerStaffId: string): Promise<SchemeRecord>;
  transitionSchemeWorkflow(params: {
    schemeId: string;
    targetStatus: MakerCheckerStatus;
    staffId: string;
  }): Promise<{ ok: boolean; error?: string; scheme?: SchemeRecord }>;
  getAnonymisedFeedback(): Promise<AnonymisedFeedbackReport[]>;
  updateFeedbackStatus(
    reportId: string,
    status: AnonymisedFeedbackReport['status']
  ): Promise<AnonymisedFeedbackReport | null>;
}

class InMemoryDatabaseAdapter implements IDatabaseAdapter {
  // 1. Short-lived Guest Session Store (In-memory only, auto-expiring)
  private guestSessions = new Map<string, { profile: CitizenProfile; expiresAt: number }>();

  // 2. Separated Persistent Domain Stores (Mocking PostgreSQL tables in prototype)
  private schemes = new Map<string, SchemeRecord>();
  private userAccounts = new Map<string, UserAccountRecord>();
  private consentRecords = new Map<string, ConsentRecord[]>();
  private feedbackReports: AnonymisedFeedbackReport[] = [];

  constructor() {
    for (const s of INITIAL_SAMPLE_SCHEMES) {
      this.schemes.set(s.id, structuredClone(s));
    }

    // Seed 2 realistic anonymised citizen feedback/unanswered question items for Admin review
    this.feedbackReports = [
      {
        id: 'fb-sample-101',
        schemeId: 'scheme-tn-children-fd-sample',
        schemeCode: 'TN-SAMPLE-03',
        issueType: 'outdated_rule',
        comment:
          '[ANONYMISED CITIZEN REPORT] Local e-Sevai operator in Madurai asked if the income ceiling was revised this year. Please verify official G.O.',
        language: 'ta',
        createdAt: '2026-10-28T11:15:00Z',
        status: 'open',
      },
      {
        id: 'fb-sample-102',
        schemeId: 'scheme-central-rural-housing-sample',
        schemeCode: 'CENTRAL-SAMPLE-04',
        issueType: 'unanswered_question',
        comment:
          '[UNANSWERED CITIZEN QUESTION] "If my family lives in a rented thatched house without land patta, can we apply for homestead land patta first?"',
        language: 'en',
        createdAt: '2026-10-30T16:40:00Z',
        status: 'open',
      },
    ];
  }

  async saveGuestSession(sessionId: string, profile: CitizenProfile): Promise<void> {
    const ttlMs = 30 * 60 * 1000; // 30 minutes short-lived session
    this.guestSessions.set(sessionId, {
      profile: structuredClone(profile),
      expiresAt: Date.now() + ttlMs,
    });
  }

  async getGuestSession(sessionId: string): Promise<CitizenProfile | null> {
    const entry = this.guestSessions.get(sessionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.guestSessions.delete(sessionId);
      return null;
    }
    return structuredClone(entry.profile);
  }

  async clearGuestSession(sessionId: string): Promise<void> {
    this.guestSessions.delete(sessionId);
  }

  async getPublishedSchemes(): Promise<SchemeRecord[]> {
    return Array.from(this.schemes.values())
      .filter((s) => s.workflowStatus === 'published')
      .map((s) => structuredClone(s));
  }

  async convertGuestToAccount(params: {
    sessionId: string;
    phone: string;
    consentedItems: ConsentRecord['consentedItems'];
    consentStatementText: string;
    policyVersion: string;
    language: ConsentRecord['language'];
    savedSchemeIds: string[];
    profile: CitizenProfile;
    preferences: UserPreferences;
  }): Promise<UserAccountRecord> {
    const userId = `usr_${Date.now().toString(36)}`;
    const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
    const maskedPhone =
      cleanPhone.length >= 4
        ? `XXXXXX${cleanPhone.slice(-4)}`
        : 'XXXXXX0000';

    const consentRecord: ConsentRecord = {
      id: `cns_${Date.now().toString(36)}`,
      userId,
      timestamp: new Date().toISOString(),
      policyVersion: params.policyVersion,
      language: params.language,
      consentedItems: { ...params.consentedItems },
      consentStatementText: params.consentStatementText,
    };

    // Only store what the citizen explicitly ticked on the consent screen
    const sanitizedProfile: Partial<CitizenProfile> | null = params.consentedItems.saveBasicProfile
      ? {
          stateCode: params.profile.stateCode,
          district: params.profile.district,
          age: params.profile.age,
          residenceType: params.profile.residenceType,
          occupation: params.profile.occupation,
          annualHouseholdIncomeINR: params.profile.annualHouseholdIncomeINR,
          maritalVulnerability: params.profile.maritalVulnerability,
          familyMembers: structuredClone(params.profile.familyMembers),
          availableDocumentIds: [...params.profile.availableDocumentIds],
        }
      : null;

    const account: UserAccountRecord = {
      userId,
      maskedPhone,
      createdAt: new Date().toISOString(),
      savedSchemeIds: params.consentedItems.saveSchemes ? [...params.savedSchemeIds] : [],
      savedProfile: sanitizedProfile,
      preferences: params.consentedItems.savePreferences
        ? {
            ...params.preferences,
            optInSmsReminders: params.consentedItems.optInReminders,
          }
        : {
            language: params.language,
            preferredInputMode: 'voice',
            liteMode: false,
            darkMode: false,
            textScale: '100',
            optInSmsReminders: params.consentedItems.optInReminders,
          },
      consentHistory: [consentRecord],
    };

    this.userAccounts.set(userId, account);
    this.consentRecords.set(userId, [consentRecord]);

    // CRITICAL: Wipe the temporary guest session immediately after account conversion
    await this.clearGuestSession(params.sessionId);

    return structuredClone(account);
  }

  async getUserAccount(userId: string): Promise<UserAccountRecord | null> {
    const acc = this.userAccounts.get(userId);
    return acc ? structuredClone(acc) : null;
  }

  async updateUserAccount(
    userId: string,
    updates: {
      savedSchemeIds?: string[];
      savedProfile?: Partial<CitizenProfile> | null;
      preferences?: Partial<UserPreferences>;
    }
  ): Promise<UserAccountRecord | null> {
    const acc = this.userAccounts.get(userId);
    if (!acc) return null;

    if (updates.savedSchemeIds !== undefined) {
      acc.savedSchemeIds = [...updates.savedSchemeIds];
    }
    if (updates.savedProfile !== undefined) {
      acc.savedProfile = updates.savedProfile ? structuredClone(updates.savedProfile) : null;
    }
    if (updates.preferences !== undefined) {
      acc.preferences = { ...acc.preferences, ...updates.preferences };
    }
    this.userAccounts.set(userId, acc);
    return structuredClone(acc);
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    this.consentRecords.delete(userId);
    return this.userAccounts.delete(userId);
  }

  async submitAnonymisedFeedback(
    report: Omit<AnonymisedFeedbackReport, 'id' | 'createdAt' | 'status'>
  ): Promise<AnonymisedFeedbackReport> {
    // Strip any accidental 10- or 12-digit numbers from comment so feedback stays strictly anonymised
    const scrubbedComment = report.comment.replace(/\b\d{10,12}\b/g, '[REDACTED-NUMBER]');
    const entry: AnonymisedFeedbackReport = {
      ...report,
      comment: scrubbedComment,
      id: `fb_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    this.feedbackReports.unshift(entry);
    return structuredClone(entry);
  }

  async getAdminSchemes(): Promise<SchemeRecord[]> {
    return Array.from(this.schemes.values()).map((s) => structuredClone(s));
  }

  async upsertSchemeByMaker(scheme: SchemeRecord, makerStaffId: string): Promise<SchemeRecord> {
    const now = new Date().toISOString();
    const updated: SchemeRecord = {
      ...structuredClone(scheme),
      isSamplePlaceholder: true, // Always enforce sample placeholder marker
      workflowStatus: 'draft', // Editing a scheme moves it to Draft for Maker-Checker review
      lastEditedByStaffId: makerStaffId,
      lastApprovedByStaffId: null,
      updatedAt: now,
    };
    this.schemes.set(updated.id, updated);
    return structuredClone(updated);
  }

  async transitionSchemeWorkflow(params: {
    schemeId: string;
    targetStatus: MakerCheckerStatus;
    staffId: string;
  }): Promise<{ ok: boolean; error?: string; scheme?: SchemeRecord }> {
    const existing = this.schemes.get(params.schemeId);
    if (!existing) {
      return { ok: false, error: 'Scheme not found.' };
    }

    // Maker-Checker Rule: The approver/publisher MUST differ from the editor
    if (
      (params.targetStatus === 'approved' || params.targetStatus === 'published') &&
      existing.lastEditedByStaffId.toLowerCase() === params.staffId.toLowerCase()
    ) {
      return {
        ok: false,
        error: `Maker-Checker Violation: Staff member (${params.staffId}) edited this scheme and cannot approve or publish their own changes. Switch to a different Checker/Reviewer account.`,
      };
    }

    existing.workflowStatus = params.targetStatus;
    if (params.targetStatus === 'approved' || params.targetStatus === 'published') {
      existing.lastApprovedByStaffId = params.staffId;
    }
    existing.updatedAt = new Date().toISOString();
    this.schemes.set(existing.id, existing);

    return { ok: true, scheme: structuredClone(existing) };
  }

  async getAnonymisedFeedback(): Promise<AnonymisedFeedbackReport[]> {
    return structuredClone(this.feedbackReports);
  }

  async updateFeedbackStatus(
    reportId: string,
    status: AnonymisedFeedbackReport['status']
  ): Promise<AnonymisedFeedbackReport | null> {
    const item = this.feedbackReports.find((r) => r.id === reportId);
    if (!item) return null;
    item.status = status;
    return structuredClone(item);
  }
}

export const dbAdapter: IDatabaseAdapter = new InMemoryDatabaseAdapter();
