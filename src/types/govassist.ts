/**
 * Core Domain Types for GovAssist
 * Keeps state, scheme, eligibility rule, household, and database types separate from UI code.
 */

export type LanguageCode =
  | 'ta' // Tamil (Fully translated)
  | 'en' // English (Fully translated)
  | 'hi' // Hindi (Fully translated)
  | 'te' // Telugu
  | 'ml' // Malayalam
  | 'kn' // Kannada
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'ur' // Urdu (RTL)
  | 'as' // Assamese
  | 'ks' // Kashmiri
  | 'ne' // Nepali
  | 'sd' // Sindhi
  | 'kok' // Konkani
  | 'doi' // Dogri
  | 'mai' // Maithili
  | 'sat' // Santali
  | 'mni' // Manipuri
  | 'brx' // Bodo
  | 'sa'; // Sanskrit

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
  isFullyTranslated: boolean;
  voiceLangTag: string;
  sampleAudioGreeting: string;
}

export type SensitiveChoice<T extends string> = T | 'skip' | 'prefer_not_to_say' | 'unknown';

export type ResidenceType = 'rural' | 'urban' | 'unknown';

export type OccupationType =
  | 'daily_wage_farm'
  | 'smallholder_farmer'
  | 'unorganised_worker'
  | 'self_employed_micro'
  | 'salaried_private'
  | 'government_employee'
  | 'homemaker_unemployed'
  | 'student'
  | 'unknown';

export type MaritalVulnerabilityStatus =
  | 'widow_single_parent'
  | 'married'
  | 'unmarried_single'
  | 'elderly_destitute'
  | 'unknown';

export type CommunityCategory = 'general' | 'obc_bc_mbc' | 'sc' | 'st';
export type MinorityStatus = 'minority_community' | 'non_minority';
export type DisabilityStatus = 'yes_certified_40_plus' | 'yes_unverified' | 'no';

/**
 * Separate record for each household member (Household > Persons).
 * Never copies a parent's category (caste/community/disability) to a child automatically.
 */
export interface FamilyMemberRecord {
  id: string;
  relation: 'child' | 'spouse' | 'parent' | 'sibling' | 'other_dependent';
  label: string; // e.g., "Child 1 (Daughter)" - Never real PII required
  age: number | null;
  isStudent: boolean | null;
  educationLevel?: 'school' | 'college_first_gen' | 'college_general' | 'none' | 'unknown';
  // Independent attributes - never inherited from primary user
  independentDisabilityStatus?: SensitiveChoice<DisabilityStatus>;
  independentCommunityCategory?: SensitiveChoice<CommunityCategory>;
}

/**
 * Primary Citizen & Household Profile
 */
export interface CitizenProfile {
  sessionId: string;
  stateCode: string; // e.g., 'TN' (Pilot: Tamil Nadu)
  district: string; // e.g., 'Madurai', 'Chennai', etc.
  age: number | null;
  gender: 'female' | 'male' | 'transgender_nonbinary' | 'prefer_not_to_say' | 'unknown';
  residenceType: ResidenceType;
  occupation: OccupationType;
  employmentStatus: 'employed_informal' | 'employed_formal' | 'unemployed' | 'student' | 'unknown';
  isStudent: boolean | null;
  annualHouseholdIncomeINR: number | null;
  maritalVulnerability: MaritalVulnerabilityStatus;
  hasAgriculturalLand: boolean | null;
  hasPattaLandRecordVerified: boolean | null;
  // Sensitive fields — asked ONLY when a specific scheme needs them
  communityCategory: SensitiveChoice<CommunityCategory>;
  minorityStatus: SensitiveChoice<MinorityStatus>;
  disabilityStatus: SensitiveChoice<DisabilityStatus>;
  hasFirstGraduateChildInCollege: 'yes' | 'no' | 'unknown';
  // Separate Household > Persons records
  familyMembers: FamilyMemberRecord[];
  // Documents the user confirms they already hold (for deterministic Missing Documents check)
  availableDocumentIds: string[];
  rawSituationDescription: string;
}

/**
 * Deterministic Eligibility Rule stored as structured data (no free-text rules)
 */
export type RuleFieldKey =
  | 'stateCode'
  | 'age'
  | 'gender'
  | 'residenceType'
  | 'occupation'
  | 'annualHouseholdIncomeINR'
  | 'maritalVulnerability'
  | 'hasAgriculturalLand'
  | 'hasPattaLandRecordVerified'
  | 'communityCategory'
  | 'minorityStatus'
  | 'disabilityStatus'
  | 'hasFirstGraduateChildInCollege'
  | 'familyChildCount';

