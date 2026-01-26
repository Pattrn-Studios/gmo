/**
 * SlidePreviewGallery Component
 *
 * Displays a grid of slide preview thumbnails with selection highlighting.
 */

import React from 'react';
import {Card, Stack, Text, Badge} from '@sanity/ui';
import type {SlidePreview} from './types';

interface SlidePreviewGalleryProps {
  previews: SlidePreview[];
  highlightedSlide?: number;
  onSlideClick?: (slideIndex: number) => void;
}

const slideTypeLabels: Record<string, string> = {
  titleSection: 'Title',
  navigationSection: 'Contents',
  headerSection: 'Divider',
  contentSection: 'Chart',
  chartInsightsSection: 'Insights',
  timelineSection: 'Timeline',
};

export function SlidePreviewGallery({
  previews,
  highlightedSlide,
  onSlideClick,
}: SlidePreviewGalleryProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      {previews.map((preview) => (
        <Card
          key={preview.slideIndex}
          padding={2}
          radius={2}
          shadow={highlightedSlide === preview.slideIndex ? 2 : 1}
          tone={highlightedSlide === preview.slideIndex ? 'primary' : 'default'}
          style={{
            cursor: onSlideClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            border:
              highlightedSlide === preview.slideIndex
                ? '2px solid var(--card-focus-ring-color)'
                : '2px solid transparent',
          }}
          onClick={() => onSlideClick?.(preview.slideIndex)}
        >
          <Stack space={2}>
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <img
                src={preview.imageDataUri}
                alt={`Slide ${preview.slideIndex + 1}: ${preview.slideType}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <Stack space={2} style={{padding: '4px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Badge tone="primary" mode="outline" fontSize={0}>
                  {slideTypeLabels[preview.slideType] || preview.slideType}
                </Badge>
                {preview.sectionNumber && (
                  <Text size={0} muted>
                    #{preview.sectionNumber}
                  </Text>
                )}
              </div>
              <Text size={1} muted>
                Slide {preview.slideIndex + 1}
              </Text>
            </Stack>
          </Stack>
        </Card>
      ))}
    </div>
  );
}
