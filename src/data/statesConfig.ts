/**
 * State and District Configuration Module
 * Kept separate from UI code so GovAssist can expand from the Tamil Nadu + Central pilot
 * to additional Indian states without modifying UI components.
 */

export interface StateConfig {
  code: string;
  name: {
    en: string;
    ta: string;
    hi: string;
  };
  isPilotActive: boolean;
  assistedCentreName: {
    en: string;
    ta: string;
    hi: string;
  };
  districts: {
    id: string;
    en: string;
    ta: string;
    hi: string;
  }[];
}

export const STATES_CONFIG: StateConfig[] = [
  {
    code: 'TN',
    name: {
      en: 'Tamil Nadu (Active Pilot)',
      ta: 'தமிழ்நாடு (முன்னோடித் திட்டம்)',
      hi: 'तमिलनाडु (पायलट राज्य)',
    },
    isPilotActive: true,
    assistedCentreName: {
      en: 'Tamil Nadu e-Sevai / TNeGA Authorised Citizen Service Centre & CSC',
      ta: 'தமிழ்நாடு இ-சேவை மையம் (TNeGA) மற்றும் பொது சேவை மையம் (CSC)',
      hi: 'तमिलनाडु ई-सेवा केंद्र (TNeGA) और कॉमन सर्विस सेंटर (CSC)',
    },
    districts: [
      { id: 'Madurai', en: 'Madurai', ta: 'மதுரை', hi: 'मदुरै' },
      { id: 'Chennai', en: 'Chennai', ta: 'சென்னை', hi: 'चेन्नई' },
      { id: 'Coimbatore', en: 'Coimbatore', ta: 'கோயம்புத்தூர்', hi: 'कोयंबटूर' },
      { id: 'Tiruchirappalli', en: 'Tiruchirappalli', ta: 'திருச்சிராப்பள்ளி', hi: 'तिरुचिरापल्ली' },
      { id: 'Salem', en: 'Salem', ta: 'சேலம்', hi: 'सेलम' },
      { id: 'Tirunelveli', en: 'Tirunelveli', ta: 'திருநெல்வேலி', hi: 'तिरुनेलवेली' },
      { id: 'Thanjavur', en: 'Thanjavur', ta: 'தஞ்சாவூர்', hi: 'तंजावुर' },
      { id: 'Erode', en: 'Erode', ta: 'ஈரோடு', hi: 'इरोड' },
      { id: 'Vellore', en: 'Vellore', ta: 'வேலூர்', hi: 'वेल्लोर' },
      { id: 'Thoothukudi', en: 'Thoothukudi', ta: 'தூத்துக்குடி', hi: 'तूतीकोरिन' },
      { id: 'Kanyakumari', en: 'Kanyakumari', ta: 'கன்னியாகுமரி', hi: 'कन्याकुमारी' },
      { id: 'Dindigul', en: 'Dindigul', ta: 'திண்டுக்கல்', hi: 'डिंडीगुल' },
      { id: 'Other_TN', en: 'Other District in Tamil Nadu', ta: 'தமிழ்நாட்டின் பிற மாவட்டம்', hi: 'तमिलनाडु का अन्य जिला' },
    ],
  },
  {
    code: 'KA',
    name: {
      en: 'Karnataka (Planned Expansion)',
      ta: 'கர்நாடகா (விரிவாக்கத் திட்டம்)',
      hi: 'कर्नाटक (आगामी विस्तार)',
    },
    isPilotActive: false,
    assistedCentreName: {
      en: 'Karnataka One / Grama One / CSC',
      ta: 'கர்நாடகா ஒன் / கிராம ஒன் / CSC',
      hi: 'कर्नाटक वन / ग्राम वन / CSC',
    },
    districts: [
      { id: 'Bengaluru', en: 'Bengaluru', ta: 'பெங்களூரு', hi: 'बेंगलुरु' },
      { id: 'Mysuru', en: 'Mysuru', ta: 'மைசூரு', hi: 'मैसूरु' },
    ],
  },
  {
    code: 'MH',
    name: {
      en: 'Maharashtra (Planned Expansion)',
      ta: 'மகாராஷ்டிரா (விரிவாக்கத் திட்டம்)',
      hi: 'महाराष्ट्र (आगामी विस्तार)',
    },
    isPilotActive: false,
    assistedCentreName: {
      en: 'Aaple Sarkar Seva Kendra / Maha e-Seva / CSC',
      ta: 'ஆப்லே சர்க்கார் சேவா கேந்திரா / CSC',
      hi: 'आपले सरकार सेवा केंद्र / महा ई-सेवा / CSC',
    },
    districts: [
      { id: 'Mumbai', en: 'Mumbai', ta: 'மும்பை', hi: 'मुंबई' },
      { id: 'Pune', en: 'Pune', ta: 'புனே', hi: 'पुणे' },
    ],
  },
];
