import { SchemeRecord } from '../types/govassist';

/**
 * SAMPLE PLACEHOLDER SCHEMES ONLY
 * TODO [PRODUCTION VERIFICATION REQUIRED]:
 * Every scheme below is a clearly-marked fictional/sample placeholder designed to test
 * the 5 deterministic eligibility result categories in the GovAssist prototype.
 * Before any public deployment, replace with verified schemes approved by legal/policy
 * reviewers with confirmed Government Order (G.O.) references and live portal URLs.
 */

export const INITIAL_SAMPLE_SCHEMES: SchemeRecord[] = [
  {
    id: 'scheme-tn-widow-support-sample',
    code: 'TN-SAMPLE-01',
    isSamplePlaceholder: true,
    level: 'State',
    stateCode: 'TN',
    applicableLocations: 'All Districts in Tamil Nadu (Pilot)',
    department: {
      en: '[SAMPLE] Social Welfare & Women Empowerment Department, Tamil Nadu',
      ta: '[மாதிரி] சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை, தமிழ்நாடு',
      hi: '[नमूना] समाज कल्याण एवं महिला अधिकारिता विभाग, तमिलनाडु',
    },
    title: {
      en: '[SAMPLE PLACEHOLDER] Tamil Nadu Widow & Single Mother Monthly Livelihood Pension',
      ta: '[மாதிரித் திட்டம்] தமிழ்நாடு ஆதரவற்ற விதவை மற்றும் தனித்து வாழும் தாய்மார்கள் மாதாந்திர ஓய்வூதியம்',
      hi: '[नमूना योजना] तमिलनाडु विधवा एवं एकल माता मासिक आजीविका पेंशन',
    },
    shortSummary: {
      en: 'Sample placeholder scheme providing monthly financial assistance to widows and single mothers from low-income households in Tamil Nadu.',
      ta: 'தமிழ்நாட்டில் குறைந்த வருமானம் கொண்ட குடும்பங்களைச் சேர்ந்த விதவைகள் மற்றும் தனித்து வாழும் தாய்மார்களுக்கான மாதிரி மாதாந்திர நிதி உதவித் திட்டம்.',
      hi: 'तमिलनाडु में कम आय वाले परिवारों की विधवाओं और एकल माताओं को मासिक वित्तीय सहायता प्रदान करने वाली नमूना योजना।',
    },
    benefits: {
      en: '[SAMPLE BENEFIT] ₹1,200 per month via Direct Benefit Transfer (DBT) + priority ration card inclusion.',
      ta: '[மாதிரிப் பலன்] வங்கி கணக்கில் மாதம் ₹1,200 நேரடி நிதி உதவி + முன்னுரிமை குடும்ப அட்டை சலுகை.',
      hi: '[नमूना लाभ] बैंक खाते में ₹1,200 प्रति माह प्रत्यक्ष लाभ अंतरण + प्राथमिकता राशन कार्ड।',
    },
    rules: [
      {
        id: 'r-101',
        field: 'stateCode',
        operator: 'eq',
        value: 'TN',
        label: {
          en: 'Resident of Tamil Nadu',
          ta: 'தமிழ்நாட்டில் வசிப்பவராக இருக்க வேண்டும்',
          hi: 'तमिलनाडु का निवासी होना चाहिए',
        },
        isSensitive: false,
      },
      {
        id: 'r-102',
        field: 'age',
        operator: 'gte',
        value: 18,
        label: {
          en: 'Applicant age is 18 years or above',
          ta: 'வயது 18 அல்லது அதற்கு மேல் இருக்க வேண்டும்',
          hi: 'आवेदक की आयु 18 वर्ष या उससे अधिक हो',
        },
        isSensitive: false,
      },
      {
        id: 'r-103',
        field: 'maritalVulnerability',
        operator: 'eq',
        value: 'widow_single_parent',
        label: {
          en: 'Status is widow or single mother supporting household',
          ta: 'விதவை அல்லது குடும்பத்தைத் தாங்கும் தனிப் பெற்றோர்',
          hi: 'विधवा या परिवार चलाने वाली एकल माता',
        },
        isSensitive: false,
      },
      {
        id: 'r-104',
        field: 'annualHouseholdIncomeINR',
        operator: 'lte',
        value: 120000,
        label: {
          en: 'Annual household income up to ₹1,20,000',
          ta: 'ஆண்டு குடும்ப வருமானம் ₹1,20,000-க்குள் இருக்க வேண்டும்',
          hi: 'वार्षिक पारिवारिक आय ₹1,20,000 तक',
        },
        isSensitive: false,
      },
    ],
    requiresDepartmentalInspection: false,
    requiredDocuments: [
      {
        id: 'doc_widow_or_death_cert',
        name: {
          en: 'Spouse Death Certificate or Widow Certificate (Sample)',
          ta: 'கணவர் இறப்புச் சான்றிதழ் அல்லது விதவைச் சான்றிதழ் (மாதிரி)',
          hi: 'पति का मृत्यु प्रमाण पत्र या विधवा प्रमाण पत्र (नमूना)',
        },
        isMandatory: true,
        issuingAuthority: 'Taluk Tahsildar / Municipal Corporation / e-Sevai',
        howToGet: {
          en: 'Apply at your nearest Tamil Nadu e-Sevai centre or TNesevai portal with spouse death record and family card. Sample processing time: 7–15 working days.',
          ta: 'அருகிலுள்ள தமிழ்நாடு இ-சேவை மையத்தில் இறப்புச் சான்றிதழ் மற்றும் குடும்ப அட்டையுடன் விண்ணப்பிக்கலாம்.',
          hi: 'पति के मृत्यु प्रमाण पत्र और राशन कार्ड के साथ नजदीकी तमिलनाडु ई-सेवा केंद्र पर आवेदन करें।',
        },
      },
      {
        id: 'doc_family_ration_card',
        name: {
          en: 'Tamil Nadu Smart Family Card (Ration Card) / Address Proof',
          ta: 'தமிழ்நாடு ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு) / முகவரிச் சான்று',
          hi: 'तमिलनाडु स्मार्ट राशन कार्ड / निवास प्रमाण',
        },
        isMandatory: true,
        issuingAuthority: 'Civil Supplies & Consumer Protection Department (TNPDS)',
        howToGet: {
          en: 'Check status or download copy via official TNPDS portal or local Taluk Supply Office.',
          ta: 'TNPDS இணையதளம் அல்லது வட்ட வழங்கல் அலுவலகம் மூலம் நகலைப் பெறலாம்.',
          hi: 'आधिकारिक TNPDS पोर्टल या तालुक आपूर्ति कार्यालय से प्राप्त करें।',
        },
      },
      {
        id: 'doc_bank_passbook',
        name: {
          en: 'Active Bank Passbook Front Page (Never share PIN or password)',
          ta: 'வங்கி கணக்கு புத்தகத்தின் முதல் பக்கம் (PIN அல்லது கடவுச்சொல்லை ஒருபோதும் பகிர வேண்டாம்)',
          hi: 'बैंक पासबुक के प्रथम पृष्ठ की प्रति (कभी भी पिन या पासवर्ड साझा न करें)',
        },
        isMandatory: true,
        issuingAuthority: 'Any Scheduled Bank / Post Office Savings Bank',
        howToGet: null, // Demonstrates "Not confirmed. Please check with the department." when null
      },
    ],
    applicationRoutes: {
      online: {
        available: true,
        portalNameOrCentre: 'Tamil Nadu e-District / TNeGA Citizen Portal [SAMPLE LINK]',
        officialUrl: 'https://www.tnesevai.tn.gov.in/ [SAMPLE-PLACEHOLDER-DO-NOT-SUBMIT]',
        steps: {
          en: [
            'Log in to the official Citizen Portal or visit an authorised e-Sevai operator.',
            'Select Revenue Department > Destitute Widow Pension Scheme (Sample).',
            'Upload scanned copies of Widow Certificate, Family Card, and Bank Passbook page.',
            'Save the acknowledgement receipt number for tracking.',
          ],
          ta: [
            'அதிகாரப்பூர்வ குடிமக்கள் இணையதளத்தில் உள்நுழையவும் அல்லது இ-சேவை மையத்தை அணுகவும்.',
            'வருவாய்த்துறை > ஆதரவற்ற விதவை ஓய்வூதியத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.',
            'விதவைச் சான்றிதழ், குடும்ப அட்டை மற்றும் வங்கி பாஸ்புக் நகலைப் பதிவேற்றவும்.',
            'ஒப்புகைச் சீட்டு எண்ணைப் பாதுகாப்பாக வைத்துக் கொள்ளவும்.',
          ],
          hi: [
            'आधिकारिक नागरिक पोर्टल पर लॉग इन करें या अधिकृत ई-सेवा केंद्र पर जाएं।',
            'राजस्व विभाग > विधवा पेंशन योजना (नमूना) चुनें।',
            'विधवा प्रमाण पत्र, राशन कार्ड और बैंक पासबुक की प्रति अपलोड करें।',
            'पावती रसीद संख्या सुरक्षित रखें।',
          ],
        },
        whatToCarryOrWarnings: {
          en: [
            'WARNING: Never share your bank ATM PIN, OTP, or portal password with any agent.',
            'Official e-Sevai service fee is nominal (typically ₹60); ask for a printed receipt.',
          ],
          ta: [
            'எச்சரிக்கை: வங்கி ATM PIN, OTP அல்லது கடவுச்சொல்லை யாரிடமும் பகிர வேண்டாம்.',
            'இ-சேவை கட்டணத்திற்கு அதிகாரப்பூர்வ ரசீதைக் கேட்டுப் பெறுங்கள்.',
          ],
          hi: [
            'चेतावनी: किसी भी एजेंट के साथ अपना बैंक पिन, ओटीपी या पासवर्ड साझा न करें।',
            'आधिकारिक रसीद अवश्य मांगें।',
          ],
        },
      },
      assisted: {
        available: true,
        portalNameOrCentre: 'Tamil Nadu e-Sevai Centre / Common Service Centre (CSC)',
        steps: {
          en: [
            'Visit your nearest Panchayat Office e-Sevai desk, PACCS, or CSC centre.',
            'Carry original documents for scanning (originals are returned immediately).',
            'Collect the printed CAN (Citizen Access Number) & application receipt.',
          ],
          ta: [
            'அருகிலுள்ள ஊராட்சி அலுவலக இ-சேவை மையம் அல்லது பொது சேவை மையத்திற்குச் செல்லவும்.',
            'அசல் ஆவணங்களை ஸ்கேன் செய்ய எடுத்துச் செல்லவும் (அசல் உடனடியாகத் திருப்பித் தரப்படும்).',
            'CAN எண் மற்றும் அச்சிடப்பட்ட விண்ணப்ப ரசீதைப் பெற்றுக்கொள்ளவும்.',
          ],
          hi: [
            'अपने नजदीकी पंचायत कार्यालय ई-सेवा केंद्र या सीएससी (CSC) पर जाएं।',
            'स्कैनिंग के लिए मूल दस्तावेज साथ ले जाएं (मूल दस्तावेज तुरंत वापस कर दिए जाते हैं)।',
            'मुद्रित पावती रसीद प्राप्त करें।',
          ],
        },
        whatToCarryOrWarnings: {
          en: [
            'Original Death/Widow certificate + 1 photocopy',
            'Smart Family Card + Bank Passbook copy',
            '2 passport-size photographs',
          ],
          ta: [
            'அசல் இறப்பு/விதவைச் சான்றிதழ் + 1 நகல்',
            'ஸ்மார்ட் குடும்ப அட்டை + வங்கி பாஸ்புக் நகல்',
            '2 பாஸ்போர்ட் அளவு புகைப்படங்கள்',
          ],
          hi: [
            'मूल मृत्यु/विधवा प्रमाण पत्र + 1 फोटोकॉपी',
            'स्मार्ट राशन कार्ड + बैंक पासबुक की प्रति',
            '2 पासपोर्ट आकार के फोटो',
          ],
        },
      },
      offline: {
        available: true,
        portalNameOrCentre: 'Taluk Office — Social Security Scheme (SSS) Tahsildar Desk',
        steps: {
          en: [
            'Submit physical petition at the Special Tahsildar (Social Security Schemes) counter at your Taluk Office.',
            'Village Administrative Officer (VAO) and Revenue Inspector (RI) conduct field verification.',
          ],
          ta: [
            'வட்டாட்சியர் அலுவலகத்தில் உள்ள சமூகப் பாதுகாப்புத் திட்ட தனி வட்டாட்சியரிடம் விண்ணப்பத்தை அளிக்கவும்.',
            'கிராம நிர்வாக அலுவலர் (VAO) கள ஆய்வு செய்வார்.',
          ],
          hi: [
            'तालुक कार्यालय में विशेष तहसीलदार (सामाजिक सुरक्षा योजना) काउंटर पर आवेदन जमा करें।',
            'ग्राम प्रशासनिक अधिकारी (VAO) द्वारा सत्यापन किया जाएगा।',
          ],
        },
        whatToCarryOrWarnings: {
          en: ['Signed application form and self-attested copies of required certificates.'],
          ta: ['கையொப்பமிட்ட விண்ணப்பப் படிவம் மற்றும் சான்றிதழ் நகல்கள்.'],
          hi: ['हस्ताक्षरित आवेदन पत्र और प्रमाण पत्रों की स्व-सत्यापित प्रतियां।'],
        },
        contactAsPublished: 'Sample District Collectorate Helpline (Placeholder — Verify with local Taluk Office)',
      },
    },
    officialLink: 'https://www.tn.gov.in/scheme/sample-placeholder-widow-pension',
    officialSourceUrl: 'https://www.tn.gov.in/department/social-welfare-sample-source',
    lastVerifiedDate: '2026-10-15',
    nextReviewDueDate: '2027-01-15',
    verificationStatus: 'verified_sample',
    workflowStatus: 'published',
    lastEditedByStaffId: 'editor@govassist.org',
    lastApprovedByStaffId: 'reviewer@govassist.org',
    updatedAt: '2026-10-15T10:00:00Z',
  },

  {
    id: 'scheme-tn-scholarship-sample',
    code: 'TN-SAMPLE-02',
    isSamplePlaceholder: true,
    level: 'State',
    stateCode: 'TN',
    applicableLocations: 'All Districts in Tamil Nadu (Pilot)',
    department: {
      en: '[SAMPLE] Backward Classes, Most Backward Classes & Minorities Welfare / Adi Dravidar Welfare Dept',
      ta: '[மாதிரி] பிற்படுத்தப்பட்டோர், மிகவும் பிற்படுத்தப்பட்டோர் மற்றும் ஆதிதிராவிடர் நலத்துறை',
      hi: '[नमूना] पिछड़ा वर्ग, अति पिछड़ा वर्ग एवं अल्पसंख्यक कल्याण विभाग, तमिलनाडु',
    },
    title: {
      en: '[SAMPLE PLACEHOLDER] Tamil Nadu School & College Student Educational Grant',
      ta: '[மாதிரித் திட்டம்] தமிழ்நாடு பள்ளி மற்றும் கல்லூரி மாணவர் கல்வி உதவித்தொகை',
      hi: '[नमूना योजना] तमिलनाडु स्कूल एवं कॉलेज छात्र शिक्षा छात्रवृत्ति',
    },
    shortSummary: {
      en: 'Sample scholarship for households with school or college-going children belonging to eligible community categories in Tamil Nadu.',
      ta: 'தமிழ்நாட்டில் பள்ளி அல்லது கல்லூரியில் பயிலும் குழந்தைகளைக் கொண்ட குடும்பங்களுக்கான மாதிரி கல்வி உதவித்தொகை.',
      hi: 'तमिलनाडु में स्कूल या कॉलेज जाने वाले बच्चों वाले परिवारों के लिए नमूना छात्रवृत्ति।',
    },
    benefits: {
      en: '[SAMPLE BENEFIT] ₹4,500 to ₹12,000 annual book and tuition allowance per student child.',
      ta: '[மாதிரிப் பலன்] ஒரு மாணவருக்கு ஆண்டுக்கு ₹4,500 முதல் ₹12,000 வரை கல்வி மற்றும் புத்தக உதவித்தொகை.',
      hi: '[नमूना लाभ] प्रति छात्र ₹4,500 से ₹12,000 वार्षिक पुस्तक एवं शिक्षण भत्ता।',
    },
    rules: [
      {
        id: 'r-201',
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
      {
        id: 'r-202',
        field: 'familyChildCount',
        operator: 'gte',
        value: 1,
        label: {
          en: 'At least 1 child/dependent in household',
          ta: 'குடும்பத்தில் குறைந்தது 1 குழந்தை/மாணவர் இருக்க வேண்டும்',
          hi: 'परिवार में कम से कम 1 बच्चा/छात्र होना चाहिए',
        },
        isSensitive: false,
      },
      {
        id: 'r-203',
        field: 'annualHouseholdIncomeINR',
        operator: 'lte',
        value: 250000,
        label: {
          en: 'Annual family income up to ₹2,50,000',
          ta: 'ஆண்டு குடும்ப வருமானம் ₹2,50,000-க்குள் இருக்க வேண்டும்',
          hi: 'वार्षिक पारिवारिक आय ₹2,50,000 तक',
        },
        isSensitive: false,
      },
      {
        id: 'r-204',
        field: 'communityCategory',
        operator: 'in',
        value: ['obc_bc_mbc', 'sc', 'st'],
        label: {
          en: 'Community certificate in BC / MBC / DNC / SC / ST category',
          ta: 'BC / MBC / DNC / SC / ST சமூகச் சான்றிதழ் பிரிவு',
          hi: 'BC / MBC / SC / ST समुदाय श्रेणी प्रमाण पत्र',
        },
        isSensitive: true,
        whyWeAskNote: {
          en: 'We ask this ONLY because this specific scholarship checks BC/MBC/SC/ST welfare eligibility. You can skip this.',
          ta: 'இந்தக் கல்வி உதவித்தொகை BC/MBC/SC/ST தகுதியைச் சரிபார்ப்பதால் மட்டுமே இதைக் கேட்கிறோம். நீங்கள் இதைத் தவிர்க்கலாம்.',
          hi: 'हम यह केवल इसलिए पूछते हैं क्योंकि यह छात्रवृत्ति BC/MBC/SC/ST पात्रता की जांच करती है। आप इसे छोड़ सकते हैं।',
        },
      },
    ],
    requiresDepartmentalInspection: false,
    requiredDocuments: [
      {
        id: 'doc_community_cert',
        name: {
          en: 'Student Community Certificate (Issued in child’s own name, not parent’s alone)',
          ta: 'மாணவரின் சாதி/சமூகச் சான்றிதழ் (மாணவர் பெயரில் வழங்கப்பட்டது)',
          hi: 'छात्र का समुदाय प्रमाण पत्र (बच्चे के नाम पर जारी)',
        },
        isMandatory: true,
        issuingAuthority: 'Zonal Deputy Tahsildar / Tahsildar via e-Sevai',
        howToGet: {
          en: 'Apply via e-Sevai centre with parent community certificate and child birth certificate.',
          ta: 'பெற்றோரின் சான்றிதழ் மற்றும் குழந்தையின் பிறப்புச் சான்றிதழுடன் இ-சேவை மையத்தில் விண்ணப்பிக்கவும்.',
          hi: 'माता-पिता के प्रमाण पत्र और बच्चे के जन्म प्रमाण पत्र के साथ ई-सेवा केंद्र से आवेदन करें।',
        },
      },
      {
        id: 'doc_school_bonafide',
        name: {
          en: 'School / College Bonafide Attendance Certificate & EMIS ID',
          ta: 'பள்ளி / கல்லூரி படிப்புச் சான்றிதழ் (Bonafide) மற்றும் EMIS எண்',
          hi: 'स्कूल / कॉलेज बोनाफाइड प्रमाण पत्र और EMIS आईडी',
        },
        isMandatory: true,
        issuingAuthority: 'Headmaster / Principal of Institution',
        howToGet: {
          en: 'Request from the school headmaster or college scholarship nodal officer.',
          ta: 'பள்ளித் தலைமை ஆசிரியர் அல்லது கல்லூரி அலுவலகத்தில் கேட்டுப் பெறலாம்.',
          hi: 'स्कूल के प्रधानाध्यापक या कॉलेज कार्यालय से प्राप्त करें।',
        },
      },
    ],
    applicationRoutes: {
      online: {
        available: true,
        portalNameOrCentre: 'Tamil Nadu State Scholarship Portal (SSP) [SAMPLE]',
        officialUrl: 'https://ssp.tn.gov.in/ [SAMPLE-PLACEHOLDER]',
        steps: {
          en: [
            'Check with your child’s school/college if they submit directly via EMIS/UMIS.',
            'Verify student bank account and income/community certificate numbers.',
          ],
          ta: [
            'பள்ளி/கல்லூரி EMIS/UMIS மூலம் நேரடியாகப் பதிவு செய்கிறார்களா என்பதைச் சரிபார்க்கவும்.',
            'மாணவரின் வங்கி கணக்கு மற்றும் சான்றிதழ் எண்களைச் சரிபார்க்கவும்.',
          ],
          hi: [
            'बच्चे के स्कूल/कॉलेज से जांचें कि क्या वे EMIS/UMIS के माध्यम से सीधे आवेदन करते हैं।',
            'छात्र के बैंक खाते और प्रमाण पत्र संख्याओं का सत्यापन करें।',
          ],
        },
        whatToCarryOrWarnings: {
          en: ['Never pay middlemen for scholarship registration; government schools file EMIS scholarships free of cost.'],
          ta: ['அரசுப் பள்ளிகளில் EMIS மூலம் இலவசமாகப் பதிவு செய்யப்படுகிறது; இடைத்தரகர்களுக்குப் பணம் தர வேண்டாம்.'],
          hi: ['सरकारी स्कूलों में छात्रवृत्ति पंजीकरण निःशुल्क होता है; किसी बिचौलिए को पैसे न दें।'],
        },
      },
      assisted: {
        available: true,
        portalNameOrCentre: 'School/College Nodal Helpdesk or e-Sevai Centre',
        steps: {
          en: ['Visit the school office clerk with copies of the child’s certificates.'],
          ta: ['குழந்தையின் சான்றிதழ் நகல்களுடன் பள்ளி அலுவலகத்தை அணுகவும்.'],
          hi: ['बच्चे के प्रमाण पत्रों की प्रतियों के साथ स्कूल कार्यालय से संपर्क करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Child EMIS number, Income Certificate, Community Certificate, Bank Passbook.'],
          ta: ['குழந்தையின் EMIS எண், வருமானச் சான்றிதழ், சமூகச் சான்றிதழ், வங்கி பாஸ்புக்.'],
          hi: ['बच्चे का EMIS नंबर, आय प्रमाण पत्र, समुदाय प्रमाण पत्र, बैंक पासबुक।'],
        },
      },
      offline: {
        available: true,
        portalNameOrCentre: 'District Backward Classes / Adi Dravidar Welfare Office',
        steps: {
          en: ['Submit institutional verification form signed by Head of Institution.'],
          ta: ['பள்ளி/கல்லூரி முதல்வர் கையொப்பமிட்ட படிவத்தை மாவட்ட நல அலுவலகத்தில் சமர்ப்பிக்கவும்.'],
          hi: ['संस्था प्रमुख द्वारा हस्ताक्षरित फॉर्म जिला कल्याण कार्यालय में जमा करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Not confirmed for direct individual walk-in without school endorsement. Please check with the department.'],
          ta: ['பள்ளி பரிந்துரை இல்லாமல் நேரடியாக விண்ணப்பிப்பது உறுதிப்படுத்தப்படவில்லை. துறையுடன் சரிபார்க்கவும்.'],
          hi: ['स्कूल की अनुशंसा के बिना सीधा आवेदन पुष्ट नहीं है। कृपया विभाग से जांच करें।'],
        },
      },
    },
    officialLink: 'https://www.bcmbcmw.tn.gov.in/sample-scholarship',
    officialSourceUrl: 'https://www.tn.gov.in/scheme/sample-student-scholarship',
    lastVerifiedDate: '2026-09-20',
    nextReviewDueDate: '2026-12-20',
    verificationStatus: 'verified_sample',
    workflowStatus: 'published',
    lastEditedByStaffId: 'editor@govassist.org',
    lastApprovedByStaffId: 'reviewer@govassist.org',
    updatedAt: '2026-09-20T09:30:00Z',
  },

  {
    id: 'scheme-tn-children-fd-sample',
    code: 'TN-SAMPLE-03',
    isSamplePlaceholder: true,
    level: 'State',
    stateCode: 'TN',
    applicableLocations: 'All Districts in Tamil Nadu (Pilot)',
    department: {
      en: '[SAMPLE] Social Welfare & Child Development Directorate, Tamil Nadu',
      ta: '[மாதிரி] சமூக நலன் மற்றும் குழந்தைகள் வளர்ச்சி இயக்ககம், தமிழ்நாடு',
      hi: '[नमूना] समाज कल्याण एवं बाल विकास निदेशालय, तमिलनाडु',
    },
    title: {
      en: '[SAMPLE PLACEHOLDER] Children Higher Education Security Deposit & Nutrition Support',
      ta: '[மாதிரித் திட்டம்] குழந்தைகள் உயர்கல்வி பாதுகாப்பு வைப்புத்தொகை மற்றும் ஊட்டச்சத்து ஆதரவு',
      hi: '[नमूना योजना] बाल उच्च शिक्षा सुरक्षा जमा एवं पोषण सहायता',
    },
    shortSummary: {
      en: 'Sample scheme for low-income Tamil Nadu families with children, requiring a recent Tahsildar Income Certificate and Children Birth Certificates.',
      ta: 'குழந்தைகள் உள்ள குறைந்த வருமானக் குடும்பங்களுக்கான மாதிரித் திட்டம். இதற்கு வட்டாட்சியர் வருமானச் சான்றிதழ் மற்றும் பிறப்புச் சான்றிதழ்கள் தேவை.',
      hi: 'बच्चों वाले कम आय वाले परिवारों के लिए नमूना योजना, जिसके लिए तहसीलदार आय प्रमाण पत्र और जन्म प्रमाण पत्र आवश्यक हैं।',
    },
    benefits: {
      en: '[SAMPLE BENEFIT] ₹25,000 maturity fixed deposit per child + annual study kit grant.',
      ta: '[மாதிரிப் பலன்] ஒரு குழந்தைக்கு ₹25,000 கல்வி வைப்புத்தொகை + ஆண்டு கல்வி உபகரண உதவி.',
      hi: '[नमूना लाभ] प्रति बच्चा ₹25,000 सावधि जमा + वार्षिक अध्ययन किट अनुदान।',
    },
    rules: [
      {
        id: 'r-301',
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
      {
        id: 'r-302',
        field: 'familyChildCount',
        operator: 'gte',
        value: 1,
        label: {
          en: 'Has 1 or more children in the household',
          ta: 'குடும்பத்தில் 1 அல்லது அதற்கு மேற்பட்ட குழந்தைகள் உள்ளனர்',
          hi: 'परिवार में 1 या अधिक बच्चे हैं',
        },
        isSensitive: false,
      },
      {
        id: 'r-303',
        field: 'annualHouseholdIncomeINR',
        operator: 'lte',
        value: 120000,
        label: {
          en: 'Annual household income up to ₹1,20,000',
          ta: 'ஆண்டு குடும்ப வருமானம் ₹1,20,000-க்குள் இருக்க வேண்டும்',
          hi: 'वार्षिक पारिवारिक आय ₹1,20,000 तक',
        },
        isSensitive: false,
      },
    ],
    requiresDepartmentalInspection: false,
    requiredDocuments: [
      {
        id: 'doc_tahsildar_income_cert',
        name: {
          en: 'Recent Annual Income Certificate (Issued within last 12 months by Tahsildar)',
          ta: 'புதிய வருமானச் சான்றிதழ் (கடந்த 12 மாதங்களுக்குள் வட்டாட்சியரால் வழங்கப்பட்டது)',
          hi: 'नवीनतम वार्षिक आय प्रमाण पत्र (पिछले 12 महीनों के भीतर तहसीलदार द्वारा जारी)',
        },
        isMandatory: true,
        issuingAuthority: 'Taluk Tahsildar / Zonal Deputy Tahsildar via e-Sevai',
        howToGet: {
          en: 'Visit any e-Sevai centre with your Smart Family Card and self-declaration of wages. Fee: ₹60.',
          ta: 'ஸ்மார்ட் குடும்ப அட்டை மற்றும் சுய அறிவிப்புடன் அருகிலுள்ள இ-சேவை மையத்தில் விண்ணப்பிக்கவும். கட்டணம்: ₹60.',
          hi: 'स्मार्ट राशन कार्ड और स्व-घोषणा के साथ किसी भी ई-सेवा केंद्र पर जाएं। शुल्क: ₹60।',
        },
      },
      {
        id: 'doc_children_birth_certs',
        name: {
          en: 'Official Birth Certificates of Dependent Children',
          ta: 'குழந்தைகளின் அதிகாரப்பூர்வ பிறப்புச் சான்றிதழ்கள்',
          hi: 'बच्चों के आधिकारिक जन्म प्रमाण पत्र',
        },
        isMandatory: true,
        issuingAuthority: 'Greater Corporation / Municipality / Town Panchayat / CRSTN',
        howToGet: {
          en: 'Download digitally signed copy from Civil Registration System (CRS Tamil Nadu) or local municipal birth registrar.',
          ta: 'பிறப்பு மற்றும் இறப்பு பதிவு இணையதளம் (CRS Tamil Nadu) அல்லது நகராட்சி அலுவலகத்தில் பெறலாம்.',
          hi: 'सिविल रजिस्ट्रेशन सिस्टम (CRS तमिलनाडु) या स्थानीय नगर पालिका से प्राप्त करें।',
        },
      },
    ],
    applicationRoutes: {
      online: {
        available: false,
        steps: {
          en: ['Direct self-service online submission is not confirmed. Applications are filed via e-Sevai or Child Development Project Officer (CDPO).'],
          ta: ['நேரடி ஆன்லைன் விண்ணப்பம் உறுதிப்படுத்தப்படவில்லை. இ-சேவை மையம் அல்லது குழந்தைகள் வளர்ச்சித் திட்ட அலுவலர் (CDPO) மூலம் விண்ணப்பிக்கவும்.'],
          hi: ['सीधे ऑनलाइन आवेदन की पुष्टि नहीं है। ई-सेवा केंद्र या बाल विकास परियोजना अधिकारी (CDPO) के माध्यम से आवेदन करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Not confirmed for home self-upload. Please check with the department.'],
          ta: ['வீட்டிலிருந்தே பதிவேற்றுவது உறுதிப்படுத்தப்படவில்லை. துறையுடன் சரிபார்க்கவும்.'],
          hi: ['घर से स्वयं अपलोड करने की पुष्टि नहीं है। कृपया विभाग से जांच करें।'],
        },
      },
      assisted: {
        available: true,
        portalNameOrCentre: 'e-Sevai Centre / Local Anganwadi or CDPO Office',
        steps: {
          en: [
            'Obtain the Tahsildar Income Certificate first.',
            'Submit the application through an e-Sevai centre or Block Child Development Project Officer (CDPO).',
          ],
          ta: [
            'முதலில் வட்டாட்சியர் வருமானச் சான்றிதழைப் பெறவும்.',
            'இ-சேவை மையம் அல்லது வட்டார குழந்தைகள் வளர்ச்சித் திட்ட அலுவலர் (CDPO) மூலம் விண்ணப்பிக்கவும்.',
          ],
          hi: [
            'पहले तहसीलदार आय प्रमाण पत्र प्राप्त करें।',
            'ई-सेवा केंद्र या ब्लॉक बाल विकास परियोजना अधिकारी (CDPO) के माध्यम से आवेदन जमा करें।',
          ],
        },
        whatToCarryOrWarnings: {
          en: ['Income Certificate, Children Birth Certificates, Smart Family Card.'],
          ta: ['வருமானச் சான்றிதழ், குழந்தைகளின் பிறப்புச் சான்றிதழ்கள், குடும்ப அட்டை.'],
          hi: ['आय प्रमाण पत्र, बच्चों के जन्म प्रमाण पत्र, स्मार्ट राशन कार्ड।'],
        },
      },
      offline: {
        available: true,
        portalNameOrCentre: 'Block Child Development Project Office (ICDS / Social Welfare)',
        steps: {
          en: ['Meet the Mukhya Sevika / Extension Officer (Social Welfare) at your Panchayat Union (Block) office.'],
          ta: ['ஊராட்சி ஒன்றிய அலுவலகத்தில் உள்ள சமூக நல விரிவாக்க அலுவலரை அணுகவும்.'],
          hi: ['अपने पंचायत संघ (ब्लॉक) कार्यालय में समाज कल्याण विस्तार अधिकारी से मिलें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Carry originals and 2 sets of photocopies.'],
          ta: ['அசல் மற்றும் 2 நகல் தொகுப்புகளை எடுத்துச் செல்லவும்.'],
          hi: ['मूल दस्तावेज और फोटोकॉपी के 2 सेट साथ रखें।'],
        },
      },
    },
    officialLink: 'https://www.tnsocialwelfare.tn.gov.in/sample-child-deposit',
    officialSourceUrl: 'https://www.tnsocialwelfare.tn.gov.in/en/sample-verification-doc',
    lastVerifiedDate: '2026-08-10',
    nextReviewDueDate: '2026-11-15',
    verificationStatus: 'review_due_soon',
    workflowStatus: 'published',
    lastEditedByStaffId: 'editor@govassist.org',
    lastApprovedByStaffId: 'reviewer@govassist.org',
    updatedAt: '2026-08-10T14:20:00Z',
  },

  {
    id: 'scheme-central-rural-housing-sample',
    code: 'CENTRAL-SAMPLE-04',
    isSamplePlaceholder: true,
    level: 'Central',
    stateCode: 'ALL_INDIA',
    applicableLocations: 'All States (Rural Panchayats in Tamil Nadu included)',
    department: {
      en: '[SAMPLE] Ministry of Rural Development (Implemented via TN Rural Development & Panchayat Raj)',
      ta: '[மாதிரி] மத்திய ஊரக வளர்ச்சி அமைச்சகம் (தமிழ்நாடு ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை மூலம்)',
      hi: '[नमूना] ग्रामीण विकास मंत्रालय (तमिलनाडु ग्रामीण विकास एवं पंचायत राज द्वारा क्रियान्वित)',
    },
    title: {
      en: '[SAMPLE PLACEHOLDER] Central Rural Homestead & Pucca House Construction Grant',
      ta: '[மாதிரித் திட்டம்] மத்திய ஊரக வீடு கட்டும் மானியம் மற்றும் குடியிருப்பு மேம்பாட்டுத் திட்டம்',
      hi: '[नमूना योजना] केंद्रीय ग्रामीण पक्का आवास निर्माण अनुदान योजना',
    },
    shortSummary: {
      en: 'Sample Central-plus-State housing assistance for rural agricultural and unorganised workers. Requires Gram Sabha priority list verification and site inspection.',
      ta: 'கிராமப்புற விவசாய மற்றும் அமைப்புசாரா தொழிலாளர்களுக்கான மாதிரி வீட்டு வசதித் திட்டம். கிராம சபை ஒப்புதல் மற்றும் கள ஆய்வு அவசியம்.',
      hi: 'ग्रामीण कृषि और असंगठित श्रमिकों के लिए नमूना आवास सहायता। ग्राम सभा सूची सत्यापन और स्थल निरीक्षण आवश्यक है।',
    },
    benefits: {
      en: '[SAMPLE BENEFIT] Housing construction grant in 3 stage-inspected instalments + 90 days MGNREGS wage support.',
      ta: '[மாதிரிப் பலன்] 3 தவணைகளில் வீடு கட்டும் மானியம் + 90 நாட்கள் ஊரக வேலைவாய்ப்பு கூலி உதவி.',
      hi: '[नमूना लाभ] 3 किस्तों में आवास निर्माण अनुदान + 90 दिनों की मनरेगा मजदूरी सहायता।',
    },
    rules: [
      {
        id: 'r-401',
        field: 'residenceType',
        operator: 'eq',
        value: 'rural',
        label: {
          en: 'Resides in a Rural Village Panchayat area',
          ta: 'கிராம ஊராட்சிப் பகுதியில் வசிப்பவராக இருக்க வேண்டும்',
          hi: 'ग्रामीण ग्राम पंचायत क्षेत्र का निवासी होना चाहिए',
        },
        isSensitive: false,
      },
      {
        id: 'r-402',
        field: 'annualHouseholdIncomeINR',
        operator: 'lte',
        value: 150000,
        label: {
          en: 'Annual household income up to ₹1,50,000',
          ta: 'ஆண்டு குடும்ப வருமானம் ₹1,50,000-க்குள் இருக்க வேண்டும்',
          hi: 'वार्षिक पारिवारिक आय ₹1,50,000 तक',
        },
        isSensitive: false,
      },
      {
        id: 'r-403',
        field: 'occupation',
        operator: 'in',
        value: ['daily_wage_farm', 'smallholder_farmer', 'unorganised_worker', 'homemaker_unemployed'],
        label: {
          en: 'Occupation is farm labour, smallholder farmer, unorganised worker, or homemaker',
          ta: 'விவசாயக் கூலி, சிறு விவசாயி, அமைப்புசாரா தொழிலாளி அல்லது இல்லத்தரசி',
          hi: 'कृषि श्रमिक, छोटे किसान, असंगठित श्रमिक या गृहिणी',
        },
        isSensitive: false,
      },
    ],
    requiresDepartmentalInspection: true,
    inspectionNote: {
      en: 'Requires official field verification by the Village Panchayat Secretary, Block Development Officer (BDO), and Gram Sabha beneficiary list approval.',
      ta: 'கிராம ஊராட்சிச் செயலாளர், வட்டார வளர்ச்சி அலுவலர் (BDO) நேரில் கள ஆய்வு மற்றும் கிராம சபை ஒப்புதல் அவசியம்.',
      hi: 'ग्राम पंचायत सचिव, खंड विकास अधिकारी (BDO) द्वारा स्थल निरीक्षण और ग्राम सभा की मंजूरी आवश्यक है।',
    },
    requiredDocuments: [
      {
        id: 'doc_family_ration_card',
        name: {
          en: 'Tamil Nadu Smart Family Card (Ration Card) / Address Proof',
          ta: 'தமிழ்நாடு ஸ்மார்ட் குடும்ப அட்டை (ரேஷன் கார்டு) / முகவரிச் சான்று',
          hi: 'तमिलनाडु स्मार्ट राशन कार्ड / निवास प्रमाण',
        },
        isMandatory: true,
        issuingAuthority: 'TNPDS',
        howToGet: {
          en: 'Available via TNPDS or Taluk Supply Office.',
          ta: 'TNPDS அல்லது வட்ட வழங்கல் அலுவலகத்தில் பெறலாம்.',
          hi: 'TNPDS या तालुक आपूर्ति कार्यालय से उपलब्ध।',
        },
      },
      {
        id: 'doc_bank_passbook',
        name: {
          en: 'Active Bank Passbook Front Page (Never share PIN or password)',
          ta: 'வங்கி கணக்கு புத்தகத்தின் முதல் பக்கம் (PIN பகிர வேண்டாம்)',
          hi: 'बैंक पासबुक के प्रथम पृष्ठ की प्रति (पिन साझा न करें)',
        },
        isMandatory: true,
        issuingAuthority: 'Bank / Post Office',
        howToGet: null,
      },
    ],
    applicationRoutes: {
      online: {
        available: false,
        steps: {
          en: ['Not confirmed for direct home application. Housing beneficiary selection requires Gram Sabha and Block Office field verification.'],
          ta: ['வீட்டிலிருந்தே ஆன்லைனில் விண்ணப்பிக்க முடியாது. கிராம சபை மற்றும் வட்டார வளர்ச்சி அலுவலக கள ஆய்வு மூலம் மட்டுமே தேர்வு செய்யப்படும்.'],
          hi: ['घर से सीधे ऑनलाइन आवेदन उपलब्ध नहीं है। ग्राम सभा और ब्लॉक कार्यालय द्वारा स्थल सत्यापन आवश्यक है।'],
        },
        whatToCarryOrWarnings: {
          en: ['Beware of fake websites promising instant housing allotment for a fee.'],
          ta: ['பணம் கட்டி உடனடியாக வீடு ஒதுக்குவதாகக் கூறும் போலி இணையதளங்களை நம்ப வேண்டாம்.'],
          hi: ['शुल्क लेकर तुरंत मकान दिलाने का दावा करने वाली फर्जी वेबसाइटों से सावधान रहें।'],
        },
      },
      assisted: {
        available: true,
        portalNameOrCentre: 'Village Panchayat Helpdesk / e-Sevai Centre',
        steps: {
          en: ['Check the published Gram Sabha waiting list at your Village Panchayat office.'],
          ta: ['கிராம ஊராட்சி அலுவலகத்தில் வெளியிடப்பட்டுள்ள காத்திருப்போர் பட்டியலைச் சரிபார்க்கவும்.'],
          hi: ['अपने ग्राम पंचायत कार्यालय में प्रकाशित ग्राम सभा प्रतीक्षा सूची की जांच करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Family Card, MGNREGS Job Card (if held), House site Patta / Natham document.'],
          ta: ['குடும்ப அட்டை, 100 நாள் வேலை அட்டை (இருந்தால்), வீட்டு மனை பட்டா ஆவணம்.'],
          hi: ['राशन कार्ड, मनरेगा जॉब कार्ड (यदि हो), आवासीय पट्टा दस्तावेज।'],
        },
      },
      offline: {
        available: true,
        portalNameOrCentre: 'Block Development Office (BDO - Village Panchayats)',
        steps: {
          en: [
            'Submit written petition during Gram Sabha meeting or at the Block Development Office (BDO).',
            'Block Overseer inspects current dwelling condition and geo-tags site.',
          ],
          ta: [
            'கிராம சபைக் கூட்டத்தில் அல்லது வட்டார வளர்ச்சி அலுவலகத்தில் (BDO) மனு அளிக்கவும்.',
            'ஒன்றிய பணி மேற்பார்வையாளர் நேரில் வந்து தற்போதைய வீட்டின் நிலையை ஆய்வு செய்வார்.',
          ],
          hi: [
            'ग्राम सभा की बैठक में या खंड विकास कार्यालय (BDO) में लिखित आवेदन दें।',
            'ब्लॉक ओवरसियर वर्तमान आवास की स्थिति का निरीक्षण करेंगे।',
          ],
        },
        whatToCarryOrWarnings: {
          en: ['Take written acknowledgement receipt from Panchayat Union office.'],
          ta: ['ஊராட்சி ஒன்றிய அலுவலகத்தில் ஒப்புகைச் சீட்டு பெறவும்.'],
          hi: ['पंचायत संघ कार्यालय से लिखित पावती रसीद लें।'],
        },
      },
    },
    officialLink: 'https://tnrd.tn.gov.in/sample-rural-housing',
    officialSourceUrl: 'https://rural.gov.in/sample-housing-guidelines',
    lastVerifiedDate: '2026-10-01',
    nextReviewDueDate: '2027-02-01',
    verificationStatus: 'verified_sample',
    workflowStatus: 'published',
    lastEditedByStaffId: 'editor@govassist.org',
    lastApprovedByStaffId: 'reviewer@govassist.org',
    updatedAt: '2026-10-01T11:00:00Z',
  },

  {
    id: 'scheme-tn-urban-youth-sample',
    code: 'TN-SAMPLE-05',
    isSamplePlaceholder: true,
    level: 'State',
    stateCode: 'TN',
    applicableLocations: 'Urban Corporations & Municipalities in Tamil Nadu',
    department: {
      en: '[SAMPLE] Micro, Small and Medium Enterprises (MSME) & Urban Livelihoods Mission, TN',
      ta: '[மாதிரி] குறு, சிறு மற்றும் நடுத்தரத் தொழில் நிறுவனங்கள் மற்றும் நகர்ப்புற வாழ்வாதார இயக்கம்',
      hi: '[नमूना] सूक्ष्म, लघु और मध्यम उद्यम (MSME) एवं शहरी आजीविका मिशन, तमिलनाडु',
    },
    title: {
      en: '[SAMPLE PLACEHOLDER] Urban Youth First-Time Micro-Enterprise Seed Subsidy (Ages 18–30)',
      ta: '[மாதிரித் திட்டம்] நகர்ப்புற இளைஞர் முதல் தலைமுறை சிறு தொழில் மானியம் (வயது 18–30)',
      hi: '[नमूना योजना] शहरी युवा प्रथम सूक्ष्म-उद्यम बीज सब्सिडी (आयु 18–30 वर्ष)',
    },
    shortSummary: {
      en: 'Sample subsidy strictly for young urban residents aged 18 to 30 setting up a new service or retail micro-enterprise.',
      ta: 'நகர்ப்புறப் பகுதிகளில் வசிக்கும் 18 முதல் 30 வயதுக்குட்பட்ட இளைஞர்கள் புதிய சிறு தொழில் தொடங்குவதற்கான மாதிரி மானியத் திட்டம்.',
      hi: 'नया सूक्ष्म उद्यम स्थापित करने वाले 18 से 30 वर्ष की आयु के शहरी युवाओं के लिए नमूना सब्सिडी योजना।',
    },
    benefits: {
      en: '[SAMPLE BENEFIT] 25% capital subsidy up to ₹50,000 on bank-sanctioned micro-business loans.',
      ta: '[மாதிரிப் பலன்] வங்கி வழங்கும் சிறு தொழில் கடனில் 25% (அதிகபட்சம் ₹50,000) மூலதன மானியம்.',
      hi: '[नमूना लाभ] बैंक द्वारा स्वीकृत सूक्ष्म व्यवसाय ऋण पर 25% (अधिकतम ₹50,000) पूंजी सब्सिडी।',
    },
    rules: [
      {
        id: 'r-501',
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
      {
        id: 'r-502',
        field: 'residenceType',
        operator: 'eq',
        value: 'urban',
        label: {
          en: 'Must reside in an Urban Municipality or Corporation area',
          ta: 'நகராட்சி அல்லது மாநகராட்சி (நகர்ப்புற) பகுதியில் வசிப்பவராக இருக்க வேண்டும்',
          hi: 'शहरी नगर पालिका या निगम क्षेत्र का निवासी होना चाहिए',
        },
        isSensitive: false,
      },
      {
        id: 'r-503',
        field: 'age',
        operator: 'lte',
        value: 30,
        label: {
          en: 'Applicant age must be 30 years or younger',
          ta: 'விண்ணப்பதாரரின் வயது 30 அல்லது அதற்குக் குறைவாக இருக்க வேண்டும்',
          hi: 'आवेदक की आयु 30 वर्ष या उससे कम होनी चाहिए',
        },
        isSensitive: false,
      },
      {
        id: 'r-504',
        field: 'age',
        operator: 'gte',
        value: 18,
        label: {
          en: 'Applicant age must be at least 18 years',
          ta: 'குறைந்தபட்ச வயது 18 ஆக இருக்க வேண்டும்',
          hi: 'आवेदक की आयु कम से कम 18 वर्ष होनी चाहिए',
        },
        isSensitive: false,
      },
    ],
    requiresDepartmentalInspection: true,
    inspectionNote: {
      en: 'District Industries Centre (DIC) General Manager taskforce committee interview and bank viability appraisal required.',
      ta: 'மாவட்டத் தொழில் மையம் (DIC) நேர்காணல் மற்றும் வங்கி கடன் தகுதி ஆய்வு அவசியம்.',
      hi: 'जिला उद्योग केंद्र (DIC) समिति साक्षात्कार और बैंक मूल्यांकन आवश्यक है।',
    },
    requiredDocuments: [
      {
        id: 'doc_project_report',
        name: {
          en: 'Simple Micro-Business Quotation & Project Proposal',
          ta: 'சிறு தொழில் திட்ட அறிக்கை மற்றும் விலைப்புள்ளி (Quotation)',
          hi: 'सूक्ष्म व्यवसाय कोटेशन और परियोजना प्रस्ताव',
        },
        isMandatory: true,
        issuingAuthority: 'Prepared by Applicant / EDP Helpdesk',
        howToGet: {
          en: 'District Industries Centre (DIC) offers free sample project profiles for small trades.',
          ta: 'மாவட்டத் தொழில் மையத்தில் (DIC) இலவச மாதிரித் திட்ட அறிக்கைகளைப் பெறலாம்.',
          hi: 'जिला उद्योग केंद्र (DIC) छोटे व्यवसायों के लिए निःशुल्क नमूना परियोजना प्रोफ़ाइल प्रदान करता है।',
        },
      },
    ],
    applicationRoutes: {
      online: {
        available: true,
        portalNameOrCentre: 'MSME Tamil Nadu Loan Application Portal [SAMPLE]',
        officialUrl: 'https://msmeonline.tn.gov.in/ [SAMPLE-PLACEHOLDER]',
        steps: {
          en: ['Register applicant profile and upload quotation and urban residence certificate.'],
          ta: ['விண்ணப்பதாரர் விவரங்களைப் பதிவு செய்து விலைப்புள்ளி மற்றும் முகவரிச் சான்றைப் பதிவேற்றவும்.'],
          hi: ['आवेदक प्रोफ़ाइल पंजीकृत करें और कोटेशन तथा शहरी निवास प्रमाण अपलोड करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Bank sanction is subject to credit appraisal; subsidy is released only after loan disbursement.'],
          ta: ['வங்கி கடன் ஒப்புதலுக்குப் பிறகே மானியம் வழங்கப்படும்.'],
          hi: ['बैंक ऋण स्वीकृति के बाद ही सब्सिडी जारी की जाती है।'],
        },
      },
      assisted: {
        available: true,
        portalNameOrCentre: 'District Industries Centre (DIC) Helpdesk / e-Sevai',
        steps: {
          en: ['Visit the District Industries Centre (DIC) in your district headquarters for free guidance.'],
          ta: ['மாவட்டத் தலைநகரில் உள்ள மாவட்டத் தொழில் மையத்தை (DIC) நேரில் அணுகவும்.'],
          hi: ['निःशुल्क मार्गदर्शन के लिए अपने जिला मुख्यालय में जिला उद्योग केंद्र (DIC) पर जाएं।'],
        },
        whatToCarryOrWarnings: {
          en: ['Educational / Age proof, Urban Family Card, Project Quotation.'],
          ta: ['வயதுச் சான்று, குடும்ப அட்டை, தொழில் விலைப்புள்ளி.'],
          hi: ['आयु प्रमाण, राशन कार्ड, प्रोजेक्ट कोटेशन।'],
        },
      },
      offline: {
        available: true,
        portalNameOrCentre: 'General Manager, District Industries Centre (DIC)',
        steps: {
          en: ['Attend the Monday grievance/entrepreneurship guidance desk at the DIC office.'],
          ta: ['மாவட்டத் தொழில் மையத்தில் நடைபெறும் தொழில் வழிகாட்டுதல் முகாமில் கலந்து கொள்ளவும்.'],
          hi: ['DIC कार्यालय में उद्यमिता मार्गदर्शन डेस्क पर संपर्क करें।'],
        },
        whatToCarryOrWarnings: {
          en: ['Carry original age proof and urban address proof.'],
          ta: ['அசல் வயதுச் சான்று மற்றும் முகவரிச் சான்றை எடுத்துச் செல்லவும்.'],
          hi: ['मूल आयु प्रमाण और शहरी पता प्रमाण साथ लाएं।'],
        },
      },
    },
    officialLink: 'https://msmeonline.tn.gov.in/sample-urban-youth',
    officialSourceUrl: 'https://www.tn.gov.in/department/msme-sample-source',
    lastVerifiedDate: '2025-11-01',
    nextReviewDueDate: '2026-05-01', // Demonstrates an expired/outdated review date in Admin Dashboard!
    verificationStatus: 'expired_outdated',
    workflowStatus: 'published',
    lastEditedByStaffId: 'editor@govassist.org',
    lastApprovedByStaffId: 'reviewer@govassist.org',
    updatedAt: '2025-11-01T08:00:00Z',
  },
];
