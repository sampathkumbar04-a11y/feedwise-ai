export type FeedType =
  | 'silage'
  | 'green_fodder'
  | 'dry_roughage'
  | 'concentrate'
  | 'mineral_mix'
  | 'byproduct';

export interface NutritionValues {
  dryMatter: number; // %
  crudeProtein: number; // %
  totalDigestibleNutrients: number; // % (TDN)
  neutralDetergentFiber: number; // % (NDF)
  acidDetergentFiber: number; // % (ADF)
  metabolizableEnergy: number; // MJ/kg
  calcium: number; // %
  phosphorus: number; // %
  moisture: number; // %
}

export type FliegGrade = 'Very Good' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';

export interface FliegResult {
  fliegScore: number; // 0 - 100
  grade: FliegGrade;
  pH: number;
  dryMatter: number;
  lacticAcidPercent: number; // % of total acids
  aceticAcidPercent: number;
  butyricAcidPercent: number;
  ammoniaNitrogenPercent: number; // % of total N
  fermentationQualitySummary: string;
  feedingAdvisory: string;
  aerobicStabilityHours: number;
}

export type QualityGrade =
  | 'Grade A (Excellent)'
  | 'Grade B (Good)'
  | 'Grade C (Standard)'
  | 'Grade D (Substandard)'
  | 'Grade E (Hazardous)';

export interface FeedScanReport {
  id: string;
  timestamp: string;
  sampleName: string;
  feedType: FeedType;
  imageUrl: string;
  overallScore: number; // 0 - 100
  qualityGrade: QualityGrade;
  confidenceScore: number; // 0 - 100
  moistureEstimate: number; // %
  spoilageRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  moldDetected: boolean;
  mycotoxinRiskLevel: 'Safe' | 'Guarded' | 'Unsafe';
  physicalTexture: 'Crisp & Long-cut' | 'Slightly Chopped' | 'Fine Over-chopped' | 'Sludge / Mushy';
  odorProfile: 'Sweet & Aromatic' | 'Lactic / Mild Fruity' | 'Pungent Vinegar' | 'Foul Butyric / Mold';
  nutritionalValues: NutritionValues;
  fliegData?: FliegResult;
  recommendations: string[];
  safetyWarning?: string;
  assessedByRole?: string;
}

export interface Cattle {
  id: string;
  tagId: string;
  name: string;
  breed: string;
  category: 'Milking Cow' | 'Dry Cow' | 'Pregnant Heifer' | 'Buffalo' | 'Calf';
  bodyWeightKg: number;
  dailyMilkYieldLiters: number;
  milkFatPercent: number;
  lactationStage: 'Early (1-100d)' | 'Mid (101-200d)' | 'Late (201-305d)' | 'Dry';
  healthStatus: 'Healthy' | 'Needs Attention' | 'Under Treatment';
  currentDailyRationKg: number;
  targetMilkLiters: number;
  lastUpdated: string;
}

export interface RationItem {
  feedId: string;
  name: string;
  type: FeedType;
  amountKg: number;
  costPerKg: number;
  totalCost: number;
  providedDMKg: number;
  providedCPKg: number;
  providedTDNKg: number;
}

export interface RationOptimizationPlan {
  cattleId: string;
  cattleName: string;
  dailyDryMatterTargetKg: number;
  dailyCPTargetKg: number;
  dailyTDNTargetKg: number;
  calciumTargetGrams: number;
  phosphorusTargetGrams: number;
  dailyWaterRequirementLiters: number;
  items: RationItem[];
  totalDailyCost: number;
  costPerLiterMilk: number;
  estimatedDailyMilkYield: number;
  estimatedDailyProfitMargin: number;
  nutritionalAdequacyScore: number;
  advisorNotes: string[];
}

export interface WeatherRiskStatus {
  location: string;
  temperatureC: number;
  humidityPercent: number;
  thiIndex: number; // Temperature-Humidity Index
  heatStressLevel: 'Normal' | 'Mild Stress' | 'Moderate Stress' | 'Severe Stress';
  expectedRainfallMm: number;
  moldRiskScore: number; // 0 - 100
  mitigationSteps: string[];
  silageStorageAlert: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'en' | 'hi' | 'kn' | 'mr';
  suggestedActions?: string[];
}
