import React, { useState, useMemo, useCallback, memo } from 'react';
import { List } from 'react-window';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface VirtualizedJsonViewerProps {
  jsonString: string;
  theme: 'light' | 'dark';
  height?: number;
  onLineClick?: (lineNumber: number, content: string) => void;
}

interface LineData {
  content: string;
  lineNumber: number;
  indent: number;
  depth: number;
  isCollapsible: boolean;
  path: string;
}

const MAX_DISPLAY_LINES = 500_000;

function buildLines(jsonString: string): LineData[] {
  const rawLines = jsonString.split('\n');
  const cap = Math.min(rawLines.length, MAX_DISPLAY_LINES);
  const lines: LineData[] = new Array(cap);

  let depth = 0;
  let inString = false;
  let escape = false;
  const pathStack: string[] = [];

  for (let i = 0; i < cap; i++) {
    const line = rawLines[i];
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;
    let isCollapsible = false;

    for (let c = 0; c < trimmed.length; c++) {
      const ch = trimmed[c];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (ch === '{' || ch === '[') {
        if (c === trimmed.length - 1 || trimmed[c + 1] === ',' || trimmed[c + 1] === undefined) {
          isCollapsible = true;
        }
        pathStack.push(String(depth));
        depth++;
      } else if (ch === '}' || ch === ']') {
        depth = Math.max(0, depth - 1);
        pathStack.pop();
      }
    }

    lines[i] = {
      content: line,
      lineNumber: i + 1,
      indent,
      depth: Math.max(0, depth),
      isCollapsible,
      path: pathStack.join('.') || String(i),
    };
  }

  return lines;
}

// Row props — new react-window spreads rowProps directly into the row component
interface RowProps {
  index: number;
  style: React.CSSProperties;
  ariaAttributes?: Record<string, unknown>;
  lines: LineData[];
  collapsedPaths: Set<string>;
  searchTerm: string;
  theme: 'light' | 'dark';
  onLineClick?: (n: number, c: string) => void;
  onToggleCollapse: (p: string) => void;
}

const Row = memo(({
  index, style, lines, collapsedPaths, searchTerm, theme, onLineClick, onToggleCollapse,
}: RowProps) => {
  const line = lines[index];
  if (!line) return null;

  const isCollapsed = collapsedPaths.has(line.path);
  const isMatch = !!searchTerm && line.content.toLowerCase().includes(searchTerm.toLowerCase());

  const handleClick = () => {
    if (onLineClick) onLineClick(line.lineNumber, line.content);
    if (line.isCollapsible) onToggleCollapse(line.path);
  };

  return (
    <div
      style={{
        ...style,
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '24px',
        cursor: line.isCollapsible ? 'pointer' : 'default',
        backgroundColor: isMatch
          ? theme === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)'
          : 'transparent',
      }}
      className={`flex items-center px-2 select-none ${
        theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'
      }`}
      onClick={handleClick}
    >
      <span className="text-gray-500 text-xs w-10 shrink-0 mr-2 text-right select-none">
        {line.lineNumber}
      </span>
      <span
        style={{ paddingLeft: `${line.indent}px` }}
        className="flex items-center gap-1 min-w-0 flex-1"
      >
        {line.isCollapsible && (
          <span className="shrink-0 text-blue-400">
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
        <span className="whitespace-pre truncate">{line.content}</span>
      </span>
    </div>
  );
});

Row.displayName = 'VirtualRow';

// ──────────────────────────────────────────────────────────────────────────────

const VirtualizedJsonViewer: React.FC<VirtualizedJsonViewerProps> = ({
  jsonString,
  theme,
  height = 500,
  onLineClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const allLines = useMemo(() => buildLines(jsonString), [jsonString]);

  const visibleLines = useMemo(() => {
    if (!searchTerm && collapsedPaths.size === 0) return allLines;
    return allLines.filter((line) => {
      if (collapsedPaths.size > 0) {
        const parts = line.path.split('.');
        for (let i = 1; i < parts.length; i++) {
          if (collapsedPaths.has(parts.slice(0, i).join('.'))) return false;
        }
      }
      if (searchTerm) return line.content.toLowerCase().includes(searchTerm.toLowerCase());
      return true;
    });
  }, [allLines, searchTerm, collapsedPaths]);

  const onToggleCollapse = useCallback((path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }, []);

  // rowProps is spread directly onto each Row by the new react-window API
  const rowProps = useMemo(
    () => ({
      lines: visibleLines,
      collapsedPaths,
      searchTerm,
      theme,
      onLineClick,
      onToggleCollapse,
    }),
    [visibleLines, collapsedPaths, searchTerm, theme, onLineClick, onToggleCollapse]
  );

  const isTruncated = jsonString.split('\n').length > MAX_DISPLAY_LINES;

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Toolbar */}
      <div
        className={`px-3 py-2 border-b flex items-center gap-3 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search in JSON…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <span className="text-xs text-gray-500 whitespace-nowrap">
          {allLines.length.toLocaleString()} lines
          {searchTerm && ` · ${visibleLines.length.toLocaleString()} match${visibleLines.length !== 1 ? 'es' : ''}`}
          {isTruncated && ' · (preview capped at 500k)'}
        </span>

        {collapsedPaths.size > 0 && (
          <button
            onClick={() => setCollapsedPaths(new Set())}
            className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Expand All
          </button>
        )}
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Virtual list */}
      {visibleLines.length > 0 ? (
        <List
          rowCount={visibleLines.length}
          rowHeight={24}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rowComponent={Row as any}
          rowProps={rowProps}
          defaultHeight={height}
          className="custom-scrollbar"
        />
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
          {searchTerm ? 'No matches found' : 'No content to display'}
        </div>
      )}

      {/* Footer */}
      <div
        className={`px-3 py-1.5 border-t text-xs flex justify-between ${
          theme === 'dark'
            ? 'border-gray-700 bg-gray-800 text-gray-400'
            : 'border-gray-200 bg-gray-50 text-gray-600'
        }`}
      >
        <span>~{(jsonString.length / 1024 / 1024).toFixed(2)} MB in memory</span>
        <span>Ctrl+Shift+C to copy output</span>
      </div>
    </div>
  );
};

export default VirtualizedJsonViewer;
