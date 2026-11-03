export interface TranslationDictionary {
  meta: {
    langName: string;
    shownInEnglishFallback: string;
  };
  common: {
    appName: string;
    independentBadge: string;
    listen: string;
    stopAudio: string;
    clearEverythingNow: string;
    clearedConfirmToast: string;
    needHelp: string;
    liteMode: string;
    liteModeActive: string;
    darkMode: string;
    lightMode: string;
    languageButton: string;
    adminPortal: string;
    citizenView: string;
    back: string;
    next: string;
    skip: string;
    preferNotToSay: string;
    save: string;
    cancel: string;
    edit: string;
    confirm: string;
    samplePlaceholderBanner: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    notGovWarningTitle: string;
    notGovWarningBody: string;
    privacyTitle: string;
    privacyText: string;
    continueAsGuest: string;
    guestSessionNote: string;
    changeLanguage: string;
  };
  inputScreen: {
    stepLabel: string;
    title: string;
    subtitle: string;
    voiceTab: string;
    textTab: string;
    micTapToStart: string;
    micRecording: string;
    micTapToStop: string;
    simulateLowConfidenceBtn: string;
    lowConfidenceWarning: string;
    transcriptLabel: string;
    transcriptConfirmHint: string;
    textPlaceholder: string;
    readPromptAloud: string;
    sampleScenariosLabel: string;
    sample1: string;
    sample2: string;
    sample3: string;
    piiBlockedAlert: string;
    analyzeSituationBtn: string;
    analyzingBtn: string;
  };
  smartProfile: {
    stepLabel: string;
    title: string;
    subtitle: string;
    questionProgress: string;
    whyWeAskLabel: string;
    householdSectionTitle: string;
    householdSectionDesc: string;
    noCategoryCopyRule: string;
    addFamilyMemberBtn: string;
    removeMemberBtn: string;
    proceedToReviewBtn: string;
    questions: {
      age: string;
      district: string;
      residenceType: string;
      occupation: string;
      maritalVulnerability: string;
      annualIncome: string;
      communityCategory: string;
      disabilityStatus: string;
    };
  };
  reviewScreen: {
    stepLabel: string;
    title: string;
    subtitle: string;
    primaryCitizenHeader: string;
    householdMembersHeader: string;
    documentsHeldHeader: string;
    documentsHeldHint: string;
    editFieldBtn: string;
    checkEligibilityBtn: string;
  };
  resultsScreen: {
    stepLabel: string;
    title: string;
    subtitle: string;
    aiExplanationHeader: string;
    deterministicNotice: string;
    categories: {
      appears_eligible: string;
      potentially_eligible: string;
      missing_documents: string;
      requires_verification: string;
      not_eligible: string;
    };
    cardLabels: {
      sampleTag: string;
      benefits: string;
      whyMatches: string;
      whatIsMissing: string;
      requiredDocs: string;
      howToGetDoc: string;
      notConfirmedDept: string;
      appRoutes: string;
      routeOnline: string;
      routeAssisted: string;
      routeOffline: string;
      officialLink: string;
      officialSource: string;
      lastVerified: string;
      nextReviewDue: string;
      reportProblem: string;
      saveScheme: string;
      savedScheme: string;
      guidanceOnlyFooter: string;
    };
    postResultsAccountPromptTitle: string;
    postResultsAccountPromptDesc: string;
    createOptionalAccountBtn: string;
    editProfileAgainBtn: string;
  };
  accountFlow: {
    title: string;
    consentHeading: string;
    consentIntro: string;
    itemSaveSchemes: string;
    itemSaveProfile: string;
    itemSavePrefs: string;
    itemOptInReminders: string;
    phoneLabel: string;
    phonePlaceholder: string;
    noAadhaarNote: string;
    sendOtpBtn: string;
    enterOtpLabel: string;
    mockOtpNotice: string;
    verifyAndSaveBtn: string;
    guestSessionWipedNotice: string;
    myAccountTitle: string;
    downloadDataBtn: string;
    deleteAccountBtn: string;
    consentRecordHeader: string;
  };
  helpModal: {
    title: string;
    noPartnershipDisclaimer: string;
    whereToGoTitle: string;
    whereToGoDesc: string;
    safetyRulesTitle: string;
    safetyRule1: string;
    safetyRule2: string;
    safetyRule3: string;
    closeBtn: string;
  };
  footer: {
    independentDisclaimer: string;
    privacyLink: string;
    contactLink: string;
  };
}

