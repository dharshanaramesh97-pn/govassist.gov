import { LanguageCode } from '../../src/types/govassist';

/**
 * SPEECH-TO-TEXT (STT), TEXT-TO-SPEECH (TTS), AND TRANSLATION ADAPTERS (Server-Side)
 *
 * TODO [PRODUCTION INTEGRATION — BHASHINI / ULCA / GOOGLE CLOUD SPEECH]:
 * Replace the mock adapter methods below with Digital India BHASHINI ULCA Pipeline API calls
 * (`https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline`) or
 * Gemini Audio Transcription (`gemini-3.5-transcribe`) & TTS (`gemini-3.8-flash-lite-tts`).
 * Keep BHASHINI_API_KEY and ULCA_USER_ID strictly in backend environment variables.
 */

export interface STTResponse {
  provider: 'mock-bhashini-stt-adapter';
  isMock: true;
  transcript: string;
  confidence: number; // 0.0 to 1.0
  language: LanguageCode;
  requiresReRecordOrEdit: boolean;
}

export async function transcribeAudioMockAdapter(params: {
  language: LanguageCode;
  simulateLowConfidence?: boolean;
  sampleScenarioIndex?: number;
}): Promise<STTResponse> {
  const { language, simulateLowConfidence = false, sampleScenarioIndex = 0 } = params;

  if (simulateLowConfidence) {
    const noisyTranscript =
      language === 'ta'
        ? 'நான் மதுரை... [சத்தம் - தெளிவில்லை] இரண்டு குழந்தைகள்...'
        : language === 'hi'
        ? 'मैं मदुरै... [शोर - अस्पष्ट आवाज़] दो बच्चे...'
        : 'I am in Madurai... [background noise - unclear]... two children...';

    return {
      provider: 'mock-bhashini-stt-adapter',
      isMock: true,
      transcript: noisyTranscript,
      confidence: 0.42,
      language,
      requiresReRecordOrEdit: true,
    };
  }

  const samplesByLang: Record<string, string[]> = {
    ta: [
      'நான் மதுரை கிராமப் பகுதியில் வசிக்கும் 38 வயது விதவை. எனக்கு 2 பள்ளிக் குழந்தைகள் உள்ளனர். விவசாயக் கூலி மூலம் ஆண்டுக்கு ₹75,000 வருமானம் பெறுகிறேன்.',
      'நான் சென்னை நகர்ப்புறத்தில் வசிக்கும் 24 வயது இளைஞர். சிறிய தையல் கடை தொடங்க விரும்புகிறேன்.',
    ],
    hi: [
      'मैं ग्रामीण मदुरै में 38 वर्षीय विधवा हूं, मेरे दो स्कूल जाने वाले बच्चे हैं और खेत मजदूरी से मेरी वार्षिक आय ₹75,000 है।',
      'मैं चेन्नई शहरी क्षेत्र में 24 वर्षीय युवा हूं और एक छोटी सिलाई की दुकान शुरू करना चाहता हूं।',
    ],
    en: [
      'I am a 38-year-old widow with two school children in rural Madurai, earning ₹75,000 a year as a farm worker.',
      'I am a 24-year-old youth in Chennai urban area looking to start a small tailoring shop.',
    ],
  };

  const list = samplesByLang[language] || samplesByLang.en;
  const transcript = list[sampleScenarioIndex % list.length];

  return {
    provider: 'mock-bhashini-stt-adapter',
    isMock: true,
    transcript,
    confidence: 0.94,
    language,
    requiresReRecordOrEdit: false,
  };
}
