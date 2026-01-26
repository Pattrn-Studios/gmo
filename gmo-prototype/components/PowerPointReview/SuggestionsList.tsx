/**
 * SuggestionsList Component
 *
 * Displays AI review suggestions grouped by severity with selection toggles.
 */

import React from 'react';
import {Card, Stack, Text, Badge, Checkbox, Flex, Box} from '@sanity/ui';
import type {ReviewSuggestion} from './types';

interface SuggestionsListProps {
  suggestions: ReviewSuggestion[];
  selectedIds: Set<number>;
  onToggle: (index: number) => void;
  onHighlightSlide: (slideIndex: number) => void;
}

const severityConfig = {
  high: {tone: 'critical' as const, label: 'High Priority'},
  medium: {tone: 'caution' as const, label: 'Medium Priority'},
  low: {tone: 'positive' as const, label: 'Low Priority'},
};

const categoryLabels: Record<string, string> = {
  typography: 'Typography',
  color: 'Color',
  layout: 'Layout',
  chartClarity: 'Chart Clarity',
  whitespace: 'White Space',
  content: 'Content',
};

function SuggestionCard({
  suggestion,
  index,
  isSelected,
  onToggle,
  onHighlight,
}: {
  suggestion: ReviewSuggestion;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
  onHighlight: () => void;
}) {
  const config = severityConfig[suggestion.severity];

  return (
    <Card padding={3} radius={2} tone={config.tone} shadow={1}>
      <Stack space={3}>
        <Flex align="flex-start" gap={3}>
          <Box>
            <Checkbox checked={isSelected} onChange={onToggle} />
          </Box>
          <Stack space={2} style={{flex: 1}}>
            <Flex gap={2} wrap="wrap">
              <Badge tone={config.tone} mode="outline" fontSize={0}>
                {suggestion.severity.toUpperCase()}
              </Badge>
              <Badge mode="outline" fontSize={0}>
                {categoryLabels[suggestion.category] || suggestion.category}
              </Badge>
              <Badge
                mode="outline"
                fontSize={0}
                style={{cursor: 'pointer'}}
                onClick={onHighlight}
              >
                Slide {suggestion.slideIndex + 1}
              </Badge>
            </Flex>
            <Text size={1} weight="semibold">
              {suggestion.issue}
            </Text>
            <Text size={1} muted>
              {suggestion.recommendation}
            </Text>
            {suggestion.affectedElement && (
              <Text size={0} muted>
                Element: {suggestion.affectedElement}
              </Text>
            )}
          </Stack>
        </Flex>
      </Stack>
    </Card>
  );
}

export function SuggestionsList({
  suggestions,
  selectedIds,
  onToggle,
  onHighlightSlide,
}: SuggestionsListProps) {
  // Group suggestions by severity
  const grouped = {
    high: suggestions.filter((s) => s.severity === 'high'),
    medium: suggestions.filter((s) => s.severity === 'medium'),
    low: suggestions.filter((s) => s.severity === 'low'),
  };

  const renderGroup = (
    severity: 'high' | 'medium' | 'low',
    items: ReviewSuggestion[]
  ) => {
    if (items.length === 0) return null;

    const config = severityConfig[severity];

    return (
      <Stack space={3} key={severity}>
        <Flex align="center" gap={2}>
          <Text size={1} weight="semibold">
            {config.label}
          </Text>
          <Badge tone={config.tone} fontSize={0}>
            {items.length}
          </Badge>
        </Flex>
        <Stack space={2}>
          {items.map((suggestion) => {
            const globalIndex = suggestions.indexOf(suggestion);
            return (
              <SuggestionCard
                key={globalIndex}
                suggestion={suggestion}
                index={globalIndex}
                isSelected={selectedIds.has(globalIndex)}
                onToggle={() => onToggle(globalIndex)}
                onHighlight={() => onHighlightSlide(suggestion.slideIndex)}
              />
            );
          })}
        </Stack>
      </Stack>
    );
  };

  if (suggestions.length === 0) {
    return (
      <Card padding={4} radius={2} tone="positive">
        <Text align="center">No suggestions - your slides look great!</Text>
      </Card>
    );
  }

  return (
    <Stack space={4}>
      {renderGroup('high', grouped.high)}
      {renderGroup('medium', grouped.medium)}
      {renderGroup('low', grouped.low)}
    </Stack>
  );
}
