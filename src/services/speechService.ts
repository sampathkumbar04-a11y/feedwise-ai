/**
 * Voice accessibility and speech recognition service for rural farmers (Kisan voice prompt).
 * Supports multilingual Speech Recognition (STT) and Speech Synthesis (TTS) for English, Hindi, and Kannada.
 */

export type SpeechLanguage = 'en' | 'hi' | 'kn';

export interface ListeningOptions {
  lang: SpeechLanguage;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string, isPermissionError: boolean) => void;
  onEnd: () => void;
}

export interface RecognitionHandle {
  stop: () => void;
}

// Browser SpeechRecognition interface declaration
interface IWindowSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export const speechService = {
  /**
   * Check if Speech Synthesis (Text-to-Speech) is supported.
   */
  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Check if Speech Recognition (Voice-to-Text) is supported.
   */
  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition
    );
  },

  /**
   * Convert language code to standard BCP-47 locale tag.
   */
  getLocale(lang: SpeechLanguage = 'en'): string {
    switch (lang) {
      case 'kn':
        return 'kn-IN';
      case 'hi':
        return 'hi-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  },

  /**
   * Read aloud text in the specified language (English, Hindi, or Kannada).
   */
  speak(
    text: string,
    lang: SpeechLanguage = 'en',
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isSynthesisSupported()) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean markdown or asterisks before speaking
      const cleanedText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetLocale = this.getLocale(lang);
      utterance.lang = targetLocale;
      utterance.rate = 0.92; // Slightly measured pace for rural understanding
      utterance.pitch = 1.0;

      // Try to select an authentic native voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang.toLowerCase().startsWith(lang)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      if (onStart) utterance.onstart = () => onStart();
      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback error', e);
      onEnd?.();
    }
  },

  /**
   * Cancel any active speech playback.
   */
  stop(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Check if speech is currently speaking.
   */
  isSpeaking(): boolean {
    if (!this.isSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  },

  /**
   * Explicitly request microphone stream permission from browser.
   * Helps trigger the native browser permission prompt if not yet granted.
   */
  async requestMicrophoneAccess(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return { granted: false, error: 'Media devices API not supported in this browser' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the tracks immediately after verification so the mic icon isn't left on
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      console.warn('getUserMedia microphone error:', err);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.includes('denied');
      return {
        granted: false,
        error: isDenied ? 'PermissionDenied' : err?.message || 'MicrophoneUnavailable',
      };
    }
  },

  /**
   * Start listening to farmer's voice using browser Web Speech API.
   */
  startListening(options: ListeningOptions): RecognitionHandle {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      options.onError(
        'Speech recognition is not supported in this browser. Please type your question.',
        false
      );
      options.onEnd();
      return { stop: () => {} };
    }

    let recognition: IWindowSpeechRecognition;
    try {
      recognition = new SpeechRecognitionClass();
    } catch (err) {
      options.onError('Unable to initialize microphone.', false);
      options.onEnd();
      return { stop: () => {} };
    }

    const locale = this.getLocale(options.lang);
    recognition.lang = locale;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let hasReceivedResult = false;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text.trim()) {
        hasReceivedResult = true;
        options.onResult(text.trim(), !!finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      const isPermissionDenied = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      let message = 'Speech recognition error. Please try again or type your question.';
      if (isPermissionDenied) {
        message = 'Microphone permission was denied. Please allow microphone access or type your question.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak closer to the microphone.';
      } else if (event.error === 'network') {
        message = 'Voice recognition network error. Offline mode active: please type your question.';
      }

      options.onError(message, isPermissionDenied);
    };

    recognition.onend = () => {
      options.onEnd();
    };

    try {
      recognition.start();
    } catch (e: any) {
      console.warn('Failed to start speech recognition:', e);
      options.onError('Could not activate microphone. Please type your question.', false);
      options.onEnd();
    }

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore error if already stopped
        }
      },
    };
  },
};
