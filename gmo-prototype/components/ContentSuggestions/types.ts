/**
 * Types for AI-generated content suggestions
 */

export interface FieldSuggestion {
  suggested: string | string[];
  reasoning: string;
}

export interface ContentSuggestions {
  title?: FieldSuggestion;
  subtitle?: FieldSuggestion;
  content?: FieldSuggestion;
  insights?: FieldSuggestion; // For chartInsightsSection
}

export interface ContentSuggestResponse {
  success: boolean;
  suggestions: ContentSuggestions;
  metadata: {
    model: string;
    responseTimeMs: number;
    generatedAt: string;
  };
}

export type SuggestionStep = 'idle' | 'generating' | 'reviewing' | 'error';

export interface SelectedFields {
  title: boolean;
  subtitle: boolean;
  content: boolean;
  insights: boolean;
}

export interface SectionData {
  title?: string;
  subtitle?: string;
  content?: any[];
  insights?: string[];
  hasChart?: boolean;
  chartConfig?: {
    chartType?: string;
    chartData?: string;
    chartSeries?: Array<{
      label: string;
      dataColumn: string;
      colour: string;
    }>;
    xAxisLabel?: string;
    yAxisLabel?: string;
    yAxisFormat?: string;
  };
}

export type SectionType = 'contentSection' | 'chartInsightsSection';
