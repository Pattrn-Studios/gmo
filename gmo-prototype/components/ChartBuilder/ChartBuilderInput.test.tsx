// Minimal test version to check if basic component rendering works
import React from 'react';

export function ChartBuilderInput(props: any) {
  return (
    <div style={{ padding: '1rem', border: '1px solid red', background: '#ffe' }}>
      <h3 style={{ color: 'red' }}>TEST: Chart Builder Component is Loading</h3>
      <button onClick={() => alert('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
}
