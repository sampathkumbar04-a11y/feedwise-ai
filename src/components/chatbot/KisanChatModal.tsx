import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  AlertTriangle,
  Globe,
  Layers,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { speechService, SpeechLanguage } from '../../services/speechService';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import {
  detectLanguage,
  createScanContext,
  generateKisanAssistantResponse,
  DetectedLanguage,
} from '../../services/kisanAssistantEngine';
import { FeedScanReport } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  detectedLanguage?: DetectedLanguage;
  sampleName?: string;
}

interface KisanChatModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  selectedReportId?: string;
  onSelectReportId?: (id: string) => void;
  onOpenScanner?: () => void;
}

export const KisanChatModal: React.FC<KisanChatModalProps> = ({
  id,
  isOpen,
  onClose,
  selectedReportId,
  onSelectReportId,
  onOpenScanner,
}) => {
  const { language } = useLanguage();
  const { scanReports } = useAppData();

  // Active scan report state
  const [activeReportId, setActiveReportId] = useState<string>(() => {
    return selectedReportId || scanReports[0]?.id || '';
  });

  // Track the current report object
  const currentReport: FeedScanReport | undefined =
    scanReports.find((r) => r.id === activeReportId) || scanReports[0];

  const scanCtx = createScanContext(currentReport);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [showMicHelpModal, setShowMicHelpModal] = useState(false);
  const [spokenLangHint, setSpokenLangHint] = useState<SpeechLanguage>(
    language as SpeechLanguage
  );

  // Sync external selectedReportId
  useEffect(() => {
    if (selectedReportId && selectedReportId !== activeReportId) {
      setActiveReportId(selectedReportId);
    }
  }, [selectedReportId]);

  // Keep spokenLangHint aligned if user changes language context
  useEffect(() => {
    if (language === 'hi' || language === 'kn' || language === 'en') {
      setSpokenLangHint(language);
    }
  }, [language]);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcomeText =
      language === 'hi'
        ? 'नमस्ते किसान भाई! मैं FeedWise किसान एआई सहायक हूँ। अपने हालिया साइलेज या चारे के बारे में बोलकर या लिखकर सवाल पूछें।'
        : language === 'kn'
        ? 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು FeedWise ಕಿಸಾನ್ AI ಸಹಾಯಕ. ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಸೈಲೇಜ್ ಅಥವಾ ಮೇವಿನ ಬಗ್ಗೆ ಧ್ವನಿ ಮೂಲಕ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಪ್ರಶ್ನೆ ಕೇಳಿ.'
        : 'Namaste! I am your FeedWise Kisan AI Assistant. Ask any question about your current silage or feed quality by voice or text.';

    return [
      {
        id: 'm_welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedLanguage: language as DetectedLanguage,
        sampleName: currentReport?.sampleName,
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionHandleRef = useRef<{ stop: () => void } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isListening, interimSpeech]);

  // Stop any active speech on modal close
  useEffect(() => {
    if (!isOpen) {
      if (recognitionHandleRef.current) {
        recognitionHandleRef.current.stop();
        recognitionHandleRef.current = null;
      }
      speechService.stop();
      setIsListening(false);
      setActiveSpeakingMsgId(null);
    }
  }, [isOpen]);

  // Handle switching report context
  const handleSelectReport = (reportId: string) => {
    setActiveReportId(reportId);
    onSelectReportId?.(reportId);

    const targetReport = scanReports.find((r) => r.id === reportId);
    if (targetReport) {
      const switchNotice: ChatMessage = {
        id: `sys_${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'kn'
            ? `ಈಗ "${targetReport.sampleName}" ಪರೀಕ್ಷೆಯ ಆಧಾರದ ಮೇಲೆ ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ.`
            : language === 'hi'
            ? `अब "${targetReport.sampleName}" जांच के आधार पर जवाब दिया जा रहा है।`
            : `Context updated: Now answering questions based on "${targetReport.sampleName}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedLanguage: language as DetectedLanguage,
        sampleName: targetReport.sampleName,
      };
      setMessages((prev) => [...prev, switchNotice]);
    }
  };

  // Handle question submission
  const handleProcessQuery = (textToSend?: string) => {
    const rawQuery = (textToSend || inputQuery).trim();
    if (!rawQuery) return;

    // Detect language of question
    const detectedLang = detectLanguage(rawQuery, spokenLangHint || (language as DetectedLanguage));

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedLanguage: detectedLang,
      sampleName: currentReport?.sampleName,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setInterimSpeech('');
    setSpeechError(null);

    // Generate context-aware response based on the active scan
    setTimeout(() => {
      const responseText = generateKisanAssistantResponse({
        query: rawQuery,
        language: detectedLang,
        report: currentReport,
        previousMessages: messages.map((m) => ({ text: m.text, sender: m.sender })),
      });

      const botMsgId = `bot_${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedLanguage: detectedLang,
        sampleName: currentReport?.sampleName,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response if the question was submitted via voice
      if (isListening || textToSend?.includes('voice_trigger')) {
        handlePlaySpeech(botMsgId, responseText, detectedLang);
      }
    }, 350);
  };

  // Voice recognition toggle
  const handleToggleVoiceInput = async () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionHandleRef.current) {
        recognitionHandleRef.current.stop();
        recognitionHandleRef.current = null;
      }
      setIsListening(false);
      if (interimSpeech.trim()) {
        handleProcessQuery(interimSpeech);
      }
      return;
    }

    if (!speechService.isRecognitionSupported()) {
      setSpeechError(
        language === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है। कृपया टाइप करें।'
          : 'Voice recognition is not supported in this browser. Please type your question.'
      );
      return;
    }

    // Proactively request browser microphone permission to trigger browser prompt if needed
    try {
      const micCheck = await speechService.requestMicrophoneAccess();
      if (!micCheck.granted && micCheck.error === 'PermissionDenied') {
        setIsPermissionDenied(true);
        setSpeechError(
          language === 'kn'
            ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಅನುಮತಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.'
            : language === 'hi'
            ? 'माइक अनुमति अस्वीकृत हुई। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें या नीचे टाइप करें।'
            : 'Microphone permission was denied. Click "How to Enable" or type your question below.'
        );
        return;
      }
    } catch {
      // Continue to startListening even if getUserMedia throws an non-standard error
    }

    setIsPermissionDenied(false);
    setIsListening(true);
    setInterimSpeech('');

    const handle = speechService.startListening({
      lang: spokenLangHint,
      onResult: (transcript, isFinal) => {
        setInterimSpeech(transcript);
        if (isFinal && transcript.trim().length > 2) {
          setIsListening(false);
          recognitionHandleRef.current = null;
          handleProcessQuery(transcript);
        }
      },
      onError: (errMsg, isPermission) => {
        console.warn('Speech error:', errMsg);
        setIsListening(false);
        if (isPermission) {
          setIsPermissionDenied(true);
        }
        setSpeechError(
          isPermission
            ? language === 'kn'
              ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಅನುಮತಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.'
              : language === 'hi'
              ? 'माइक अनुमति अस्वीकृत हुई। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें या नीचे टाइप करें।'
              : 'Microphone permission was denied. Click "How to Enable" or type your question below.'
            : errMsg
        );
      },
      onEnd: () => {
        setIsListening(false);
        recognitionHandleRef.current = null;
      },
    });

    recognitionHandleRef.current = handle;
  };

  // Text-to-Speech Playback
  const handlePlaySpeech = (msgId: string, text: string, lang: DetectedLanguage) => {
    if (activeSpeakingMsgId === msgId) {
      speechService.stop();
      setActiveSpeakingMsgId(null);
      return;
    }

    speechService.stop();
    setActiveSpeakingMsgId(msgId);

    speechService.speak(
      text,
      lang as SpeechLanguage,
      () => setActiveSpeakingMsgId(msgId),
      () => setActiveSpeakingMsgId(null)
    );
  };

  // Farmer quick questions based on language
  const quickQuestions = [
    {
      en: 'Can I feed this silage to my cows?',
      hi: 'क्या मैं यह साइलेज अपनी गायों को खिला सकता हूँ?',
      kn: 'ಈ ಸೈಲೇಜ್ ಅನ್ನು ನನ್ನ ಹಸುಗಳಿಗೆ ಕೊಡಬಹುದಾ?',
    },
    {
      en: 'How much should I give to each cow?',
      hi: 'गायों को कितना साइलेज देना चाहिए?',
      kn: 'ಹಸುಗಳಿಗೆ ಎಷ್ಟು ಸೈಲೇಜ್ ಕೊಡಬೇಕು?',
    },
    {
      en: 'What is the Flieg Score & pH?',
      hi: 'इस साइलेज का pH और फ्लीग स्कोर क्या है?',
      kn: 'ಈ ಸೈಲೇಜ್‌ನ pH ಮತ್ತು ಫ್ಲೀಗ್ ಸ್ಕೋರ್ ಎಷ್ಟು?',
    },
    {
      en: 'Is there any mold or spoilage risk?',
      hi: 'क्या इसमें फफूंद या खराबी का खतरा है?',
      kn: 'ಇದರಲ್ಲಿ ಬೂಷ್ಟು ಅಥವಾ ಹಾಳಾಗುವ ಅಪಾಯವಿದೆಯೇ?',
    },
  ];

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      title="Kisan AI Sahayak (किसान सहायक / ಕಿಸಾನ್ ಸಹಾಯಕ)"
      subtitle="Multilingual voice-enabled agronomy assistant for feed and silage analysis"
      maxWidth="xl"
    >
      <div className="flex flex-col h-[520px]">
        {/* CURRENT SCAN CONTEXT BANNER */}
        <div className="bg-stone-50 dark:bg-stone-900/80 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 mb-2">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                <Layers className="h-3 w-3" />
                Active Scan Context
              </span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                {scanCtx.sampleName}
              </span>
            </div>

            {/* Switch Scan Dropdown */}
            {scanReports.length > 1 && (
              <div className="relative shrink-0">
                <select
                  value={activeReportId}
                  onChange={(e) => handleSelectReport(e.target.value)}
                  className="text-[11px] font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2 py-0.5 text-stone-700 dark:text-stone-300 pr-5 appearance-none cursor-pointer focus:outline-hidden"
                >
                  {scanReports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.sampleName} ({r.qualityGrade})
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 absolute right-1.5 top-1.5 text-stone-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Context Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
            <div className="bg-white dark:bg-stone-800/80 px-2 py-1 rounded-md border border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-stone-500">FLEIG Score:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {scanCtx.fliegScore ?? scanCtx.overallScore}
              </span>
            </div>

            <div className="bg-white dark:bg-stone-800/80 px-2 py-1 rounded-md border border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-stone-500">pH Level:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {scanCtx.pH ? `${scanCtx.pH}` : 'N/A'}
              </span>
            </div>

            <div className="bg-white dark:bg-stone-800/80 px-2 py-1 rounded-md border border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-stone-500">Dry Matter:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {scanCtx.dryMatter ? `${scanCtx.dryMatter}%` : `${scanCtx.moisture}% M`}
              </span>
            </div>

            <div className="bg-white dark:bg-stone-800/80 px-2 py-1 rounded-md border border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-stone-500">Spoilage:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  scanCtx.isHighRisk
                    ? 'text-red-600 dark:text-red-400'
                    : scanCtx.spoilageRisk === 'Moderate'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {scanCtx.moldDetected ? (
                  <>
                    <ShieldAlert className="h-3 w-3" /> Mold
                  </>
                ) : (
                  scanCtx.spoilageRisk
                )}
              </span>
            </div>
          </div>
        </div>

        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1 pr-1.5" data-lenis-prevent>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100 rounded-tl-xs border border-stone-200/60 dark:border-stone-700/60 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5 text-[10px] opacity-80">
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.detectedLanguage && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 bg-black/10 dark:bg-white/10 font-medium">
                        <Globe className="h-2.5 w-2.5" />
                        {msg.detectedLanguage === 'kn'
                          ? 'ಕನ್ನಡ'
                          : msg.detectedLanguage === 'hi'
                          ? 'हिंदी'
                          : 'English'}
                      </span>
                    )}
                  </div>

                  {msg.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePlaySpeech(
                          msg.id,
                          msg.text,
                          msg.detectedLanguage || (language as DetectedLanguage)
                        )
                      }
                      className="inline-flex items-center gap-1 rounded bg-emerald-600/10 dark:bg-emerald-400/10 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 transition-colors"
                      title="Listen to response"
                    >
                      {activeSpeakingMsgId === msg.id ? (
                        <>
                          <VolumeX className="h-3 w-3 text-red-500 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>🔊 Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 shadow-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Live speech recognition interim bubble */}
          {isListening && (
            <div className="flex items-start gap-2.5 justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span>
                    Listening (
                    {spokenLangHint === 'kn'
                      ? 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ...'
                      : spokenLangHint === 'hi'
                      ? 'हिंदी में बोलिए...'
                      : 'Speak in English...'}
                    )
                  </span>
                </div>
                <p className="italic">
                  {interimSpeech || 'Listening to your voice... Speak now.'}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification banner if any */}
        {speechError && (
          <div className="px-3 py-2 my-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                {speechError}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSpeechError(null);
                  setIsPermissionDenied(false);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
                title="Dismiss"
              >
                ×
              </button>
            </div>

            {isPermissionDenied && (
              <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className="inline-flex items-center gap-1 rounded bg-amber-700 dark:bg-amber-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-amber-800 transition-colors shadow-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Retry Mic Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMicHelpModal(true)}
                  className="inline-flex items-center gap-1 rounded bg-amber-200/80 dark:bg-amber-900/60 px-2 py-1 text-[10px] font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors"
                >
                  <Info className="h-3 w-3" />
                  <span>How to Unblock in Browser</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* QUICK PROMPT SUGGESTIONS */}
        <div className="py-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Recommended Questions
            </span>

            {/* Language hint selector */}
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
              <span>Voice Lang:</span>
              {(['kn', 'hi', 'en'] as SpeechLanguage[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSpokenLangHint(l)}
                  className={`px-1.5 py-0.2 rounded transition-colors ${
                    spokenLangHint === l
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {l === 'kn' ? 'ಕನ್ನಡ' : l === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickQuestions.map((q, idx) => {
              const label =
                spokenLangHint === 'kn'
                  ? q.kn
                  : spokenLangHint === 'hi'
                  ? q.hi
                  : q.en;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleProcessQuery(label)}
                  className="whitespace-nowrap rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-emerald-950/40 transition-colors shrink-0"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* INPUT BAR WITH VOICE BUTTON & TEXT INPUT */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
          <div className="flex items-center gap-2">
            {/* Prominent Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 shadow-xs ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
              title={isListening ? 'Click to stop listening' : 'Ask Kisan Sahayak by Voice'}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>🎤 Ask by Voice</span>
                </>
              )}
            </button>

            {/* Text Input Fallback */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessQuery();
              }}
              placeholder={
                spokenLangHint === 'kn'
                  ? 'ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಸೈಲೇಜ್ ಕೊಡಬಹುದಾ?)...'
                  : spokenLangHint === 'hi'
                  ? 'हिंदी में सवाल टाइप करें (उदा: क्या यह साइलेज खिला सकते हैं?)...'
                  : 'Type question (e.g. Can I feed this silage to my cows?)...'
              }
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleProcessQuery()}
              disabled={!inputQuery.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs"
              title="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
