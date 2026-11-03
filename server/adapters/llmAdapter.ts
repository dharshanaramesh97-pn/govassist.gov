import { GoogleGenAI, Type } from '@google/genai';
import {
  CitizenProfile,
  FamilyMemberRecord,
  LanguageCode,
  SchemeEvaluationResult,
} from '../../src/types/govassist';

/**
 * REPLACEABLE LLM ADAPTER (Server-Side Only)
 *
 * CRITICAL SECURITY & ARCHITECTURAL RULES:
 * 1. All Gemini API calls happen strictly on the backend. API keys are NEVER exposed to the browser.
 * 2. The AI NEVER decides scheme eligibility. It only:
 *    (a) Extracts non-sensitive structured profile fields from natural citizen descriptions.
 *    (b) Summarizes deterministic rules-engine outputs in warm, plain, non-guaranteeing language.
 * 3. NEVER infer sensitive attributes (caste/community, religion/minority status, or disability)
 *    from a citizen's name, surname, village/address, or spoken language.
 */

export interface ExtractedProfileResult {
  provider: 'gemini-3.8-flash' | 'mock-fallback-adapter';
  isMock: boolean;
  extracted: Partial<CitizenProfile>;
  piiScrubbedWarning: boolean;
}

export interface PlainLanguageExplanationResult {
  provider: 'gemini-3.8-flash' | 'mock-fallback-adapter';
  isMock: boolean;
  summaryText: string;
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Deterministic fallback parser so the prototype works seamlessly even when offline
 * or before a production Gemini API key is configured.
 */
function fallbackExtractFromText(text: string): Partial<CitizenProfile> {
  const lower = text.toLowerCase();

  // Age detection
  let age: number | null = null;
  const ageMatch =
    text.match(/(\d{2})\s*(?:year|yr|வயது|वर्ष|साल)/i) ||
    text.match(/(?:age|வயது|आयु)\s*[:=-]?\s*(\d{2})/i);
  if (ageMatch) {
    const parsed = parseInt(ageMatch[1], 10);
    if (parsed >= 15 && parsed <= 100) age = parsed;
  }

  // District detection (Tamil Nadu pilot)
  let district = '';
  const districtMap: Array<[string, string[]]> = [
    ['Madurai', ['madurai', 'மதுரை', 'मदुरै']],
    ['Chennai', ['chennai', 'சென்னை', 'चेन्नई']],
    ['Coimbatore', ['coimbatore', 'கோயம்புத்தூர்', 'कोयंबटूर']],
    ['Tiruchirappalli', ['trichy', 'tiruchirappalli', 'திருச்சி', 'तिरुचिरापल्ली']],
    ['Salem', ['salem', 'சேலம்', 'सेलम']],
    ['Tirunelveli', ['tirunelveli', 'திருநெல்வேலி', 'तिरुनेलवेली']],
    ['Thanjavur', ['thanjavur', 'தஞ்சாவூர்', 'तंजावुर']],
  ];
  for (const [id, keywords] of districtMap) {
    if (keywords.some((kw) => lower.includes(kw))) {
      district = id;
      break;
    }
  }

  // Residence type
  let residenceType: CitizenProfile['residenceType'] = 'unknown';
  if (
    lower.includes('rural') ||
    lower.includes('village') ||
    lower.includes('கிராம') ||
    lower.includes('ग्रामीण') ||
    lower.includes('गाँव')
  ) {
    residenceType = 'rural';
  } else if (
    lower.includes('urban') ||
    lower.includes('city') ||
    lower.includes('chennai') ||
    lower.includes('நகர்ப்புற') ||
    lower.includes('शहरी')
  ) {
    residenceType = 'urban';
  }

  // Marital / vulnerability status
  let maritalVulnerability: CitizenProfile['maritalVulnerability'] = 'unknown';
  if (
    lower.includes('widow') ||
    lower.includes('single mother') ||
    lower.includes('விதவை') ||
    lower.includes('विधवा')
  ) {
    maritalVulnerability = 'widow_single_parent';
  } else if (lower.includes('married') || lower.includes('திருமணமான') || lower.includes('विवाहित')) {
    maritalVulnerability = 'married';
  } else if (lower.includes('youth') || lower.includes('unmarried') || lower.includes('இளைஞர்')) {
    maritalVulnerability = 'unmarried_single';
  }

  // Occupation
  let occupation: CitizenProfile['occupation'] = 'unknown';
  if (
    lower.includes('farm') ||
    lower.includes('daily wage') ||
    lower.includes('labour') ||
    lower.includes('விவசாய') ||
    lower.includes('கூலி') ||
    lower.includes('खेत') ||
    lower.includes('मजदूर')
  ) {
    occupation = 'daily_wage_farm';
  } else if (
    lower.includes('tailor') ||
    lower.includes('shop') ||
    lower.includes('business') ||
    lower.includes('தையல்') ||
    lower.includes('கடை') ||
    lower.includes('दुकान')
  ) {
    occupation = 'self_employed_micro';
  }

  // Annual income
  let annualHouseholdIncomeINR: number | null = null;
  const incomeMatch = text.replace(/,/g, '').match(/(?:₹|rs\.?|inr)?\s*(\d{4,6})/i);
  if (incomeMatch) {
    const val = parseInt(incomeMatch[1], 10);
    if (val >= 5000 && val <= 900000) {
      annualHouseholdIncomeINR = val;
    }
  }

  // Family members (separate records - never copy parent's category to child)
  const familyMembers: FamilyMemberRecord[] = [];
  if (
    lower.includes('two children') ||
    lower.includes('two school children') ||
    lower.includes('2 பள்ளிக் குழந்தைகள்') ||
    lower.includes('இரண்டு குழந்தைகள்') ||
    lower.includes('दो स्कूल जाने वाले बच्चे') ||
    lower.includes('2 children')
  ) {
    familyMembers.push(
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
      }
    );
  } else if (
    lower.includes('one college child') ||
    lower.includes('ஒரு குழந்தை கல்லூரியில்') ||
    lower.includes('एक बच्चा कॉलेज') ||
    lower.includes('child') ||
    lower.includes('குழந்தை')
  ) {
    familyMembers.push({
      id: 'fam_child_1',
      relation: 'child',
      label: 'Child 1 (Student)',
      age: 18,
      isStudent: true,
      educationLevel: lower.includes('college') || lower.includes('கல்லூரி') ? 'college_first_gen' : 'school',
      independentCommunityCategory: 'unknown',
      independentDisabilityStatus: 'unknown',
    });
  }