export const enTranslations: TranslationDictionary = {
  meta: {
    langName: 'English',
    shownInEnglishFallback: 'Shown in English (Full translation for this language is being verified)',
  },
  common: {
    appName: 'GovAssist',
    independentBadge: 'Independent Citizen Guide • Not a Government Website',
    listen: 'Listen',
    stopAudio: 'Stop',
    clearEverythingNow: 'Clear everything now',
    clearedConfirmToast: 'All session details and temporary records have been erased.',
    needHelp: 'Need help?',
    liteMode: 'Lite mode',
    liteModeActive: 'Lite mode ON (Low-bandwidth text-first view)',
    darkMode: 'Dark',
    lightMode: 'Light',
    languageButton: 'Language',
    adminPortal: 'Staff Admin',
    citizenView: 'Citizen Guide',
    back: 'Back',
    next: 'Next',
    skip: 'Skip this question',
    preferNotToSay: "I'd rather not say",
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    confirm: 'Confirm',
    samplePlaceholderBanner: 'SAMPLE DATA ONLY: All schemes, rules, and links are fictional placeholders for prototype demonstration.',
  },
  welcome: {
    title: 'Find welfare benefits you may qualify for',
    subtitle: 'Tell us about your household in your own words. We explain schemes in simple language and show how to apply safely.',
    notGovWarningTitle: 'Important: GovAssist is NOT an official government platform',
    notGovWarningBody: 'GovAssist is an independent public-interest assistant. We do not approve applications or represent any government department. Pilot coverage: Tamil Nadu State schemes + Central schemes available to Tamil Nadu residents.',
    privacyTitle: 'Your Privacy & Safety First',
    privacyText: "In Guest Mode we don't save your details after you leave. We never ask for your Aadhaar, bank password, PIN or any OTP. You can skip personal questions. No system is 100% safe, so we keep as little as possible.",
    continueAsGuest: 'Continue as Guest (No Registration)',
    guestSessionNote: 'Guest mode is active by default. Your details stay only in this temporary session.',
    changeLanguage: 'Change Language',
  },
  inputScreen: {
    stepLabel: 'Step 1 of 4 • Describe Your Situation',
    title: 'How would you like to tell us about your situation?',
    subtitle: 'You can speak using your microphone or type in simple words. Switch between Voice and Text at any time.',
    voiceTab: 'Voice (Speak)',
    textTab: 'Text (Type)',
    micTapToStart: 'Tap Microphone to Speak',
    micRecording: 'Listening... Speak clearly now',
    micTapToStop: 'Tap to Finish Recording',
    simulateLowConfidenceBtn: 'Test Low-Confidence Audio',
    lowConfidenceWarning: 'Speech recognition confidence was low (noisy background). Please re-record or edit/type your words below.',
    transcriptLabel: 'Confirm or edit what we heard before continuing:',
    transcriptConfirmHint: 'Please review the text below. Nothing is processed until you confirm.',
    textPlaceholder: 'Example: I am a 38-year-old widow with two school children in Madurai rural area working as a daily wage farm worker...',
    readPromptAloud: 'Read prompt aloud',
    sampleScenariosLabel: 'Try a sample citizen scenario:',
    sample1: 'I am a 38-year-old widow with two school children in rural Madurai, earning ₹75,000 a year as a farm worker.',
    sample2: 'I am a 24-year-old youth in Chennai urban area looking to start a small tailoring shop.',
    sample3: 'We are a rural family in Thanjavur with one college child and annual income of ₹90,000.',
    piiBlockedAlert: 'Safety Protection: It looks like you entered a 12-digit number or PIN. Never share your Aadhaar number, OTP, or bank PIN. We have masked those digits.',
    analyzeSituationBtn: 'Confirm & Continue to Smart Profile',
    analyzingBtn: 'Extracting structured details...',
  },
  smartProfile: {
    stepLabel: 'Step 2 of 4 • Missing & Relevant Questions',
    title: 'Answer a few quick questions',
    subtitle: 'We only ask what is missing and relevant. Sensitive questions can always be skipped.',
    questionProgress: 'Question',
    whyWeAskLabel: 'Why we ask:',
    householdSectionTitle: 'Household & Family Members (Separate Records)',
    householdSectionDesc: 'Add children or dependents separately. We never copy a parent’s community or disability category to a child.',
    noCategoryCopyRule: 'Privacy & Accuracy Rule: Each family member has an independent record. Parent categories are never copied to children.',
    addFamilyMemberBtn: '+ Add Child / Family Member',
    removeMemberBtn: 'Remove',
    proceedToReviewBtn: 'Review All Details',
    questions: {
      age: 'What is your approximate age (in years)?',
      district: 'Which district in Tamil Nadu do you live in?',
      residenceType: 'Do you live in a Rural (Village Panchayat) or Urban (Municipality / Corporation) area?',
      occupation: 'What is your main work or occupation?',
      maritalVulnerability: 'Which of these describes your household situation?',
      annualIncome: 'What is your approximate annual household income?',
      communityCategory: 'Optional Sensitive Question: What is your community certificate category?',
      disabilityStatus: 'Optional Sensitive Question: Do you have a certified disability (40% or more)?',
    },
  },
  reviewScreen: {
    stepLabel: 'Step 3 of 4 • Review & Confirm',
    title: 'Review your details before checking schemes',
    subtitle: 'Check everything below. You can edit any answer or check which documents you already have.',
    primaryCitizenHeader: 'Your Details',
    householdMembersHeader: 'Family Members (Separate Household Records)',
    documentsHeldHeader: 'Documents You Already Have (Optional Check)',
    documentsHeldHint: 'Uncheck any document you do not currently have to see "Missing documents" guidance.',
    editFieldBtn: 'Edit',
    checkEligibilityBtn: 'Confirm & Check Scheme Eligibility',
  },
  resultsScreen: {
    stepLabel: 'Step 4 of 4 • Scheme Guidance Results',
    title: 'Your Scheme Discovery & Guidance Results',
    subtitle: 'Eligibility categories are calculated by a deterministic rules engine over sample data. AI only explains the results.',
    aiExplanationHeader: 'Plain-Language Summary of Your Results',
    deterministicNotice: 'Deterministic Rule Check: Results are never guaranteed. Only the official department decides who receives a benefit.',
    categories: {
      appears_eligible: 'Appears eligible',
      potentially_eligible: 'Potentially eligible, more details needed',
      missing_documents: 'Missing documents or requirements',
      requires_verification: 'Requires official verification',
      not_eligible: 'Not eligible based on known rules',
    },
    cardLabels: {
      sampleTag: 'SAMPLE PLACEHOLDER SCHEME',
      benefits: 'Benefits',
      whyMatches: 'Why it matches your details',
      whatIsMissing: 'What is missing or needs attention',
      requiredDocs: 'Required Documents Checklist',
      howToGetDoc: 'How to get this document',
      notConfirmedDept: 'Not confirmed. Please check with the department.',
      appRoutes: 'How to Apply (Application Routes)',
      routeOnline: 'Online Portal',
      routeAssisted: 'Assisted (e-Sevai / CSC)',
      routeOffline: 'Offline Office',
      officialLink: 'Official Portal Link (Sample)',
      officialSource: 'Official Source Record',
      lastVerified: 'Last Verified',
      nextReviewDue: 'Review Due',
      reportProblem: 'Report a problem',
      saveScheme: 'Save scheme',
      savedScheme: 'Saved',
      guidanceOnlyFooter: 'Guidance only. The department decides who receives a benefit.',
    },
    postResultsAccountPromptTitle: 'Want to save these schemes for later?',
    postResultsAccountPromptDesc: 'You are in Guest Mode. If you leave now, your details are erased. You can optionally create an account using a phone OTP (no Aadhaar) and choose exactly what to save.',
    createOptionalAccountBtn: 'Create Optional Account to Save Schemes',
    editProfileAgainBtn: 'Edit My Details',
  },
  accountFlow: {
    title: 'Optional Account & Consent Control',
    consentHeading: 'Plain-Language Consent: Choose What We Save',
    consentIntro: 'We only save the items you tick below. Upon saving to your account, your temporary guest session store is immediately wiped.',
    itemSaveSchemes: 'Save my bookmarked schemes list',
    itemSaveProfile: 'Save my basic household profile (so I do not have to re-enter it next time)',
    itemSavePrefs: 'Save my language, Voice/Text, and Lite mode preferences',
    itemOptInReminders: 'Opt-in to SMS deadline & document reminders (Placeholder UI only)',
    phoneLabel: 'Mobile Number (For OTP Login — Never enter Aadhaar)',
    phonePlaceholder: '10-digit mobile number',
    noAadhaarNote: 'We never ask for or accept Aadhaar numbers.',
    sendOtpBtn: 'Send Mock OTP',
    enterOtpLabel: 'Enter 6-digit OTP',
    mockOtpNotice: 'PROTOTYPE PLACEHOLDER: Use test OTP 123456. No real SMS is sent.',
    verifyAndSaveBtn: 'Consent, Verify OTP & Save Selected Items',
    guestSessionWipedNotice: 'Temporary guest session store wiped. Only consented items are stored in your account.',
    myAccountTitle: 'My Saved Schemes & Data Controls',
    downloadDataBtn: 'Download My Data (JSON)',
    deleteAccountBtn: 'Delete My Account & All Data Permanently',
    consentRecordHeader: 'Recorded Consent Audit Trail',
  },
  helpModal: {
    title: 'Need Human Help Applying?',
    noPartnershipDisclaimer: 'Important: GovAssist is an independent tool and has NO partnership or affiliation with any government centre, CSC, e-Sevai, or NGO.',
    whereToGoTitle: 'Where you can get in-person assistance in Tamil Nadu:',
    whereToGoDesc: '1. Authorised Tamil Nadu e-Sevai Centres (run by TNeGA, PACCS, or Village Poverty Reduction Committees).\n2. Common Service Centres (CSC).\n3. Taluk Office Citizen Facilitation Desks / Block Development Offices (BDO).',
    safetyRulesTitle: 'Safety Checklist When Visiting Any Centre:',
    safetyRule1: 'Never hand over your ATM PIN, bank password, or personal phone OTP for banking.',
    safetyRule2: 'Always ask for an official printed acknowledgement receipt with a CAN / Application number.',
    safetyRule3: 'Take your original documents back immediately after the operator scans them.',
    closeBtn: 'Close Help Guide',
  },
  footer: {
    independentDisclaimer: 'GovAssist is an independent helper and is not affiliated with any government.',
    privacyLink: 'Privacy & Safety Promise',
    contactLink: 'Feedback & Contact',
  },
};
