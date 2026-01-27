import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { parseCSV } from './utils';

interface Props {
  csvData: string;
  onDataChange: (newCsvData: string) => void;
  onHeaderRename?: (oldName: string, newName: string) => void;
}

export function EditableDataTable({ csvData, onDataChange, onHeaderRename }: Props) {
  const rows = useMemo(() => parseCSV(csvData), [csvData]);
  const headers = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  // Track which header is being edited so we can restore focus after re-render
  const activeHeaderRef = useRef<number | null>(null);
  const headerInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (activeHeaderRef.current !== null) {
      const input = headerInputsRef.current[activeHeaderRef.current];
      if (input) {
        input.focus();
        // Place cursor at end
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  });

  const rebuildCsv = useCallback((hdrs: string[], data: Record<string, any>[]) => {
    const headerLine = hdrs.map(h => h.includes(',') ? `"${h}"` : h).join(',');
    const dataLines = data.map(row =>
      hdrs.map(h => {
        const str = String(row[h] ?? '');
        return str.includes(',') ? `"${str}"` : str;
      }).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
  }, []);

  const handleHeaderChange = useCallback((colIndex: number, newName: string) => {
    const oldName = headers[colIndex];
    if (oldName === newName) return;

    activeHeaderRef.current = colIndex;

    const newHeaders = headers.map((h, i) => i === colIndex ? newName : h);
    // Re-key every row to use the new column name
    const updatedRows = rows.map(row => {
      const newRow: Record<string, any> = {};
      headers.forEach((h, i) => {
        newRow[newHeaders[i]] = row[h];
      });
      return newRow;
    });

    onDataChange(rebuildCsv(newHeaders, updatedRows));
    if (onHeaderRename) {
      onHeaderRename(oldName, newName);
    }
  }, [rows, headers, onDataChange, onHeaderRename, rebuildCsv]);

  const handleCellChange = useCallback((rowIndex: number, column: string, newValue: string) => {
    const updatedRows = rows.map((row, idx) => {
      if (idx !== rowIndex) return row;
      return { ...row, [column]: newValue };
    });

    onDataChange(rebuildCsv(headers, updatedRows));
  }, [rows, headers, onDataChange, rebuildCsv]);

  if (!rows || rows.length === 0) return null;

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <h4 style={{ color: '#132728', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        Extracted Data
        <span style={{ fontWeight: 'normal', color: '#6c757d', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
          (click cells to edit)
        </span>
      </h4>
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}>
        <table style={{
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          fontSize: '0.85rem'
        }}>
          <thead>
            <tr>
              {headers.map((h, colIdx) => (
                <th key={colIdx} style={{
                  padding: '4px 4px',
                  background: '#f0f8f8',
                  borderBottom: '2px solid #3E7274',
                  position: 'sticky',
                  top: 0,
                  overflow: 'hidden'
                }}>
                  <input
                    ref={(el) => { headerInputsRef.current[colIdx] = el; }}
                    type="text"
                    value={h}
                    onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid transparent',
                      borderRadius: '3px',
                      padding: '4px 6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#132728',
                      background: 'transparent',
                      textAlign: 'left',
                    }}
                    onFocus={(e) => {
                      activeHeaderRef.current = colIdx;
                      e.target.style.borderColor = '#3E7274';
                      e.target.style.background = '#fff';
                    }}
                    onBlur={(e) => {
                      activeHeaderRef.current = null;
                      e.target.style.borderColor = 'transparent';
                      e.target.style.background = 'transparent';
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? '#fff' : '#fafafa' }}>
                {headers.map((h, colIdx) => (
                  <td key={colIdx} style={{
                    padding: '4px 4px',
                    borderBottom: '1px solid #e8e8e8',
                    overflow: 'hidden'
                  }}>
                    <input
                      type="text"
                      value={String(row[h] ?? '')}
                      onChange={(e) => handleCellChange(rowIdx, h, e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid transparent',
                        borderRadius: '3px',
                        padding: '4px 6px',
                        fontSize: '0.85rem',
                        background: 'transparent',
                        textAlign: colIdx === 0 ? 'left' : 'right',
                        fontWeight: colIdx === 0 ? 500 : 'normal',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3E7274';
                        e.target.style.background = '#fff';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'transparent';
                        e.target.style.background = 'transparent';
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
