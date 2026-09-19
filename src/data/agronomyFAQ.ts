export interface FAQItem {
  keywords: string[];
  question: string;
  answerEn: string;
  answerHi: string;
  answerKn: string;
  category: 'silage' | 'ration' | 'cattle_health' | 'flieg_score';
}

export const AGRONOMY_FAQ: FAQItem[] = [
  {
    keywords: ['flieg', 'score', 'silage quality', 'फ्लीग', 'ಸ್ಕೋರ್'],
    question: 'What is the Flieg Score and how does it measure silage quality?',
    answerEn:
      'The Flieg Score is a standard scientific index (0-100) evaluating silage fermentation based on Dry Matter (DM%) and pH. Scores 81-100 indicate "Very Good" silage rich in beneficial lactic acid and low in undesirable butyric acid. Scores below 40 indicate clostridial spoilage which can cause ketosis in dairy cows.',
    answerHi:
      'फ्लीग स्कोर (Flieg Score) 0 से 100 के पैमाने पर साइलेज के किण्वन (Fermentation) की गुणवत्ता नापता है। यह शुष्क पदार्थ (DM%) और pH पर आधारित होता है। 81-100 स्कोर सर्वोत्तम साइलेज दर्शाता है जिसमें लैक्टिक एसिड अधिक और ब्यूटिरिक एसिड नगण्य होता है। 40 से नीचे का स्कोर खराब साइलेज दर्शाता है।',
    answerKn:
      'ಫ್ಲೀಗ್ ಸ್ಕೋರ್ ಸೈಲೇಜ್‌ನ ಹುದುಗುವಿಕೆಯ (Fermentation) ಗುಣಮಟ್ಟವನ್ನು 0 ರಿಂದ 100 ರ ಮಾಪಕದಲ್ಲಿ ಅಳೆಯುತ್ತದೆ. 81-100 ಅಂಕಗಳು ಅತ್ಯುತ್ತಮ ಗುಣಮಟ್ಟದ ಸೈಲೇಜ್ ಅನ್ನು ಸೂಚಿಸುತ್ತವೆ. 40 ಕ್ಕಿಂತ ಕಡಿಮೆಯಿದ್ದರೆ ಹಸುಗಳಿಗೆ ನೀಡಬಾರದು.',
    category: 'flieg_score',
  },
  {
    keywords: ['silage making', 'how to make silage', 'साइलेज कैसे बनाएं', 'ಸೈಲೇಜ್'],
    question: 'What is the best stage to harvest corn for silage?',
    answerEn:
      'Harvest whole-plant maize at the 1/2 to 2/3 milk line stage (when kernels are dented and about 32-35% Dry Matter). Chop to 1.5 - 2.0 cm length, pack very tightly to expel all air (oxygen), and seal airtight within 24 hours.',
    answerHi:
      'मक्का साइलेज के लिए फसल को तब काटें जब दानों में दूधियापन आधा खत्म हो चुका हो (1/2 milk-line) और पौधे में 30-35% शुष्क पदार्थ हो। टुकड़े 1.5 से 2 सेमी के काटें और गड्ढे में हवा पूरी तरह निकालकर अच्छी तरह दबाएं (Tamping), फिर 24 घंटे में प्लास्टिक से एयरटाइट बंद करें।',
    answerKn:
      'ಮುಸುಕಿನ ಜೋಳದ ಸೈಲೇಜ್‌ಗಾಗಿ ಕಾಳುಗಳಲ್ಲಿ ಹಾಲು ಅರ್ಧ ಗಟ್ಟಿಯಾದಾಗ (32-35% ಒಣ ಪದಾರ್ಥ) ಕಟಾವು ಮಾಡಬೇಕು. 1.5 - 2 ಸೆಂ.ಮೀ ಕತ್ತರಿಸಿ, ಗಾಳಿ ಇರದಂತೆ ಒತ್ತಿ ಸೀಲ್ ಮಾಡಬೇಕು.',
    category: 'silage',
  },
  {
    keywords: ['milk fat', 'fat snf', 'फैट', 'ಫ್ಯಾಟ್'],
    question: 'How can I increase milk fat and SNF percentage in dairy cattle?',
    answerEn:
      'To boost milk fat: 1) Ensure at least 2-3 kg dry wheat or paddy straw daily to stimulate rumination (cud-chewing) and acetic acid production. 2) Feed cottonseed cake or roasted bypass fat. 3) Avoid feeding finely ground starch flours; use cracked grains instead. 4) Feed 50-80g mineral mix and 30-50g sodium bicarbonate (baking soda) daily.',
    answerHi:
      'दूध में फैट और SNF बढ़ाने के लिए: 1) प्रतिदिन कम से कम 2-3 किलो सूखा भूसा जरूर दें ताकि जुगाली से एसिटिक एसिड बने। 2) बिनौला खल या बाईपास फैट आहार में शामिल करें। 3) महीन पिसा हुआ आटा न दें, दरदरा दलिया दें। 4) 50-80 ग्राम मिनरल मिक्स और 30-50 ग्राम मीठा सोडा (Baking Soda) रोजाना दें।',
    answerKn:
      'ಹಾಲಿನ ಕೊಬ್ಬು (ಫ್ಯಾಟ್) ಹೆಚ್ಚಿಸಲು: ಪ್ರತಿದಿನ 2-3 ಕೆಜಿ ಒಣ ಹುಲ್ಲು ನೀಡಿ. ಹತ್ತಿಬೀಜದ ಹಿಂಡಿ ಅಥವಾ ಬೈಪಾಸ್ ಕೊಬ್ಬು ಬಳಸಿ. ಪ್ರತಿದಿನ 50-80 ಗ್ರಾಂ ಖನಿಜ ಮಿಶ್ರಣ ಮತ್ತು ಅಡುಗೆ ಸೋಡಾ ನೀಡಿ.',
    category: 'ration',
  },
  {
    keywords: ['heat stress', 'thi', 'summer', 'गर्मी', 'ಬಿಸಿಲು'],
    question: 'How do I protect dairy cows from heat stress (high THI)?',
    answerEn:
      'When THI > 72: 1) Provide abundant cool drinking water under shade (cows drink 100-150L on hot days). 2) Run misting sprinklers and high-speed fans during peak sun (11 AM - 4 PM). 3) Shift 60% of feed to evening and early morning. 4) Add electrolytes and dietary buffer to prevent rumen acidosis.',
    answerHi:
      'गर्मी और उमस (THI > 72) में: 1) पशुओं को 24 घंटे छायादार जगह में ठंडा व स्वच्छ पानी उपलब्ध कराएं (एक गाय 100-150 लीटर पानी पीती है)। 2) दोपहर 11 से 4 बजे तक पंखे और फव्वारे (Misting) चलाएं। 3) 60% चारा सुबह-शाम ठंडे समय खिलाएं। 4) आहार में मीठा सोडा और इलेक्ट्रोलाइट्स शामिल करें।',
    answerKn:
      'ಶಾಖದ ಒತ್ತಡದಲ್ಲಿ (THI > 72): ನೆರಳಿನಲ್ಲಿ ತಂಪಾದ ನೀರು ಸದಾ ಇರಲಿ. ಮಧ್ಯಾಹ್ನ ಫ್ಯಾನ್ ಮತ್ತು ಸ್ಪ್ರಿಂಕ್ಲರ್ ಬಳಸಿ. ಮುಂಜಾನೆ ಮತ್ತು ಸಂಜೆ ಹೆಚ್ಚು ಆಹಾರ ನೀಡಿ.',
    category: 'cattle_health',
  },
];
