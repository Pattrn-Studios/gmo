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
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/content-suggest`, {
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
  } catch (networkError) {
    throw new Error(
      `Network error: Unable to reach AI service. Please check your connection.`
    );
  }

  if (!response.ok) {
    let errorMessage = 'Failed to generate suggestions';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Response wasn't JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convert content bullet strings to Sanity Portable Text blocks
 */
export function stringsToPortableText(bullets: string[]): any[] {
  if (!Array.isArray(bullets)) return [];

  return bullets.map((text) => ({
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
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
