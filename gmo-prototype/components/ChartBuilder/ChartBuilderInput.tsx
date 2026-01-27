import React, { useState } from 'react';
import { ObjectInputProps, set, unset } from 'sanity';
import { Stack, Card, Button, Text, Flex } from '@sanity/ui';
import { ChartBuilderValue } from './types';
import { ChartBuilderModal } from './ChartBuilderModal';

// CRITICAL: Must use ObjectInputProps from 'sanity' package and @sanity/ui components
export function ChartBuilderInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'csv' | 'image'>('csv');

  // Type-cast value to our expected shape
  const chartConfig = value as ChartBuilderValue | undefined;
  const hasChartConfig = chartConfig?.chartType && chartConfig?.chartData;

  const handleSave = (config: ChartBuilderValue) => {
    // Use onChange(set(...)) to properly update Sanity document
    onChange(set(config));
    setIsModalOpen(false);
  };

  const handleClear = () => {
    // Use onChange(unset()) to clear the field
    onChange(unset());
  };

  const handleOpenCsvModal = () => {
    setModalMode('csv');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setModalMode((chartConfig?.sourceMode as 'csv' | 'image') || 'csv');
    setIsModalOpen(true);
  };

  const handleOpenImageModal = () => {
    setModalMode('image');
    setIsModalOpen(true);
  };

  return (
    <Stack space={3}>
      {/* Render custom UI using @sanity/ui components */}
      <Card padding={3} radius={2} shadow={1} border>
        {hasChartConfig ? (
          <Stack space={3}>
            <Flex gap={3} align="center" wrap="wrap">
              <Text size={1}>
                <strong>Chart Type:</strong> {chartConfig.chartType}
              </Text>
              <Text size={1}>
                <strong>Series:</strong> {chartConfig.chartSeries?.length || 0}
              </Text>
            </Flex>
            <Flex gap={2}>
              <Button
                text="Edit Chart"
                tone="primary"
                onClick={handleOpenEditModal}
              />
              <Button
                text="Upload Image"
                tone="default"
                onClick={handleOpenImageModal}
              />
              <Button
                text="Remove Chart"
                tone="critical"
                onClick={handleClear}
              />
            </Flex>
          </Stack>
        ) : (
          <Flex gap={2}>
            <Button
              text="Add Chart"
              tone="primary"
              onClick={handleOpenCsvModal}
            />
            <Button
              text="Upload Image"
              tone="default"
              onClick={handleOpenImageModal}
            />
          </Flex>
        )}

        {isModalOpen && (
          <ChartBuilderModal
            initialValue={chartConfig}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            mode={modalMode}
          />
        )}
      </Card>

      {/* CRITICAL: Render hidden default fields to maintain Sanity form integration */}
      <div style={{ display: 'none' }}>
        {renderDefault(props)}
      </div>
    </Stack>
  );
}
