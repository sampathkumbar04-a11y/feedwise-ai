import { FeedScanReport } from '../types';

export type DetectedLanguage = 'kn' | 'hi' | 'en';

export interface ScanContextSummary {
  hasScan: boolean;
  sampleName: string;
  feedType: string;
  analysisId: string;
  overallScore: number;
  qualityGrade: string;
  pH?: number;
  dryMatter?: number;
  moisture: number;
  fliegScore?: number;
  fermentationGrade?: string;
  spoilageRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  moldDetected: boolean;
  mycotoxinRiskLevel: 'Safe' | 'Guarded' | 'Unsafe';
  crudeProtein?: number;
  tdn?: number;
  ndf?: number;
  adf?: number;
  safetyWarning?: string;
  isHighRisk: boolean;
  isSilage: boolean;
}

/**
 * Automatically identify whether the farmer's question is in Kannada, Hindi, or English.
 * Fallbacks to the application's selected language when uncertain.
 */
export function detectLanguage(
  text: string,
  fallbackLang: DetectedLanguage = 'en'
): DetectedLanguage {
  if (!text || !text.trim()) return fallbackLang;

  // 1. Check for Kannada Unicode script (\u0C80 - \u0CFF)
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  if (kannadaRegex.test(text)) {
    return 'kn';
  }

  // 2. Check for Devanagari (Hindi) Unicode script (\u0900 - \u097F)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'hi';
  }

  // 3. Check for transliterated/romanized Kannada words
  const lower = text.toLowerCase();
  const romanizedKannadaWords = [
    'sailej', 'silage', 'koda', 'kodabahuda', 'kodbahuda', 'hasu', 'hasuvige',
    'beku', 'yeshtu', 'eshtu', 'oota', 'mevu', 'hullu', 'haalu', 'tinnisa',
    'guna', 'uttama', 'namaskara', 'kannada', 'krishi', 'raitha', 'raitara',
    'kottige', 'dana', 'boodi', 'neeru', 'ph', 'flieg'
  ];
  const matchedKn = romanizedKannadaWords.filter((w) => lower.includes(w)).length;

  // 4. Check for transliterated/romanized Hindi words
  const romanizedHindiWords = [
    'kya', 'khila', 'sakte', 'sakti', 'gaay', 'bhains', 'sailej', 'kitna',
    'doodh', 'pashu', 'aahar', 'namaste', 'bhai', 'kharab', 'faida',
    'chara', 'bhusa', 'dena', 'chahiye', 'hai', 'kaisa', 'karein', 'pani'
  ];
  const matchedHi = romanizedHindiWords.filter((w) => lower.includes(w)).length;

  if (matchedKn >= 2 && matchedKn > matchedHi) return 'kn';
  if (matchedHi >= 2 && matchedHi > matchedKn) return 'hi';

  // 5. English phrases or fallback
  const englishIndicators = /\b(can|feed|this|silage|to|my|cows|cow|is|it|safe|how|much|should|give|what|ph|score|protein|dry|matter|spoilage|mold|quality|good|bad)\b/i;
  if (englishIndicators.test(text)) {
    return 'en';
  }

  return fallbackLang;
}

/**
 * Creates a normalized context object from the currently active FeedScanReport.
 */
export function createScanContext(report?: FeedScanReport): ScanContextSummary {
  if (!report) {
    return {
      hasScan: false,
      sampleName: 'No Sample Selected',
      feedType: 'unknown',
      analysisId: 'N/A',
      overallScore: 0,
      qualityGrade: 'N/A',
      moisture: 0,
      spoilageRisk: 'Low',
      moldDetected: false,
      mycotoxinRiskLevel: 'Safe',
      isHighRisk: false,
      isSilage: false,
    };
  }

  const isSilage = report.feedType === 'silage';
  const pH = report.fliegData?.pH;
  const fliegScore = report.fliegData?.fliegScore;
  const isHighRisk =
    report.moldDetected ||
    report.spoilageRisk === 'Severe' ||
    report.spoilageRisk === 'High' ||
    report.mycotoxinRiskLevel === 'Unsafe' ||
    (isSilage && typeof pH === 'number' && pH >= 5.5) ||
    report.overallScore < 45;

  return {
    hasScan: true,
    sampleName: report.sampleName || 'Feed Sample',
    feedType: report.feedType,
    analysisId: report.id,
    overallScore: report.overallScore,
    qualityGrade: report.qualityGrade,
    pH,
    dryMatter: report.nutritionalValues?.dryMatter,
    moisture: report.moistureEstimate || report.nutritionalValues?.moisture || 0,
    fliegScore,
    fermentationGrade: report.fliegData?.grade,
    spoilageRisk: report.spoilageRisk,
    moldDetected: report.moldDetected,
    mycotoxinRiskLevel: report.mycotoxinRiskLevel,
    crudeProtein: report.nutritionalValues?.crudeProtein,
    tdn: report.nutritionalValues?.totalDigestibleNutrients,
    ndf: report.nutritionalValues?.neutralDetergentFiber,
    adf: report.nutritionalValues?.acidDetergentFiber,
    safetyWarning: report.safetyWarning,
    isHighRisk,
    isSilage,
  };
}

