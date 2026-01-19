import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileUploadArea } from './FileUploadArea';
import { ChartPreview } from './ChartPreview';
import { AlternativesThumbnails } from './AlternativesThumbnails';
import { parseFile, analyzeChartData } from './utils';
import { ChartRecommendation, ChartBuilderValue } from './types';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ErrorMessage,
  LoadingSpinner
} from './styles';

interface Props {
  initialValue?: ChartBuilderValue;
  onSave: (config: ChartBuilderValue) => void;
  onCancel: () => void;
}

export function ChartBuilderModal({ initialValue, onSave, onCancel }: Props) {
  const [csvData, setCsvData] = useState<string | null>(initialValue?.chartData || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainRecommendation, setMainRecommendation] = useState<ChartRecommendation | null>(null);
  const [alternatives, setAlternatives] = useState<ChartRecommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setIsAnalyzing(true);

      // Parse file to CSV
      const csv = await parseFile(file);
      setCsvData(csv);

      // Analyze with Claude
      const { main, alternatives: alts } = await analyzeChartData(csv);
      setMainRecommendation(main);
      setAlternatives(alts);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAlternativeClick = (index: number) => {
    if (!mainRecommendation) return;

    // Swap clicked alternative with main
    const newAlternatives = [...alternatives];
    const clickedChart = newAlternatives[index];
    newAlternatives[index] = mainRecommendation;

    setMainRecommendation(clickedChart);
    setAlternatives(newAlternatives);
    setSelectedIndex(index);
  };

  const handleSave = () => {
    if (!mainRecommendation || !csvData) return;

    onSave({
      chartType: mainRecommendation.chartType,
      chartData: csvData,
      chartSeries: mainRecommendation.series,
      xAxisLabel: mainRecommendation.xAxisLabel,
      yAxisLabel: mainRecommendation.yAxisLabel,
      yAxisFormat: mainRecommendation.yAxisFormat
    });
  };

  return createPortal(
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Chart Builder</h2>
          <button onClick={onCancel}>×</button>
        </ModalHeader>

        <ModalBody>
          {!csvData && (
            <FileUploadArea onFileUpload={handleFileUpload} />
          )}

          {isAnalyzing && (
            <LoadingSpinner>
              <div className="spinner" />
              <p>Analyzing your data with Claude...</p>
            </LoadingSpinner>
          )}

          {error && (
            <ErrorMessage>
              <strong>Error:</strong> {error}
              <Button onClick={() => setError(null)}>Dismiss</Button>
            </ErrorMessage>
          )}

          {mainRecommendation && csvData && !isAnalyzing && (
            <>
              <ChartPreview
                recommendation={mainRecommendation}
                csvData={csvData}
              />

              {alternatives.length > 0 && (
                <AlternativesThumbnails
                  alternatives={alternatives}
                  csvData={csvData}
                  onSelect={handleAlternativeClick}
                />
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={!mainRecommendation}
          >
            Save Chart
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
}
