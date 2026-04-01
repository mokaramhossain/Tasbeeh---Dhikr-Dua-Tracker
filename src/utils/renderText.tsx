import React from 'react';

export function renderText(text: string) {
  if (!text) return null;
  return text.split(/(?:<br\s*\/?>(?:\r?\n)?)|\n/gi).map((part, i, arr) => (
    <React.Fragment key={i}>
      {part}{i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}
