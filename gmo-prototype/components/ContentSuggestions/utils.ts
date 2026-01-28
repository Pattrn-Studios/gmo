/**
 * Utility functions for content suggestions
 */

import type { ContentSuggestResponse, SectionData, SectionType } from './types';

const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://gmo-chart-agent.vercel.app';

export async function generateContentSuggestions(
  sectionType: SectionType,
  sectionData: SectionData,
  reportContext?: { reportTitle?: string }
): Promise<ContentSuggestResponse> {
  const response = await fetch(`${API_BASE_URL}/api/content-suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sectionType,
      sectionData,
      reportContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate suggestions');
  }

  return response.json();
}

/**
 * Convert content bullet strings to Sanity Portable Text blocks
 */
export function stringsToPortableText(bullets: string[]): any[] {
  return bullets.map((text) => ({
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).substring(7),
        text: `• ${text}`,
        marks: [],
      },
    ],
  }));
}

/**
 * Extract plain text from Portable Text blocks
 */
export function portableTextToStrings(blocks: any[]): string[] {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks
    .filter((block) => block._type === 'block')
    .map((block) =>
      block.children
        ?.map((child: any) => child.text || '')
        .join('')
        .replace(/^[•\-]\s*/, '') // Remove bullet prefix
    )
    .filter(Boolean);
}
