import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileUploadArea } from './FileUploadArea';
import { ImageUploadArea } from './ImageUploadArea';
import { EditableDataTable } from './EditableDataTable';
import { ChartPreview } from './ChartPreview';
import { AlternativesThumbnails } from './AlternativesThumbnails';
import { parseFile, analyzeChartData, readImageAsBase64, analyzeChartImage } from './utils';
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
  mode: 'csv' | 'image';
}

export function ChartBuilderModal({ initialValue, onSave, onCancel, mode }: Props) {
  // Helper to reconstruct recommendation from saved value
  const getInitialRecommendation = (): ChartRecommendation | null => {
    if (initialValue?.chartType && initialValue?.chartSeries?.length) {
      return {
        chartType: initialValue.chartType as ChartRecommendation['chartType'],
        series: initialValue.chartSeries,
        xAxisLabel: initialValue.xAxisLabel || '',
        yAxisLabel: initialValue.yAxisLabel || '',
        yAxisFormat: (initialValue.yAxisFormat as ChartRecommendation['yAxisFormat']) || 'number',
        reasoning: 'Previously saved configuration',
      };
    }
    return null;
  };

  const [csvData, setCsvData] = useState<string | null>(initialValue?.chartData || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mainRecommendation, setMainRecommendation] = useState<ChartRecommendation | null>(getInitialRecommendation());
  const [alternatives, setAlternatives] = useState<ChartRecommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  // Auto-regenerate alternatives when editing a saved chart
  useEffect(() => {
    if (initialValue?.chartData && mainRecommendation && alternatives.length === 0 && !isAnalyzing) {
      setIsLoadingAlternatives(true);
      analyzeChartData(initialValue.chartData)
        .then(({ alternatives: alts }) => {
          const filtered = alts.filter(a => a.chartType !== mainRecommendation.chartType);
          setAlternatives(filtered);
        })
        .catch(err => {
          console.error('Failed to load alternatives:', err);
        })
        .finally(() => {
          setIsLoadingAlternatives(false);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      setIsAnalyzing(true);

      // Read image as base64
      const { base64, mediaType } = await readImageAsBase64(file);

      // Analyze with Claude Vision
      const { main, alternatives: alts, csvData: extractedCsv } = await analyzeChartImage(base64, mediaType);

      setCsvData(extractedCsv);
      setMainRecommendation(main);
      setAlternatives(alts);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCsvDataChange = (newCsv: string) => {
    setCsvData(newCsv);
  };

  const handleHeaderRename = (oldName: string, newName: string) => {
    // Update series dataColumn and label when a CSV header is renamed
    const updateSeries = (s: { label: string; dataColumn: string; colour: string }) =>
      s.dataColumn === oldName ? { ...s, dataColumn: newName, label: newName } : s;

    if (mainRecommendation) {
      setMainRecommendation({
        ...mainRecommendation,
        series: mainRecommendation.series.map(updateSeries),
      });
    }
    setAlternatives(prev => prev.map(alt => ({
      ...alt,
      series: alt.series.map(updateSeries),
    })));
  };

  const handleRetry = () => {
    setError(null);
    setCsvData(null);
    setMainRecommendation(null);
    setAlternatives([]);
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
      yAxisFormat: mainRecommendation.yAxisFormat,
      sourceMode: mode,
    });
  };

  return createPortal(
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{mode === 'image' ? 'Chart Image Import' : 'Chart Builder'}</h2>
          <button onClick={onCancel}>×</button>
        </ModalHeader>

        <ModalBody>
          {!csvData && !isAnalyzing && (
            mode === 'csv'
              ? <FileUploadArea onFileUpload={handleFileUpload} />
              : <ImageUploadArea onImageUpload={handleImageUpload} />
          )}

          {isAnalyzing && (
            <LoadingSpinner>
              <div className="spinner" />
              <p>{mode === 'image'
                ? 'Analyzing chart image with AI...'
                : 'Analyzing your data with Claude...'
              }</p>
            </LoadingSpinner>
          )}

          {error && (
            <ErrorMessage>
              <strong>Error:</strong> {error}
              <Button onClick={handleRetry}>Try Again</Button>
            </ErrorMessage>
          )}

          {mainRecommendation && csvData && !isAnalyzing && (
            <>
              <ChartPreview
                recommendation={mainRecommendation}
                csvData={csvData}
              />

              {mode === 'image' && (
                <EditableDataTable
                  csvData={csvData}
                  onDataChange={handleCsvDataChange}
                  onHeaderRename={handleHeaderRename}
                />
              )}

              {isLoadingAlternatives && (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
                  Loading alternative chart options...
                </div>
              )}

              {!isLoadingAlternatives && alternatives.length > 0 && (
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
