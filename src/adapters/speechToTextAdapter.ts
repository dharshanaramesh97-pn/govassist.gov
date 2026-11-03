import { LanguageCode } from '../types/govassist';

/**
 * CLIENT SPEECH-TO-TEXT (STT) ADAPTER
 *
 * Connects to backend `/api/speech/transcribe` (which wraps the mock Bhashini STT adapter)
 * and optionally uses browser `webkitSpeechRecognition` / `SpeechRecognition` when available.
 * Never processes a transcript automatically: always returns the transcript + confidence
 * so the citizen can confirm or edit it first.
 */

export interface ClientSTTResult {
  transcript: string;
  confidence: number;
  requiresReRecordOrEdit: boolean;
  isMock: boolean;
}

export async function recordAndTranscribeSpeech(params: {
  language: LanguageCode;
  simulateLowConfidence?: boolean;
  sampleScenarioIndex?: number;
}): Promise<ClientSTTResult> {
  const response = await fetch('/api/speech/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error('Speech transcription request failed');
  }
  return response.json();
}
