import React from 'react';

/** Arabic end-of-ayah mark (U+06DD) followed by its verse number. */
const AYAH_MARKER = /(۝\s*[٠-٩\d]*)/g;

/**
 * Splits stored text into lines for display.
 *
 * Handles explicit breaks (`<br>` or a newline) and, for surahs downloaded as a
 * single string, breaks *after* each end-of-ayah mark so verses stack instead of
 * running together as one wall of text. Purely presentational — the stored value
 * is untouched.
 */
export function renderText(text: string) {
  if (!text) return null;

  const explicitLines = text.split(/(?:<br\s*\/?>(?:\r?\n)?)|\n/gi);

  const lines = explicitLines.flatMap((line) => {
    if (!line.includes('۝')) return [line];
    // Keep the marker attached to the verse it closes, then drop empty tails.
    const parts = line.split(AYAH_MARKER);
    const merged: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const verse = `${parts[i] ?? ''}${parts[i + 1] ?? ''}`.trim();
      if (verse) merged.push(verse);
    }
    return merged.length > 0 ? merged : [line];
  });

  return lines.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
