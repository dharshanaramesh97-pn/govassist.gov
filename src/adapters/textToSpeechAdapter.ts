/**
 * CLIENT TEXT-TO-SPEECH (TTS) ADAPTER
 *
 * Uses Web Speech API (`window.speechSynthesis`) with Indian language voice selection
 * (`ta-IN`, `hi-IN`, `en-IN`, `ur-IN`, etc.) plus a gentle Web Audio API confirmation tone
 * so every speaker icon and "Listen" button provides immediate audible & visual feedback
 * even on headless browsers where OS voices are not installed.
 *
 * TODO [PRODUCTION TTS INTEGRATION]:
 * Connect to `/api/speech/synthesize` backed by BHASHINI TTS or Gemini `gemini-3.8-flash-lite-tts`
 * for studio-quality regional Indian voices.
 */

class TextToSpeechAdapter {
  private speaking = false;
  private listeners = new Set<(speaking: boolean) => void>();

  private notify(speaking: boolean) {
    this.speaking = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  public onStateChange(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }

  private playFeedbackChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } catch {
      // Ignore audio context restrictions
    }
  }

  public speak(text: string, voiceLangTag = 'en-IN') {
    this.stop();
    this.playFeedbackChime();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notify(true);
      setTimeout(() => this.notify(false), 1800);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLangTag;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase() === voiceLangTag.toLowerCase()) ||
        voices.find((v) =>
          v.lang.toLowerCase().startsWith(voiceLangTag.split('-')[0].toLowerCase())
        );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => this.notify(true);
      utterance.onend = () => this.notify(false);
      utterance.onerror = () => this.notify(false);

      this.notify(true);
      window.speechSynthesis.speak(utterance);

      // Safety fallback if browser speechSynthesis hangs
      setTimeout(() => {
        if (this.speaking && !window.speechSynthesis.speaking) {
          this.notify(false);
        }
      }, 6000);
    } catch {
      this.notify(false);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    this.notify(false);
  }
}

export const ttsAdapter = new TextToSpeechAdapter();
