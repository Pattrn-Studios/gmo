/**
 * PowerPointReviewModal Component
 *
 * Main modal for the AI-enhanced PowerPoint export workflow.
 * Handles preview generation, AI review, and export with suggestions.
 */

import React, {useState, useCallback} from 'react';
import {
  Dialog,
  Card,
  Stack,
  Text,
  Button,
  Spinner,
  Flex,
  Box,
  Badge,
  Grid,
} from '@sanity/ui';
import {DownloadIcon, CheckmarkCircleIcon, CloseCircleIcon} from '@sanity/icons';
import {SlidePreviewGallery} from './SlidePreviewGallery';
import {SuggestionsList} from './SuggestionsList';
import type {
  SlidePreview,
  ReviewResult,
  PreviewResponse,
  ReviewStep,
} from './types';

const API_BASE = 'https://gmo-builder.vercel.app';

interface PowerPointReviewModalProps {
  reportId: string;
  reportTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onExportComplete: () => void;
}

export function PowerPointReviewModal({
  reportId,
  reportTitle,
  isOpen,
  onClose,
  onExportComplete,
}: PowerPointReviewModalProps) {
  const [step, setStep] = useState<ReviewStep>('idle');
  const [previews, setPreviews] = useState<SlidePreview[]>([]);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set()
  );
  const [highlightedSlide, setHighlightedSlide] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Generate slide previews
  const generatePreviews = useCallback(async () => {
    setStep('generating');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/pptx-preview`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reportId, onePerType: true}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Preview generation failed');
      }

      const data: PreviewResponse = await response.json();
      setPreviews(data.previews);
      setStep('previewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview generation failed');
      setStep('error');
    }
  }, [reportId]);

  // Request AI review
  const requestReview = useCallback(async () => {
    if (previews.length === 0) return;

    setStep('reviewing');
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/pptx-review`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          previews: previews.map((p) => ({
            slideIndex: p.slideIndex,
            slideType: p.slideType,
            imageData: p.imageData,
            sectionNumber: p.sectionNumber,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI review failed');
      }

      const data: ReviewResult = await response.json();
      setReview(data);

      // Auto-select high severity suggestions
      const highSeverityIndices = data.suggestions
        .map((s, i) => (s.severity === 'high' ? i : -1))
        .filter((i) => i >= 0);
      setSelectedSuggestions(new Set(highSeverityIndices));

      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI review failed');
      setStep('error');
    }
  }, [previews]);

  // Export PowerPoint
  const exportPowerPoint = useCallback(async () => {
    setStep('generating');

    try {
      const response = await fetch(`${API_BASE}/api/pptx-export`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reportId}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle || 'report'}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onExportComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setStep('error');
    }
  }, [reportId, reportTitle, onExportComplete, onClose]);

  // Toggle suggestion selection
  const toggleSuggestion = useCallback((index: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Render content based on current step
  const renderContent = () => {
    switch (step) {
      case 'idle':
        return (
          <Stack space={4}>
            <Text>
              Generate slide previews and get AI-powered design suggestions before
              exporting your PowerPoint presentation.
            </Text>
            <Flex gap={3}>
              <Button
                tone="primary"
                text="Generate Previews"
                onClick={generatePreviews}
              />
              <Button
                mode="ghost"
                text="Skip Review & Export"
                icon={DownloadIcon}
                onClick={exportPowerPoint}
              />
            </Flex>
          </Stack>
        );

      case 'generating':
        return (
          <Flex align="center" justify="center" padding={5}>
            <Stack space={3} style={{textAlign: 'center'}}>
              <Spinner muted />
              <Text muted>Generating slide previews...</Text>
            </Stack>
          </Flex>
        );

      case 'previewing':
        return (
          <Stack space={4}>
            <Text weight="semibold">
              Preview ({previews.length} slides)
            </Text>
            <SlidePreviewGallery
              previews={previews}
              highlightedSlide={highlightedSlide}
              onSlideClick={setHighlightedSlide}
            />
            <Flex gap={3}>
              <Button
                tone="primary"
                text="Get AI Review"
                onClick={requestReview}
              />
              <Button
                mode="ghost"
                text="Export Without Review"
                icon={DownloadIcon}
                onClick={exportPowerPoint}
              />
            </Flex>
          </Stack>
        );

      case 'reviewing':
        return (
          <Flex align="center" justify="center" padding={5}>
            <Stack space={3} style={{textAlign: 'center'}}>
              <Spinner muted />
              <Text muted>Analyzing slides with AI...</Text>
              <Text size={1} muted>
                This may take a few seconds
              </Text>
            </Stack>
          </Flex>
        );

      case 'results':
        return (
          <Stack space={4}>
            {/* Score Header */}
            <Card padding={3} radius={2} tone="primary">
              <Flex align="center" justify="space-between">
                <Stack space={2}>
                  <Text weight="semibold">Design Score</Text>
                  <Flex align="baseline" gap={2}>
                    <Text size={4} weight="bold">
                      {review?.overallScore || 0}
                    </Text>
                    <Text muted>/100</Text>
                  </Flex>
                </Stack>
                <Stack space={2} style={{textAlign: 'right'}}>
                  <Flex gap={2}>
                    {review?.suggestions?.filter((s) => s.severity === 'high')
                      .length ? (
                      <Badge tone="critical">
                        {
                          review.suggestions.filter((s) => s.severity === 'high')
                            .length
                        }{' '}
                        High
                      </Badge>
                    ) : null}
                    {review?.suggestions?.filter((s) => s.severity === 'medium')
                      .length ? (
                      <Badge tone="caution">
                        {
                          review.suggestions.filter(
                            (s) => s.severity === 'medium'
                          ).length
                        }{' '}
                        Medium
                      </Badge>
                    ) : null}
                  </Flex>
                </Stack>
              </Flex>
            </Card>

            {/* Summary */}
            {review?.summary && (
              <Text size={1} muted>
                {review.summary}
              </Text>
            )}

            {/* Two-column layout: Previews | Suggestions */}
            <Grid columns={[1, 1, 2]} gap={4}>
              <Box>
                <Stack space={3}>
                  <Text size={1} weight="semibold">
                    Slide Previews
                  </Text>
                  <SlidePreviewGallery
                    previews={previews}
                    highlightedSlide={highlightedSlide}
                    onSlideClick={setHighlightedSlide}
                  />
                </Stack>
              </Box>
              <Box>
                <Stack space={3}>
                  <Flex align="center" justify="space-between">
                    <Text size={1} weight="semibold">
                      Suggestions ({review?.suggestions?.length || 0})
                    </Text>
                    {selectedSuggestions.size > 0 && (
                      <Badge tone="primary">
                        {selectedSuggestions.size} selected
                      </Badge>
                    )}
                  </Flex>
                  <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                    <SuggestionsList
                      suggestions={review?.suggestions || []}
                      selectedIds={selectedSuggestions}
                      onToggle={toggleSuggestion}
                      onHighlightSlide={setHighlightedSlide}
                    />
                  </div>
                </Stack>
              </Box>
            </Grid>

            {/* Positives */}
            {review?.positives && review.positives.length > 0 && (
              <Card padding={3} radius={2} tone="positive">
                <Stack space={2}>
                  <Flex align="center" gap={2}>
                    <CheckmarkCircleIcon />
                    <Text size={1} weight="semibold">
                      Strengths
                    </Text>
                  </Flex>
                  <Stack space={1}>
                    {review.positives.map((positive, i) => (
                      <Text key={i} size={1}>
                        {positive}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Export Button */}
            <Flex gap={3} justify="flex-end">
              <Button
                mode="ghost"
                text="Back to Previews"
                onClick={() => setStep('previewing')}
              />
              <Button
                tone="primary"
                text="Export PowerPoint"
                icon={DownloadIcon}
                onClick={exportPowerPoint}
              />
            </Flex>
          </Stack>
        );

      case 'error':
        return (
          <Stack space={4}>
            <Card padding={4} radius={2} tone="critical">
              <Flex align="center" gap={3}>
                <CloseCircleIcon />
                <Stack space={2}>
                  <Text weight="semibold">Error</Text>
                  <Text size={1}>{error}</Text>
                </Stack>
              </Flex>
            </Card>
            <Flex gap={3}>
              <Button text="Try Again" onClick={generatePreviews} />
              <Button
                mode="ghost"
                text="Export Anyway"
                icon={DownloadIcon}
                onClick={exportPowerPoint}
              />
            </Flex>
          </Stack>
        );
    }
  };

  return (
    <Dialog
      id="pptx-review-modal"
      header="PowerPoint Export with AI Review"
      width={step === 'results' ? 3 : 2}
      onClose={onClose}
      open={isOpen}
    >
      <Box padding={4}>{renderContent()}</Box>
    </Dialog>
  );
}
