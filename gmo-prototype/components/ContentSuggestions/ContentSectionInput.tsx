/**
 * ContentSectionInput Component
 *
 * Custom Sanity input component that wraps content sections
 * with an AI content generation button.
 */

import React, { useState } from 'react';
import { ObjectInputProps, set } from 'sanity';
import { Stack, Card, Button, Text, Flex } from '@sanity/ui';
import { SparklesIcon } from '@sanity/icons';
import { ContentSuggestModal } from './ContentSuggestModal';
import type { SectionData, SectionType } from './types';

interface ContentSectionInputProps extends ObjectInputProps {
  sectionType?: SectionType;
}

export function ContentSectionInput(props: ContentSectionInputProps) {
  const { value, onChange, renderDefault, sectionType = 'contentSection' } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Type-cast value to our expected shape
  const sectionData = value as SectionData | undefined;

  // Check if we have chart data to analyze
  // For contentSection: requires hasChart toggle to be true
  // For chartInsightsSection: always has chart, just check for chartData
  const hasChartData =
    sectionType === 'chartInsightsSection'
      ? !!sectionData?.chartConfig?.chartData
      : sectionData?.hasChart && sectionData?.chartConfig?.chartData;

  const handleAcceptSuggestions = (acceptedFields: Partial<SectionData>) => {
    // Merge accepted suggestions into current value
    const newValue = { ...sectionData, ...acceptedFields };
    onChange(set(newValue));
    setIsModalOpen(false);
  };

  return (
    <Stack space={3}>
      {/* AI Generation Button - only show when chart data exists */}
      {hasChartData && (
        <Card padding={3} radius={2} tone="primary" shadow={1}>
          <Flex gap={3} align="center" justify="space-between">
            <Flex gap={2} align="center">
              <SparklesIcon />
              <Stack space={1}>
                <Text size={1} weight="semibold">
                  AI Content Assistant
                </Text>
                <Text size={0} muted>
                  Generate title, subtitle, and content based on your chart data
                </Text>
              </Stack>
            </Flex>
            <Button
              icon={SparklesIcon}
              text="Generate Content"
              tone="primary"
              onClick={() => setIsModalOpen(true)}
            />
          </Flex>
        </Card>
      )}

      {/* Info card when no chart data */}
      {!hasChartData && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Flex gap={2} align="center">
            <SparklesIcon style={{ opacity: 0.5 }} />
            <Text size={1} muted>
              Add a chart to enable AI content suggestions
            </Text>
          </Flex>
        </Card>
      )}

      {/* Render default Sanity fields */}
      {renderDefault(props)}

      {/* Modal */}
      {isModalOpen && sectionData && (
        <ContentSuggestModal
          sectionData={sectionData}
          sectionType={sectionType}
          onAccept={handleAcceptSuggestions}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Stack>
  );
}

/**
 * Factory function to create typed input components for specific section types
 */
export function createContentSectionInput(sectionType: SectionType) {
  return function TypedContentSectionInput(props: ObjectInputProps) {
    return <ContentSectionInput {...props} sectionType={sectionType} />;
  };
}

// Pre-built components for each section type
export const ContentSectionInputForContent = createContentSectionInput('contentSection');
export const ContentSectionInputForChartInsights = createContentSectionInput('chartInsightsSection');
