/**
 * ContentSuggestModal Component
 *
 * Modal for generating and reviewing AI content suggestions.
 * Follows the PowerPointReviewModal pattern.
 */

import React, { useState, useCallback, useEffect } from 'react';
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
} from '@sanity/ui';
import { CheckmarkCircleIcon, CloseCircleIcon, SparklesIcon } from '@sanity/icons';
import { SuggestionCard } from './SuggestionCard';
import { generateContentSuggestions, stringsToPortableText, portableTextToStrings } from './utils';
import type {
  ContentSuggestions,
  SuggestionStep,
  SelectedFields,
  SectionData,
  SectionType,
} from './types';

interface ContentSuggestModalProps {
  sectionData: SectionData;
  sectionType: SectionType;
  reportTitle?: string;
  onAccept: (fields: Partial<SectionData>) => void;
  onClose: () => void;
}

const fieldLabels: Record<string, string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  content: 'Content Bullets',
  insights: 'Key Insights',
};

export function ContentSuggestModal({
  sectionData,
  sectionType,
  reportTitle,
  onAccept,
  onClose,
}: ContentSuggestModalProps) {
  const [step, setStep] = useState<SuggestionStep>('idle');
  const [suggestions, setSuggestions] = useState<ContentSuggestions | null>(null);
  const [selected, setSelected] = useState<SelectedFields>({
    title: true,
    subtitle: true,
    content: true,
    insights: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Auto-generate on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = useCallback(async () => {
    setStep('generating');
    setError(null);

    try {
      const response = await generateContentSuggestions(
        sectionType,
        sectionData,
        reportTitle ? { reportTitle } : undefined
      );

      setSuggestions(response.suggestions);
      setResponseTime(response.metadata.responseTimeMs);

      // Pre-select fields that have suggestions
      setSelected({
        title: !!response.suggestions.title,
        subtitle: !!response.suggestions.subtitle,
        content: !!response.suggestions.content,
        insights: !!response.suggestions.insights,
      });

      setStep('reviewing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      setStep('error');
    }
  }, [sectionType, sectionData, reportTitle]);

  const handleAccept = useCallback(() => {
    if (!suggestions) return;

    const acceptedFields: Partial<SectionData> = {};

    if (selected.title && suggestions.title) {
      acceptedFields.title = suggestions.title.suggested as string;
    }

    if (selected.subtitle && suggestions.subtitle) {
      acceptedFields.subtitle = suggestions.subtitle.suggested as string;
    }

    if (selected.content && suggestions.content) {
      // Convert string array to Portable Text blocks
      acceptedFields.content = stringsToPortableText(
        suggestions.content.suggested as string[]
      );
    }

    if (selected.insights && suggestions.insights) {
      acceptedFields.insights = suggestions.insights.suggested as string[];
    }

    onAccept(acceptedFields);
  }, [suggestions, selected, onAccept]);

  const toggleField = (field: keyof SelectedFields) => {
    setSelected((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const availableCount = suggestions
    ? Object.keys(suggestions).filter((k) => suggestions[k as keyof ContentSuggestions]).length
    : 0;

  const renderContent = () => {
    switch (step) {
      case 'idle':
      case 'generating':
        return (
          <Flex align="center" justify="center" padding={5}>
            <Stack space={3} style={{ textAlign: 'center' }}>
              <Spinner muted />
              <Text muted>Analyzing chart data with AI...</Text>
              <Text size={1} muted>
                Generating content suggestions
              </Text>
            </Stack>
          </Flex>
        );

      case 'reviewing':
        return (
          <Stack space={4}>
            {/* Header with stats */}
            <Card padding={3} radius={2} tone="primary">
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={2}>
                  <SparklesIcon />
                  <Text weight="semibold">AI Content Suggestions</Text>
                </Flex>
                <Flex gap={2}>
                  <Badge tone="primary">
                    {selectedCount} of {availableCount} selected
                  </Badge>
                  {responseTime && (
                    <Badge mode="outline" fontSize={0}>
                      {(responseTime / 1000).toFixed(1)}s
                    </Badge>
                  )}
                </Flex>
              </Flex>
            </Card>

            {/* Suggestion cards */}
            <Stack space={3}>
              {suggestions?.title && (
                <SuggestionCard
                  fieldName="title"
                  fieldLabel={fieldLabels.title}
                  currentValue={sectionData.title}
                  suggestion={suggestions.title}
                  isSelected={selected.title}
                  onToggle={() => toggleField('title')}
                />
              )}

              {suggestions?.subtitle && (
                <SuggestionCard
                  fieldName="subtitle"
                  fieldLabel={fieldLabels.subtitle}
                  currentValue={sectionData.subtitle}
                  suggestion={suggestions.subtitle}
                  isSelected={selected.subtitle}
                  onToggle={() => toggleField('subtitle')}
                />
              )}

              {suggestions?.content && (
                <SuggestionCard
                  fieldName="content"
                  fieldLabel={fieldLabels.content}
                  currentValue={portableTextToStrings(sectionData.content || [])}
                  suggestion={suggestions.content}
                  isSelected={selected.content}
                  onToggle={() => toggleField('content')}
                />
              )}

              {suggestions?.insights && (
                <SuggestionCard
                  fieldName="insights"
                  fieldLabel={fieldLabels.insights}
                  currentValue={sectionData.insights}
                  suggestion={suggestions.insights}
                  isSelected={selected.insights}
                  onToggle={() => toggleField('insights')}
                />
              )}
            </Stack>

            {/* Action buttons */}
            <Flex gap={3} justify="flex-end">
              <Button mode="ghost" text="Decline All" onClick={onClose} />
              <Button
                mode="ghost"
                text="Regenerate"
                onClick={handleGenerate}
                icon={SparklesIcon}
              />
              <Button
                tone="primary"
                text={`Accept Selected (${selectedCount})`}
                onClick={handleAccept}
                disabled={selectedCount === 0}
                icon={CheckmarkCircleIcon}
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
              <Button text="Try Again" onClick={handleGenerate} />
              <Button mode="ghost" text="Close" onClick={onClose} />
            </Flex>
          </Stack>
        );
    }
  };

  return (
    <Dialog
      id="content-suggest-modal"
      header="Generate Content with AI"
      width={2}
      onClose={onClose}
      open={true}
    >
      <Box padding={4}>{renderContent()}</Box>
    </Dialog>
  );
}