interface GenerateResponseParams {
  query: string;
  language: DetectedLanguage;
  report?: FeedScanReport;
  previousMessages?: { text: string; sender: 'user' | 'assistant' }[];
}

/**
 * Generates context-aware, simple farmer-friendly answers in the farmer's detected language.
 */
export function generateKisanAssistantResponse({
  query,
  language,
  report,
}: GenerateResponseParams): string {
  const ctx = createScanContext(report);
  const q = query.toLowerCase();

  // 1. Detect query intent
  const isSafetyOrFeedingQuery =
    q.includes('feed') ||
    q.includes('safe') ||
    q.includes('give') ||
    q.includes('cow') ||
    q.includes('ಕೊಡಬಹುದಾ') ||
    q.includes('ತಿನ್ನಿಸಬಹುದಾ') ||
    q.includes('ನೀಡಬಹುದಾ') ||
    q.includes('ಸುರಕ್ಷಿತ') ||
    q.includes('खिला') ||
    q.includes('सकते') ||
    q.includes('सुरक्षित') ||
    q.includes('दे सकते');

  const isDosageQuery =
    q.includes('how much') ||
    q.includes('quantity') ||
    q.includes('dose') ||
    q.includes('rate') ||
    q.includes('ಎಷ್ಟು') ||
    q.includes('ಪ್ರಮಾಣ') ||
    q.includes('ಕೆಜಿ') ||
    q.includes('कितना') ||
    q.includes('मात्रा') ||
    q.includes('किलो');

  const isFliegOrFermentationQuery =
    q.includes('flieg') ||
    q.includes('ph') ||
    q.includes('ferment') ||
    q.includes('score') ||
    q.includes('ಫ್ಲೀಗ್') ||
    q.includes('ಹುದುಗುವಿಕೆ') ||
    q.includes('ಸ್ಕೋರ್') ||
    q.includes('फ्लीग') ||
    q.includes('किण्वन');

  const isMoldOrSpoilageQuery =
    q.includes('mold') ||
    q.includes('mould') ||
    q.includes('spoil') ||
    q.includes('fungus') ||
    q.includes('mycotoxin') ||
    q.includes('ಶಿಲೀಂಧ್ರ') ||
    q.includes('ಬೂಷ್ಟು') ||
    q.includes('ಹಾಳಾಗುವ') ||
    q.includes('फफूंद') ||
    q.includes('सड़न') ||
    q.includes('खराबी');

  const isNutritionOrProteinQuery =
    q.includes('protein') ||
    q.includes('dry matter') ||
    q.includes('tdn') ||
    q.includes('fiber') ||
    q.includes('fat') ||
    q.includes('snf') ||
    q.includes('milk') ||
    q.includes('ಪ್ರೋಟೀನ್') ||
    q.includes('ಕೊಬ್ಬು') ||
    q.includes('ಹಾಲು') ||
    q.includes('ಒಣ ಪದಾರ್ಥ') ||
    q.includes('प्रोटीन') ||
    q.includes('फैट') ||
    q.includes('दूध') ||
    q.includes('पोषण');

  const isStorageQuery =
    q.includes('store') ||
    q.includes('pit') ||
    q.includes('bunker') ||
    q.includes('preserve') ||
    q.includes('ಸಂಗ್ರಹ') ||
    q.includes('ರಕ್ಷಣೆ') ||
    q.includes('भंडारण') ||
    q.includes('सुरक्षा') ||
    q.includes('रखें');

  const isGreeting =
    q.includes('hello') ||
    q.includes('hi') ||
    q.includes('namaste') ||
    q.includes('ನಮಸ್ಕಾರ') ||
    q.includes('नमस्ते') ||
    q.trim() === 'help';

  // ----------------------------------------------------
  // Scenario: No Scan Context Available
  // ----------------------------------------------------
  if (!ctx.hasScan) {
    if (language === 'kn') {
      return 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಸದ್ಯ ಯಾವುದೇ ಸೈಲೇಜ್ ಅಥವಾ ಮೇವಿನ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಆಯ್ಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೇಲಿನ ಕ್ಯಾಮೆರಾ ಬಟನ್ ಬಳಸಿ ಮೇವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ನಂತರ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ. ನಾನು ಅದರ ಆಧಾರದ ಮೇಲೆ ನಿಖರ ಸಲಹೆ ನೀಡುತ್ತೇನೆ.';
    }
    if (language === 'hi') {
      return 'नमस्ते किसान भाई! वर्तमान में कोई साइलेज या चारा जांच चयनित नहीं है। कृपया पहले कैमरे से चारा स्कैन करें, फिर प्रश्न पूछें। मैं सीधे आपकी जांच रिपोर्ट के आधार पर सही मार्गदर्शन दूंगा।';
    }
    return 'Hello! No feed or silage scan is currently selected. Please scan your feed sample using the camera or select a sample from history, and I will answer directly based on your test results.';
  }

  // ----------------------------------------------------
  // Scenario: High-Risk / Mold / Severe Spoilage Detected
  // ----------------------------------------------------
  if (ctx.isHighRisk) {
    if (language === 'kn') {
      return `ಎಚ್ಚರಿಕೆ! ಪ್ರಸ್ತುತ ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ (${ctx.sampleName}), ಈ ಸೈಲೇಜ್ ಹಸುಗಳಿಗೆ ನೀಡಲು ಸುರಕ್ಷಿತವಾಗಿಲ್ಲ. ಇದರಲ್ಲಿ ${
        ctx.moldDetected ? 'ಶಿಲೀಂಧ್ರ (ಬೂಷ್ಟು/Mold)' : 'ಹಾಳಾಗುವ ಅಪಾಯ'
      } ಕಂಡುಬಂದಿದೆ (pH: ${ctx.pH ?? 'ಹೆಚ್ಚು'}, ಸ್ಥಿತಿ: ${ctx.spoilageRisk}). ಈ ಭಾಗವನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ತಿರಸ್ಕರಿಸಿ ಮತ್ತು ಹಸುಗಳಿಗೆ ತಿನ್ನಿಸಬೇಡಿ.`;
    }
    if (language === 'hi') {
      return `सावधानी! वर्तमान जांच परिणामों (${ctx.sampleName}) के आधार पर, यह साइलेज गायों को खिलाने के लिए सुरक्षित नहीं है। इसमें ${
        ctx.moldDetected ? 'फफूंद (मोल्ड)' : 'खराबी का गंभीर खतरा'
      } देखा गया है (pH: ${ctx.pH ?? 'असामान्य'}, स्थिति: ${ctx.spoilageRisk})। कृपया इस खराब परत को तुरंत अलग करें और पशुओं को न खिलाएं।`;
    }
    return `Safety Alert! Based on the current analysis of ${ctx.sampleName}, I cannot confirm that this silage is safe to feed. Visual inspection detected ${
      ctx.moldDetected ? 'active mould colonies' : 'elevated spoilage risk'
    } (pH: ${ctx.pH ?? 'High'}, Spoilage: ${ctx.spoilageRisk}). Please discard or isolate this spoiled layer immediately.`;
  }

  // ----------------------------------------------------
  // Intent 1: Safety & Can I feed this to my cows?
  // ----------------------------------------------------
  if (isSafetyOrFeedingQuery) {
    if (ctx.spoilageRisk === 'Moderate' || ctx.overallScore < 65) {
      if (language === 'kn') {
        return `ಪ್ರಸ್ತುತ ಪರೀಕ್ಷೆಯ ಪ್ರಕಾರ (${ctx.sampleName}), ಈ ಸೈಲೇಜ್ ಸಾಧಾರಣ ಗುಣಮಟ್ಟದಲ್ಲಿದೆ (pH: ${ctx.pH ?? '4.8'}, ಫ್ಲೀಗ್: ${ctx.fliegScore ?? '55'}). ಇದನ್ನು ಸಣ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಒಣ ಹುಲ್ಲಿನೊಂದಿಗೆ ಬೆರೆಸಿ ನೀಡಬಹುದು. ಆದರೆ ಗಾಳಿಗೆ ಒಡ್ಡಿಕೊಂಡ ನಂತರ ಬೇಗನೆ ಬಿಸಿಯಾಗುವ ಅಪಾಯವಿರುವುದರಿಂದ ತಕ್ಷಣ ಬಳಸಿ.`;
      }
      if (language === 'hi') {
        return `वर्तमान जांच (${ctx.sampleName}) के अनुसार, यह साइलेज मध्यम श्रेणी का है (pH: ${ctx.pH ?? '4.8'}, फ्लीग स्कोर: ${ctx.fliegScore ?? '55'})। इसे सूखे भूसे के साथ मिलाकर सीमित मात्रा में दिया जा सकता है। खुला रखने पर यह जल्दी खराब हो सकता है, इसलिए तुरंत इस्तेमाल करें।`;
      }
      return `Based on the current analysis of ${ctx.sampleName}, the silage quality is fair to moderate (pH: ${ctx.pH ?? '4.8'}, Flieg Score: ${ctx.fliegScore ?? '55'}). It can be fed in limited quantities blended with dry straw, but consume quickly after pit opening to prevent heating.`;
    }

    // Good / Optimal Quality Silage
    if (language === 'kn') {
      return `ಹೌದು. ಪ್ರಸ್ತುತ ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ (${ctx.sampleName}) ಈ ಸೈಲೇಜ್ ಗುಣಮಟ್ಟ ಉತ್ತಮವಾಗಿದೆ (pH: ${ctx.pH ?? '3.9'}, ಫ್ಲೀಗ್ ಸ್ಕೋರ್: ${ctx.fliegScore ?? '100'}, ಒಣ ಪದಾರ್ಥ: ${ctx.dryMatter ?? '34'}%). ಹಸುಗಳಿಗೆ ನೀಡಬಹುದು. ಸೈಲೇಜ್ ಅನ್ನು ಸ್ವಚ್ಛವಾಗಿ ಮತ್ತು ಗಾಳಿಯಿಲ್ಲದ ರೀತಿಯಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.`;
    }
    if (language === 'hi') {
      return `हाँ, वर्तमान जांच के परिणामों (${ctx.sampleName}) के आधार पर इस साइलेज की गुणवत्ता बहुत अच्छी है (pH: ${ctx.pH ?? '3.9'}, फ्लीग स्कोर: ${ctx.fliegScore ?? '100'}) और इसे गायों को दिया जा सकता है। साइलेज को हवा से बचाकर सुरक्षित रखें।`;
    }
    return `Based on the current silage analysis of ${ctx.sampleName}, the quality looks good (pH: ${ctx.pH ?? '3.9'}, Flieg Score: ${ctx.fliegScore ?? '100'}, DM: ${ctx.dryMatter ?? '34'}%) and it appears suitable for feeding to your cows.`;
  }

  // ----------------------------------------------------
  // Intent 2: Dosage / Quantity
  // ----------------------------------------------------
  if (isDosageQuery) {
    if (ctx.isSilage) {
      if (language === 'kn') {
        return `${ctx.sampleName} ಗಾಗಿ: ಹಾಲು ಕೊಡುವ ಹಸುವಿಗೆ ದಿನಕ್ಕೆ ಸುಮಾರು 15 ರಿಂದ 20 ಕೆಜಿ ಉತ್ತಮ ಸೈಲೇಜ್ ನೀಡಬಹುದು. ಇದರೊಂದಿಗೆ 2 ರಿಂದ 3 ಕೆಜಿ ಒಣ ಹುಲ್ಲು ಮತ್ತು ಹಾಲಿನ ಇಳುವರಿಗೆ ತಕ್ಕಂತೆ ಸಮತೋಲಿತ ಪಶು ಆಹಾರ (ದಾಣಾ) ನೀಡಿ.`;
      }
      if (language === 'hi') {
        return `${ctx.sampleName} के लिए: एक दुधारू गाय को प्रतिदिन 15 से 20 किलोग्राम अच्छा साइलेज दिया जा सकता है। साथ में 2 से 3 किलो सूखा भूसा और दूध की मात्रा अनुसार संतुलित दाना अवश्य दें।`;
      }
      return `For ${ctx.sampleName}: A lactating dairy cow can typically be fed 15 to 20 kg of good quality silage per day, along with 2 to 3 kg of dry straw/hay and balanced concentrate based on daily milk production.`;
    }

    if (language === 'kn') {
      return `${ctx.sampleName} ಪ್ರಮಾಣ: ಹಾಲು ಕೊಡುವ ಪ್ರತಿ ಹಸುವಿಗೆ ದಿನಕ್ಕೆ 25-30 ಕೆಜಿ ಹಸಿರು ಮೇವು ಅಥವಾ 4-6 ಕೆಜಿ ಒಣ ಮೇವನ್ನು ಸಮತೋಲಿತ ಪಶು ಆಹಾರದೊಂದಿಗೆ ನೀಡಿ.`;
    }
    if (language === 'hi') {
      return `${ctx.sampleName} की मात्रा: प्रति दुधारू पशु प्रतिदिन 25 से 30 किलो हरा चारा या 4 से 6 किलो सूखा चारा संतुलित दाने के साथ दें।`;
    }
    return `Recommended feeding rate for ${ctx.sampleName}: Provide 25 to 30 kg fresh fodder or 4 to 6 kg dry roughage daily per adult dairy animal along with balanced concentrate.`;
  }

  // ----------------------------------------------------
  // Intent 3: Flieg Score & Fermentation / pH
  // ----------------------------------------------------
  if (isFliegOrFermentationQuery) {
    if (ctx.isSilage && typeof ctx.pH === 'number') {
      if (language === 'kn') {
        return `ಪ್ರಸ್ತುತ ಸೈಲೇಜ್‌ನ pH ಮೌಲ್ಯ ${ctx.pH} ಮತ್ತು ಫ್ಲೀಗ್ ಸ್ಕೋರ್ ${ctx.fliegScore ?? 100}/100 (${ctx.fermentationGrade ?? 'ಉತ್ತಮ'}) ಆಗಿದೆ. ಉತ್ತಮ ಸೈಲೇಜ್‌ಗೆ 3.8 ರಿಂದ 4.2 pH ಇರಬೇಕು. ಈ ಬ್ಯಾಚ್‌ನ ಹುದುಗುವಿಕೆ ಸರಿಯಾಗಿದೆ.`;
      }
      if (language === 'hi') {
        return `वर्तमान जांच में साइलेज का pH ${ctx.pH} और फ्लीग स्कोर ${ctx.fliegScore ?? 100}/100 (${ctx.fermentationGrade ?? 'उत्कृष्ट'}) है। आदर्श साइलेज का pH 3.8 से 4.2 के बीच होता है। इस साइलेज का किण्वन गुणवत्तापूर्ण है।`;
      }
      return `In the current analysis of ${ctx.sampleName}, the pH is ${ctx.pH} and the Flieg Score is ${ctx.fliegScore ?? 100}/100 (${ctx.fermentationGrade ?? 'Very Good'}). Ideal corn silage ranges between 3.8 and 4.2 pH with strong lactic preservation.`;
    }

    if (language === 'kn') {
      return `ಈ ಸ್ಯಾಂಪಲ್‌ನ ಒಟ್ಟಾರೆ ಗುಣಮಟ್ಟದ ಸ್ಕೋರ್ ${ctx.overallScore}/100 (${ctx.qualityGrade}) ಆಗಿದೆ. ತೇವಾಂಶ ${ctx.moisture}% ಮತ್ತು ಒಣ ಪದಾರ್ಥ ${ctx.dryMatter ?? 30}% ಇದೆ.`;
    }
    if (language === 'hi') {
      return `इस सैंपल का समग्र गुणवत्ता स्कोर ${ctx.overallScore}/100 (${ctx.qualityGrade}) है। इसमें नमी ${ctx.moisture}% और शुष्क पदार्थ ${ctx.dryMatter ?? 30}% है।`;
    }
    return `This sample has an overall quality score of ${ctx.overallScore}/100 (${ctx.qualityGrade}) with ${ctx.moisture}% moisture and ${ctx.dryMatter ?? 30}% dry matter.`;
  }

  // ----------------------------------------------------
  // Intent 4: Mold & Spoilage
  // ----------------------------------------------------
  if (isMoldOrSpoilageQuery) {
    const moldStatusKn = ctx.moldDetected ? 'ಶಿಲೀಂಧ್ರ (ಬೂಷ್ಟು) ಕಂಡುಬಂದಿದೆ' : 'ಯಾವುದೇ ಬೂಷ್ಟು ಕಂಡುಬಂದಿಲ್ಲ';
    const moldStatusHi = ctx.moldDetected ? 'फफूंद पाई गई है' : 'कोई फफूंद नहीं पाई गई';
    const moldStatusEn = ctx.moldDetected ? 'Mould detected' : 'No mould detected';

    if (language === 'kn') {
      return `ಪರೀಕ್ಷೆಯ ಫಲಿತಾಂಶ: ${moldStatusKn}. ಹಾಳಾಗುವ ಅಪಾಯದ ಮಟ್ಟ: ${ctx.spoilageRisk}. ಮೈಕೋಟಾಕ್ಸಿನ್ ರಿಸ್ಕ್: ${ctx.mycotoxinRiskLevel}. ಮೇಲ್ಮೈಯಲ್ಲಿ ಗಾಳಿ ಸೋಕದಂತೆ ಪ್ಲಾಸ್ಟಿಕ್ ಶೀಟ್ ಸರಿಯಾಗಿ ಮುಚ್ಚಿ.`;
    }
    if (language === 'hi') {
      return `जांच रिपोर्ट: ${moldStatusHi}। खराबी का जोखिम स्तर: ${ctx.spoilageRisk}। माइकोटॉक्सिन सुरक्षा: ${ctx.mycotoxinRiskLevel}। गड्ढे को हमेशा एयरटाइट प्लास्टिक से ढककर रखें।`;
    }
    return `Inspection Result for ${ctx.sampleName}: ${moldStatusEn}. Spoilage risk is rated as ${ctx.spoilageRisk}, with ${ctx.mycotoxinRiskLevel} mycotoxin status. Keep the pit face sealed between feedings.`;
  }

  // ----------------------------------------------------
  // Intent 5: Nutrition, Protein & Milk Yield
  // ----------------------------------------------------
  if (isNutritionOrProteinQuery) {
    if (language === 'kn') {
      return `${ctx.sampleName} ಪೋಷಕಾಂಶ ಮೌಲ್ಯಗಳು: ಕಚ್ಚಾ ಪ್ರೋಟೀನ್ (CP): ${ctx.crudeProtein ?? 8.5}%, ಒಣ ಪದಾರ್ಥ (DM): ${ctx.dryMatter ?? 34}%, ಮತ್ತು ಶಕ್ತಿ (TDN): ${ctx.tdn ?? 68}%. ಇದು ಹಸುಗಳಲ್ಲಿ ಜೀರ್ಣಕ್ರಿಯೆ ಮತ್ತು ಹಾಲಿನ ಕೊಬ್ಬು (Fat & SNF) ಕಾಪಾಡಲು ನೆರವಾಗುತ್ತದೆ.`;
    }
    if (language === 'hi') {
      return `${ctx.sampleName} के पोषण आंकड़े: क्रूड प्रोटीन (CP): ${ctx.crudeProtein ?? 8.5}%, शुष्क पदार्थ (DM): ${ctx.dryMatter ?? 34}%, और TDN: ${ctx.tdn ?? 68}%. यह गायों में पाचन क्रिया और दूध के फैट व उत्पादन को बनाए रखने में सक्षम है।`;
    }
    return `Nutritional Profile for ${ctx.sampleName}: Crude Protein (CP) is ${ctx.crudeProtein ?? 8.5}%, Dry Matter (DM) is ${ctx.dryMatter ?? 34}%, and TDN energy is ${ctx.tdn ?? 68}%. This provides balanced rumen fermentable fiber for milk yield and fat.`;
  }

  // ----------------------------------------------------
  // Intent 6: Storage & Pit Management
  // ----------------------------------------------------
  if (isStorageQuery) {
    if (language === 'kn') {
      return `ಸೈಲೇಜ್ ರಕ್ಷಣಾ ಸಲಹೆ: ಸೈಲೇಜ್ ಪಿಟ್‌ನಿಂದ ದಿನಕ್ಕೆ 15-20 ಸೆಂ.ಮೀ ನೇರವಾದ ಪದರದಲ್ಲಿ ಮಾತ್ರ ತೆಗೆಯಿರಿ. ತೆಗೆದ ನಂತರ ಪ್ಲಾಸ್ಟಿಕ್ ಶೀಟ್ ಅನ್ನು ತೂಕ ಹಾಕಿ ಮುಚ್ಚಿ ಗಾಳಿ ಆಡದಂತೆ ತಡೆಯಿರಿ.`;
    }
    if (language === 'hi') {
      return `साइलेज सुरक्षा सलाह: गड्ढे या बंकर से प्रतिदिन 15-20 सेमी सीधी परत में ही साइलेज निकालें। निकालने के तुरंत बाद प्लास्टिक शीट को टायरों के वजन से एयरटाइट दबा दें।`;
    }
    return `Pit Management Advice for ${ctx.sampleName}: Feed out at least 15 to 20 cm from the face daily in a clean vertical cut. Reseal the plastic sheet tightly with weights immediately to prevent aerobic spoilage.`;
  }

  // ----------------------------------------------------
  // Intent 7: Greeting / Context Summary
  // ----------------------------------------------------
  if (isGreeting) {
    if (language === 'kn') {
      return `ನಮಸ್ಕಾರ! ನಾನು FeedWise ಕಿಸಾನ್ AI ಸಹಾಯಕ. ಪ್ರಸ್ತುತ ನಾನು "${ctx.sampleName}" (pH: ${ctx.pH ?? 'N/A'}, ಫ್ಲೀಗ್: ${ctx.fliegScore ?? ctx.overallScore}, ಗ್ರೇಡ್: ${ctx.qualityGrade}) ಸ್ಯಾಂಪಲ್ ಪರೀಕ್ಷೆಯ ಆಧಾರದ ಮೇಲೆ ಉತ್ತರಿಸುತ್ತಿದ್ದೇನೆ. ನೀವು ಹಸುಗಳಿಗೆ ಆಹಾರ ನೀಡುವ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.`;
    }
    if (language === 'hi') {
      return `नमस्ते किसान भाई! मैं FeedWise किसान एआई सहायक हूँ। वर्तमान में मैं "${ctx.sampleName}" (pH: ${ctx.pH ?? 'N/A'}, फ्लीग: ${ctx.fliegScore ?? ctx.overallScore}, ग्रेड: ${ctx.qualityGrade}) जांच के आधार पर मार्गदर्शन कर रहा हूँ। आप कोई भी सवाल पूछ सकते हैं।`;
    }
    return `Namaste! I am your Kisan AI Assistant. I am currently answering based on "${ctx.sampleName}" (pH: ${ctx.pH ?? 'N/A'}, Flieg Score: ${ctx.fliegScore ?? ctx.overallScore}, Grade: ${ctx.qualityGrade}). Feel free to ask about feeding suitability, dosage, or nutrition in English, Kannada, or Hindi.`;
  }

  // ----------------------------------------------------
  // Default Dynamic Fallback grounded in the Current Scan
  // ----------------------------------------------------
  if (language === 'kn') {
    return `ಪ್ರಸ್ತುತ ಪರೀಕ್ಷೆಯ ಪ್ರಕಾರ (${ctx.sampleName}): ಗುಣಮಟ್ಟ ${ctx.qualityGrade}, ಒಣ ಪದಾರ್ಥ ${ctx.dryMatter ?? 34}%, ಮತ್ತು ಹಾಳಾಗುವ ಅಪಾಯ ${ctx.spoilageRisk} ಆಗಿದೆ. ಹಸುಗಳ ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಸಮತೋಲಿತ ಮೇವಿನೊಂದಿಗೆ 50 ಗ್ರಾಂ ಖನಿಜ ಮಿಶ್ರಣವನ್ನು ಪ್ರತಿದಿನ ನೀಡಿ.`;
  }
  if (language === 'hi') {
    return `वर्तमान जांच (${ctx.sampleName}) के अनुसार: गुणवत्ता ${ctx.qualityGrade}, शुष्क पदार्थ ${ctx.dryMatter ?? 34}%, और खराबी का खतरा ${ctx.spoilageRisk} है। पशुओं के बेहतर स्वास्थ्य के लिए संतुलित चारे के साथ 50 ग्राम मिनरल मिक्स अवश्य दें।`;
  }
  return `Based on the current analysis for ${ctx.sampleName}: Quality grade is ${ctx.qualityGrade}, Dry Matter is ${ctx.dryMatter ?? 34}%, and Spoilage Risk is ${ctx.spoilageRisk}. Provide balanced forage with 50-80g chelated mineral mix daily.`;
}