export type RuleOperator = 'eq' | 'in' | 'lte' | 'gte' | 'boolean';

export interface StructuredEligibilityRule {
  id: string;
  field: RuleFieldKey;
  operator: RuleOperator;
  value: string | number | boolean | string[];
  label: {
    en: string;
    ta: string;
    hi: string;
  };
  isSensitive: boolean;
  whyWeAskNote?: {
    en: string;
    ta: string;
    hi: string;
  };
  requiresOfficialVerification?: boolean;
}

export interface DocumentGuide {
  id: string;
  name: {
    en: string;
    ta: string;
    hi: string;
  };
  isMandatory: boolean;
  howToGet: {
    en: string;
    ta: string;
    hi: string;
  } | null; // null if official info is not confirmed
  issuingAuthority: string;
}

export interface ApplicationRouteDetail {
  available: boolean;
  portalNameOrCentre?: string;
  officialUrl?: string;
  steps: {
    en: string[];
    ta: string[];
    hi: string[];
  };
  whatToCarryOrWarnings: {
    en: string[];
    ta: string[];
    hi: string[];
  };
  contactAsPublished?: string;
}

export type MakerCheckerStatus = 'draft' | 'in_review' | 'approved' | 'published';

export type VerificationStatusLabel = 'verified_sample' | 'review_due_soon' | 'expired_outdated';

export interface SchemeRecord {
  id: string;
  code: string;
  isSamplePlaceholder: true; // Enforces sample placeholder rule
  level: 'State' | 'Central';
  stateCode: 'TN' | 'ALL_INDIA';
  applicableLocations: string;
  department: {
    en: string;
    ta: string;
    hi: string;
  };
  title: {
    en: string;
    ta: string;
    hi: string;
  };
  shortSummary: {
    en: string;
    ta: string;
    hi: string;
  };
  benefits: {
    en: string;
    ta: string;
    hi: string;
  };
  rules: StructuredEligibilityRule[];
  requiresDepartmentalInspection: boolean;
  inspectionNote?: {
    en: string;
    ta: string;
    hi: string;
  };
  requiredDocuments: DocumentGuide[];
  applicationRoutes: {
    online: ApplicationRouteDetail;
    assisted: ApplicationRouteDetail;
    offline: ApplicationRouteDetail;
  };
  officialLink: string;
  officialSourceUrl: string;
  lastVerifiedDate: string; // YYYY-MM-DD
  nextReviewDueDate: string; // YYYY-MM-DD
  verificationStatus: VerificationStatusLabel;
  // Maker-checker governance fields
  workflowStatus: MakerCheckerStatus;
  lastEditedByStaffId: string;
  lastApprovedByStaffId: string | null;
  updatedAt: string;
}

/**
 * The 5 Deterministic Result Categories required by specification
 */
export type EligibilityResultCategory =
  | 'appears_eligible'
  | 'potentially_eligible'
  | 'missing_documents'
  | 'requires_verification'
  | 'not_eligible';

export interface RuleEvaluationTrace {
  ruleId: string;
  field: RuleFieldKey;
  label: string;
  status: 'yes' | 'no' | 'unknown';
  reason: string;
  isSensitive: boolean;
  requiresOfficialVerification?: boolean;
}

export interface SchemeEvaluationResult {
  scheme: SchemeRecord;
  category: EligibilityResultCategory;
  matchedReasons: string[];
  missingOrUnknownReasons: string[];
  failedReasons: string[];
  missingDocuments: DocumentGuide[];
  ruleTraces: RuleEvaluationTrace[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  timestamp: string;
  policyVersion: string;
  language: LanguageCode;
  consentedItems: {
    saveSchemes: boolean;
    saveBasicProfile: boolean;
    savePreferences: boolean;
    optInReminders: boolean;
  };
  consentStatementText: string;
}

export interface UserPreferences {
  language: LanguageCode;
  preferredInputMode: 'voice' | 'text';
  liteMode: boolean;
  darkMode: boolean;
  textScale: '100' | '115' | '130';
  optInSmsReminders: boolean;
}

export interface UserAccountRecord {
  userId: string;
  maskedPhone: string;
  createdAt: string;
  savedSchemeIds: string[];
  savedProfile: Partial<CitizenProfile> | null;
  preferences: UserPreferences;
  consentHistory: ConsentRecord[];
}

export interface AnonymisedFeedbackReport {
  id: string;
  schemeId: string;
  schemeCode: string;
  issueType: 'broken_link' | 'outdated_rule' | 'office_refused' | 'unanswered_question' | 'other';
  comment: string;
  language: LanguageCode;
  createdAt: string;
  status: 'open' | 'reviewed' | 'resolved';
}
