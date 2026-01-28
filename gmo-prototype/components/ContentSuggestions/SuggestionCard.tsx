/**
 * SuggestionCard Component
 *
 * Displays a single field suggestion with current vs suggested values
 * and a checkbox for selection.
 */

import React from 'react';
import { Card, Stack, Text, Checkbox, Flex, Box, Badge } from '@sanity/ui';
import type { FieldSuggestion } from './types';

interface SuggestionCardProps {
  fieldName: string;
  fieldLabel: string;
  currentValue: string | string[] | undefined;
  suggestion: FieldSuggestion;
  isSelected: boolean;
  onToggle: () => void;
}

function formatValue(value: string | string[] | undefined): string {
  if (!value) return '(empty)';
  if (Array.isArray(value)) {
    if (value.length === 0) return '(empty)';
    return value.join(' • ');
  }
  return value;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function SuggestionCard({
  fieldName,
  fieldLabel,
  currentValue,
  suggestion,
  isSelected,
  onToggle,
}: SuggestionCardProps) {
  const currentDisplay = formatValue(currentValue);
  const suggestedDisplay = formatValue(suggestion.suggested);
  const hasChange = currentDisplay !== suggestedDisplay;

  return (
    <Card
      padding={3}
      radius={2}
      tone={isSelected ? 'primary' : 'default'}
      shadow={1}
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Stack space={3}>
        <Flex align="flex-start" gap={3}>
          <Box style={{ paddingTop: '2px' }}>
            <Checkbox checked={isSelected} readOnly />
          </Box>
          <Stack space={2} style={{ flex: 1 }}>
            {/* Field label */}
            <Flex gap={2} align="center">
              <Text size={1} weight="semibold">
                {fieldLabel}
              </Text>
              {hasChange && (
                <Badge tone="positive" fontSize={0}>
                  Changed
                </Badge>
              )}
            </Flex>

            {/* Current value (if different) */}
            {hasChange && currentValue && (
              <Text
                size={1}
                muted
                style={{
                  textDecoration: 'line-through',
                  opacity: 0.7,
                }}
              >
                {truncate(currentDisplay, 100)}
              </Text>
            )}

            {/* Suggested value */}
            <Card padding={2} radius={1} tone="positive">
              {Array.isArray(suggestion.suggested) ? (
                <Stack space={1}>
                  {suggestion.suggested.map((item, i) => (
                    <Text key={i} size={1}>
                      • {item}
                    </Text>
                  ))}
                </Stack>
              ) : (
                <Text size={1}>{suggestion.suggested}</Text>
              )}
            </Card>

            {/* Reasoning */}
            <Text size={0} muted>
              {suggestion.reasoning}
            </Text>
          </Stack>
        </Flex>
      </Stack>
    </Card>
  );
}