  return {
    stateCode: 'TN',
    district,
    age,
    residenceType,
    occupation,
    maritalVulnerability,
    annualHouseholdIncomeINR,
    familyMembers,
    // Strictly never infer sensitive fields from text unless explicitly edited later
    communityCategory: 'unknown',
    minorityStatus: 'unknown',
    disabilityStatus: 'unknown',
  };
}

export async function extractStructuredProfileWithLLM(
  rawText: string,
  lang: LanguageCode
): Promise<ExtractedProfileResult> {
  // Scrub any 12-digit Aadhaar-like numbers before anything else
  const piiRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
  const piiScrubbedWarning = piiRegex.test(rawText);
  const safeText = rawText.replace(piiRegex, '[REDACTED-12-DIGIT-ID]');

  const heuristic = fallbackExtractFromText(safeText);
  const ai = getGenAIClient();

  if (!ai) {
    return {
      provider: 'mock-fallback-adapter',
      isMock: true,
      extracted: heuristic,
      piiScrubbedWarning,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Extract structured household profile fields from this citizen description (${lang}): "${safeText}"`,
      config: {
        systemInstruction: `You are a structured data extractor for GovAssist (Tamil Nadu + Central schemes pilot).
Rules:
1. Extract only facts explicitly stated by the user.
2. NEVER infer caste, community category, religion, minority status, or disability from a person's name, village, address, or language.
3. Return null for any numeric field not mentioned, and "unknown" for any enum field not mentioned.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            age: { type: Type.INTEGER, nullable: true },
            district: { type: Type.STRING },
            residenceType: {
              type: Type.STRING,
              enum: ['rural', 'urban', 'unknown'],
            },
            occupation: {
              type: Type.STRING,
              enum: [
                'daily_wage_farm',
                'smallholder_farmer',
                'unorganised_worker',
                'self_employed_micro',
                'salaried_private',
                'government_employee',
                'homemaker_unemployed',
                'student',
                'unknown',
              ],
            },
            maritalVulnerability: {
              type: Type.STRING,
              enum: [
                'widow_single_parent',
                'married',
                'unmarried_single',
                'elderly_destitute',
                'unknown',
              ],
            },
            annualHouseholdIncomeINR: { type: Type.INTEGER, nullable: true },
            childCount: { type: Type.INTEGER },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    const merged: Partial<CitizenProfile> = {
      ...heuristic,
      age: parsed.age ?? heuristic.age ?? null,
      district: parsed.district || heuristic.district || '',
      residenceType:
        parsed.residenceType && parsed.residenceType !== 'unknown'
          ? parsed.residenceType
          : heuristic.residenceType,
      occupation:
        parsed.occupation && parsed.occupation !== 'unknown'
          ? parsed.occupation
          : heuristic.occupation,
      maritalVulnerability:
        parsed.maritalVulnerability && parsed.maritalVulnerability !== 'unknown'
          ? parsed.maritalVulnerability
          : heuristic.maritalVulnerability,
      annualHouseholdIncomeINR:
        parsed.annualHouseholdIncomeINR ?? heuristic.annualHouseholdIncomeINR ?? null,
    };

    return {
      provider: 'gemini-3.8-flash',
      isMock: false,
      extracted: merged,
      piiScrubbedWarning,
    };
  } catch {
    return {
      provider: 'mock-fallback-adapter',
      isMock: true,
      extracted: heuristic,
      piiScrubbedWarning,
    };
  }
}

export async function generatePlainLanguageExplanation(
  profile: CitizenProfile,
  results: SchemeEvaluationResult[],
  lang: LanguageCode
): Promise<PlainLanguageExplanationResult> {
  const counts = {
    appears_eligible: results.filter((r) => r.category === 'appears_eligible').length,
    potentially_eligible: results.filter((r) => r.category === 'potentially_eligible').length,
    missing_documents: results.filter((r) => r.category === 'missing_documents').length,
    requires_verification: results.filter((r) => r.category === 'requires_verification').length,
    not_eligible: results.filter((r) => r.category === 'not_eligible').length,
  };

  const fallbackText =
    lang === 'ta'
      ? `நீங்கள் வழங்கிய விவரங்களின் அடிப்படையில் விதிகள் இயந்திரம் (Deterministic Rules Engine) 5 மாதிரித் திட்டங்களைச் சரிபார்த்துள்ளது: ${counts.appears_eligible} திட்டத்திற்குத் தகுதியுடையவராகத் தெரிகிறது, ${counts.potentially_eligible} திட்டத்திற்குக் கூடுதல் விவரங்கள் தேவை, ${counts.missing_documents} திட்டத்திற்குச் சில ஆவணங்கள் தேவைப்படுகின்றன, மற்றும் ${counts.requires_verification} திட்டத்திற்கு அதிகாரப்பூர்வ கள ஆய்வு தேவை. இது வழிகாட்டுதல் மட்டுமே; அரசுத் துறையே இறுதி முடிவெடுக்கும்.`
      : lang === 'hi'
      ? `आपके द्वारा बताए गए विवरण के आधार पर हमारे नियम इंजन ने 5 नमूना योजनाओं की जांच की है: ${counts.appears_eligible} योजना के लिए आप पात्र प्रतीत होते हैं, ${counts.potentially_eligible} के लिए अतिरिक्त जानकारी आवश्यक है, ${counts.missing_documents} में कुछ दस्तावेज अधूरे हैं, और ${counts.requires_verification} में आधिकारिक सत्यापन आवश्यक है। यह केवल मार्गदर्शन है; अंतिम निर्णय संबंधित सरकारी विभाग लेता है।`
      : `Based on what you told us, our deterministic rules engine checked ${results.length} sample schemes: ${counts.appears_eligible} scheme(s) appear eligible, ${counts.potentially_eligible} need a few more details, ${counts.missing_documents} require specific documents to be obtained first, and ${counts.requires_verification} require official field verification. This is guidance only — the government department always makes the final decision.`;

  const ai = getGenAIClient();
  if (!ai) {
    return {
      provider: 'mock-fallback-adapter',
      isMock: true,
      summaryText: fallbackText,
    };
  }

  try {
    const languageName = lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English';
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Summarize these deterministic scheme evaluation counts in 2 warm, plain sentences in ${languageName}:
District: ${profile.district || 'Tamil Nadu'}, Age: ${profile.age ?? 'Not specified'}
Appears eligible: ${counts.appears_eligible}
Potentially eligible (more details needed): ${counts.potentially_eligible}
Missing documents: ${counts.missing_documents}
Requires official verification: ${counts.requires_verification}
Not eligible based on known rules: ${counts.not_eligible}`,
      config: {
        systemInstruction: `You are a calm, respectful citizen helper for GovAssist.
CRITICAL RULES:
- Never guarantee eligibility or approval. Always use phrasing like "appears eligible based on what you told us".
- Remind the citizen in 1 short clause that this is guidance only and the official department decides.
- Keep it to 2–3 plain sentences in ${languageName}.`,
      },
    });

    const text = response.text?.trim() || fallbackText;
    return {
      provider: 'gemini-3.8-flash',
      isMock: false,
      summaryText: text,
    };
  } catch {
    return {
      provider: 'mock-fallback-adapter',
      isMock: true,
      summaryText: fallbackText,
    };
  }
}
