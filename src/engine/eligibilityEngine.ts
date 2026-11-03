import {
  CitizenProfile,
  EligibilityResultCategory,
  LanguageCode,
  RuleEvaluationTrace,
  RuleFieldKey,
  SchemeEvaluationResult,
  SchemeRecord,
  StructuredEligibilityRule,
} from '../types/govassist';

/**
 * DETERMINISTIC ELIGIBILITY RULES ENGINE
 *
 * CRITICAL ARCHITECTURE RULE:
 * Eligibility is decided strictly by this deterministic 3-valued logic (yes / no / unknown)
 * rules engine over structured scheme data.
 * AI never decides eligibility; AI only extracts natural language into structured profile fields
 * and explains the deterministic output in plain words.
 */

function getProfileFieldValue(
  profile: CitizenProfile,
  field: RuleFieldKey
): string | number | boolean | null | 'unknown' | 'skip' | 'prefer_not_to_say' {
  switch (field) {
    case 'stateCode':
      return profile.stateCode || 'unknown';
    case 'age':
      return profile.age;
    case 'gender':
      return profile.gender;
    case 'residenceType':
      return profile.residenceType;
    case 'occupation':
      return profile.occupation;
    case 'annualHouseholdIncomeINR':
      return profile.annualHouseholdIncomeINR;
    case 'maritalVulnerability':
      return profile.maritalVulnerability;
    case 'hasAgriculturalLand':
      return profile.hasAgriculturalLand;
    case 'hasPattaLandRecordVerified':
      return profile.hasPattaLandRecordVerified;
    case 'communityCategory':
      return profile.communityCategory;
    case 'minorityStatus':
      return profile.minorityStatus;
    case 'disabilityStatus':
      return profile.disabilityStatus;
    case 'hasFirstGraduateChildInCollege':
      return profile.hasFirstGraduateChildInCollege;
    case 'familyChildCount':
      return profile.familyMembers.filter((m) => m.relation === 'child').length;
    default:
      return 'unknown';
  }
}

function pickLocalizedText(
  textObj: { en: string; ta: string; hi: string },
  lang: LanguageCode
): string {
  if (lang === 'ta') return textObj.ta;
  if (lang === 'hi') return textObj.hi;
  return textObj.en;
}

export function evaluateSingleRule(
  profile: CitizenProfile,
  rule: StructuredEligibilityRule,
  lang: LanguageCode
): RuleEvaluationTrace {
  const rawVal = getProfileFieldValue(profile, rule.field);
  const label = pickLocalizedText(rule.label, lang);

  // Check if value is unknown, skipped, or null
  if (
    rawVal === null ||
    rawVal === undefined ||
    rawVal === 'unknown' ||
    rawVal === 'skip' ||
    rawVal === 'prefer_not_to_say' ||
    rawVal === ''
  ) {
    const skippedMsg =
      lang === 'ta'
        ? `${label} — தகவல் வழங்கப்படவில்லை / தவிர்க்கப்பட்டது`
        : lang === 'hi'
        ? `${label} — जानकारी उपलब्ध नहीं / छोड़ी गई`
        : `${label} — Detail not provided or skipped`;

    return {
      ruleId: rule.id,
      field: rule.field,
      label,
      status: 'unknown',
      reason: skippedMsg,
      isSensitive: rule.isSensitive,
      requiresOfficialVerification: rule.requiresOfficialVerification,
    };
  }

  let matched = false;
  switch (rule.operator) {
    case 'eq':
      matched = String(rawVal) === String(rule.value);
      break;
    case 'boolean':
      matched = Boolean(rawVal) === Boolean(rule.value);
      break;
    case 'lte':
      matched = Number(rawVal) <= Number(rule.value);
      break;
    case 'gte':
      matched = Number(rawVal) >= Number(rule.value);
      break;
    case 'in':
      if (Array.isArray(rule.value)) {
        matched = rule.value.map(String).includes(String(rawVal));
      } else {
        matched = String(rawVal) === String(rule.value);
      }
      break;
  }

  if (matched) {
    const matchMsg =
      lang === 'ta'
        ? `பொருந்துகிறது: ${label}`
        : lang === 'hi'
        ? `मेल खाता है: ${label}`
        : `Matches rule: ${label}`;
    return {
      ruleId: rule.id,
      field: rule.field,
      label,
      status: 'yes',
      reason: matchMsg,
      isSensitive: rule.isSensitive,
      requiresOfficialVerification: rule.requiresOfficialVerification,
    };
  } else {
    const failMsg =
      lang === 'ta'
        ? `பொருந்தவில்லை: ${label} (உங்கள் விவரம்: ${String(rawVal)})`
        : lang === 'hi'
        ? `मेल नहीं खाता: ${label} (आपका विवरण: ${String(rawVal)})`
        : `Does not match rule: ${label} (Your detail: ${String(rawVal)})`;
    return {
      ruleId: rule.id,
      field: rule.field,
      label,
      status: 'no',
      reason: failMsg,
      isSensitive: rule.isSensitive,
      requiresOfficialVerification: rule.requiresOfficialVerification,
    };
  }
}

export function evaluateSchemeForProfile(
  profile: CitizenProfile,
  scheme: SchemeRecord,
  lang: LanguageCode
): SchemeEvaluationResult {
  const ruleTraces = scheme.rules.map((r) => evaluateSingleRule(profile, r, lang));

  const matchedReasons = ruleTraces.filter((t) => t.status === 'yes').map((t) => t.reason);
  const missingOrUnknownReasons = ruleTraces
    .filter((t) => t.status === 'unknown')
    .map((t) => t.reason);
  const failedReasons = ruleTraces.filter((t) => t.status === 'no').map((t) => t.reason);

  // Check mandatory documents
  const missingDocuments = scheme.requiredDocuments.filter(
    (doc) => doc.isMandatory && !profile.availableDocumentIds.includes(doc.id)
  );

  let category: EligibilityResultCategory;

  // Deterministic classification into the 5 categories:
  if (failedReasons.length > 0) {
    // 5. Not eligible based on known rules
    category = 'not_eligible';
  } else if (missingOrUnknownReasons.length > 0) {
    // 2. Potentially eligible, more details needed (unknown/skipped criteria)
    category = 'potentially_eligible';
  } else if (scheme.requiresDepartmentalInspection) {
    // 4. Requires official verification (field inspection / Gram Sabha / committee appraisal)
    category = 'requires_verification';
  } else if (missingDocuments.length > 0) {
    // 3. Missing documents or requirements (all rules match, but mandatory documents not yet held)
    category = 'missing_documents';
  } else {
    // 1. Appears eligible (based on what you told us)
    category = 'appears_eligible';
  }

  return {
    scheme,
    category,
    matchedReasons,
    missingOrUnknownReasons,
    failedReasons,
    missingDocuments,
    ruleTraces,
  };
}

export function evaluateAllSchemes(
  profile: CitizenProfile,
  schemes: SchemeRecord[],
  lang: LanguageCode
): SchemeEvaluationResult[] {
  // Only evaluate published schemes for citizens
  const publishedSchemes = schemes.filter((s) => s.workflowStatus === 'published');
  return publishedSchemes.map((scheme) => evaluateSchemeForProfile(profile, scheme, lang));
}
