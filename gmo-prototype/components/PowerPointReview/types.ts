/**
 * TypeScript types for PowerPoint AI Review components
 */

export interface SlidePreview {
  slideIndex: number;
  slideType: string;
  imageData: string;
  imageDataUri: string;
  dimensions: {
    width: number;
    height: number;
  };
  sectionNumber?: number | null;
}

export interface ReviewSuggestion {
  slideIndex: number;
  slideType: string;
  category: 'textLength' | 'chartSize' | 'bulletCount' | 'colorAccuracy' | 'placeholder' | 'layoutAlignment';
  severity: 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
  affectedElement: string;
  currentValue?: string | null;
  expectedValue?: string | null;
}

export interface ReviewResult {
  success: boolean;
  overallScore: number;
  suggestions: ReviewSuggestion[];
  positives: string[];
  summary: string;
  metadata: {
    model: string;
    slidesReviewed: number;
    responseTimeMs: number;
    reviewedAt: string;
  };
}

export interface PreviewResponse {
  success: boolean;
  reportId: string;
  reportTitle: string;
  previews: SlidePreview[];
  metadata: {
    totalSlides: number;
    previewedSlides: number;
    onePerType: boolean;
    generatedAt: string;
  };
}

export type ReviewStep = 'idle' | 'generating' | 'previewing' | 'reviewing' | 'results' | 'error';

export interface ReviewState {
  step: ReviewStep;
  previews: SlidePreview[];
  review: ReviewResult | null;
  selectedSuggestions: Set<number>;
  error: string | null;
}
