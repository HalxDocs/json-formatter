// src/components/UltraFastJsonViewer.tsx

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as ReactWindow from 'react-window';
const FixedSizeList = (ReactWindow as any).FixedSizeList || (ReactWindow as any).List || (ReactWindow as any).default;
import { Search, Zap, Cpu, ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface UltraFastJsonViewerProps {
  jsonString: string;
  theme: 'light' | 'dark';
  height?: number;
  onLineClick?: (lineNumber: number, content: string) => void;
}

interface LineInfo {
  content: string;
  lineNumber: number;
  indent: number;
  type: 'brace' | 'bracket' | 'key' | 'value' | 'comma' | 'string';
  key?: string;
  value?: string;
  depth: number;
  isCollapsible: boolean;
  path: string;
}

// Local areEqual function for React.memo
// const areEqual = (prevProps: any, nextProps: any) => {
//   return prevProps.index === nextProps.index && 
//          prevProps.style === nextProps.style;
// };

// Canvas renderer for extreme performance
const CanvasRenderer = ({ lines, width, height, theme }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = theme === 'dark' ? '#050505' : '#f7f8fa';
    ctx.fillRect(0, 0, width, height);
    
    // Set font
    ctx.font = '14px monospace';
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
    
    // Batch render lines
    const lineHeight = 20;
    const visibleLines = Math.min(lines.length, Math.ceil(height / lineHeight));
    
    for (let i = 0; i < visibleLines; i++) {
      const y = i * lineHeight + 16;
      const line = lines[i];
      
      // Syntax highlighting
      if (line.includes(':')) {
        const [key, ...rest] = line.split(':');
        ctx.fillStyle = theme === 'dark' ? '#60a5fa' : '#1d4ed8';
        ctx.fillText(key + ':', 10, y);
        
        const value = rest.join(':');
        if (/^\s*["'].*["']/.test(value)) {
          ctx.fillStyle = theme === 'dark' ? '#fbbf24' : '#d97706';
        } else if (/^\s*\d/.test(value)) {
          ctx.fillStyle = theme === 'dark' ? '#34d399' : '#059669';
        } else {
          ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
        }
        ctx.fillText(value, 10 + ctx.measureText(key + ':').width, y);
      } else {
        ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
        ctx.fillText(line, 10, y);
      }
    }
  }, [lines, width, height, theme]);
  
  return <canvas ref={canvasRef} width={width} height={height} />;
};

const UltraFastJsonViewer: React.FC<UltraFastJsonViewerProps> = ({
  jsonString,
  theme,
  height = 500,
  onLineClick
}) => {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [useCanvas, setUseCanvas] = useState(false);
  const listRef = useRef<any>(null);
  const [visibleLines, setVisibleLines] = useState<LineInfo[]>([]);
  const [totalLines, setTotalLines] = useState(0);

  // Parse JSON into structured lines with memoization
  const { lines } = useMemo(() => {
    if (!jsonString.trim()) {
      return { lines: [] };
    }

    const rawLines = jsonString.split('\n');
    const lines: LineInfo[] = [];
    const lineMap = new Map<number, LineInfo>();
    const pathStack: string[] = [];
    let currentPath = '';
    
    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();
      const indent = line.length - line.trimStart().length;
      
      let type: LineInfo['type'] = 'value';
      let key: string | undefined;
      let value: string | undefined;
      let depth = pathStack.length;
      let isCollapsible = false;
      
      // Fast type detection
      if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        type = trimmed.endsWith('{') ? 'brace' : 'bracket';
        isCollapsible = true;
        const pathPart = trimmed.includes(':') 
          ? trimmed.split(':')[0].replace(/["']/g, '').trim()
          : `item${pathStack.length}`;
        pathStack.push(pathPart);
        currentPath = pathStack.join('.');
      } else if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
        pathStack.pop();
        currentPath = pathStack.join('.');
        depth = pathStack.length;
      } else if (trimmed.includes(':')) {
        type = 'key';
        const colonIndex = trimmed.indexOf(':');
        key = trimmed.substring(0, colonIndex).replace(/["']/g, '').trim();
        value = trimmed.substring(colonIndex + 1).trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          type = 'string';
        }
      } else if (trimmed === ',') {
        type = 'comma';
      } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        type = 'string';
      }
      
      const lineInfo: LineInfo = {
        content: line,
        lineNumber: i + 1,
        indent,
        type,
        key,
        value,
        depth,
        isCollapsible,
        path: currentPath
      };
      
      lines.push(lineInfo);
      lineMap.set(i + 1, lineInfo);
    }
    
    setTotalLines(lines.length);
    return { lines, lineMap };
  }, [jsonString]);

  // Apply filters and collapsed state with memoization
  const filteredLines = useMemo(() => {
    if (!searchTerm && filterType === 'all' && collapsedPaths.size === 0) {
      const result = lines;
      setVisibleLines(result);
      return result;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered: LineInfo[] = [];

    for (const line of lines) {
      // Skip if parent path is collapsed
      const pathParts = line.path.split('.');
      let shouldSkip = false;
      
      for (let i = 1; i <= pathParts.length; i++) {
        const parentPath = pathParts.slice(0, i).join('.');
        if (collapsedPaths.has(parentPath)) {
          shouldSkip = true;
          break;
        }
      }
      
      if (shouldSkip) continue;
      
      // Apply type filter
      if (filterType !== 'all' && line.type !== filterType) {
        continue;
      }
      
      // Apply search filter
      if (searchTerm && !line.content.toLowerCase().includes(lowerSearch)) {
        continue;
      }
      
      filtered.push(line);
    }
    
    setVisibleLines(filtered);
    return filtered;
  }, [lines, searchTerm, filterType, collapsedPaths]);

  // Toggle collapse with optimized updates
  const toggleCollapse = useCallback((path: string) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // Memoized row renderer for extreme performance
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const line = filteredLines[index];
    if (!line) return null;
    
    const isCollapsed = collapsedPaths.has(line.path);
    const isMatch = searchTerm && line.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const handleClick = () => {
      if (onLineClick) {
        onLineClick(line.lineNumber, line.content);
      }
      
      if (line.isCollapsible) {
        toggleCollapse(line.path);
      }
    };
    
    // Fast syntax highlighting using CSS classes
    const getTextColor = () => {
      switch (line.type) {
        case 'key': return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
        case 'string': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
        case 'brace':
        case 'bracket': return theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
        default: return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
      }
    };
    
    return (
      <div
        style={{
          ...style,
          paddingLeft: `${line.depth * 20}px`,
          backgroundColor: isMatch 
            ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
            : 'transparent',
          borderLeft: line.isCollapsible 
            ? `3px solid ${theme === 'dark' ? '#3b82f6' : '#1d4ed8'}`
            : 'none'
        }}
        className={`
          flex items-start font-mono text-sm transition-colors
          ${line.isCollapsible ? 'cursor-pointer hover:opacity-90' : ''}
          ${getTextColor()}
        `}
        onClick={handleClick}
      >
        {/* Line number */}
        <div className="w-12 flex-shrink-0 text-right pr-3">
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {line.lineNumber}
          </span>
        </div>
        
        {/* Collapse indicator */}
        {line.isCollapsible && (
          <div className="w-4 mr-1 mt-0.5 flex-shrink-0">
            {isCollapsed ? (
              <ChevronRight size={12} className="opacity-70" />
            ) : (
              <ChevronDown size={12} className="opacity-70" />
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            {line.content}
          </div>
        </div>
      </div>
    );
  }, [filteredLines, collapsedPaths, searchTerm, theme, onLineClick, toggleCollapse]);

  // Scroll to line
  const scrollToLine = useCallback((lineNumber: number) => {
    const index = filteredLines.findIndex(line => line.lineNumber === lineNumber);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToItem(index, 'center');
    }
  }, [filteredLines]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
            break;
          case 'g':
            if (e.shiftKey) {
              e.preventDefault();
              scrollToLine(Math.floor(Math.random() * totalLines) + 1);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToLine, totalLines]);

  // For canvas mode - simple filtered lines
  const canvasLines = useMemo(() => {
    return filteredLines.map(line => line.content);
  }, [filteredLines]);

  return (
    <div className={`rounded-lg overflow-hidden border ${
      theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Toolbar */}
      <div className={`p-3 border-b flex flex-col sm:flex-row gap-3 ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="key">Keys</option>
              <option value="string">Strings</option>
              <option value="brace">Objects</option>
              <option value="bracket">Arrays</option>
            </select>
          </div>
        </div>

        {/* Stats and controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-sm text-gray-500">
            {visibleLines.length.toLocaleString()} / {totalLines.toLocaleString()} lines
            {searchTerm && ` • ${visibleLines.length} matches`}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setCollapsedPaths(new Set())}
              disabled={collapsedPaths.size === 0}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
                  : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              Expand All
            </button>
            <button
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
                  : 'bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
              }`}
            >
              Clear
            </button>
            <button
              onClick={() => setUseCanvas(!useCanvas)}
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                useCanvas
                  ? theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
              title={useCanvas ? "Canvas rendering" : "DOM rendering"}
            >
              <Cpu size={12} />
              {useCanvas ? 'GPU' : 'CPU'}
            </button>
          </div>
        </div>
      </div>

      {/* Virtualized list or Canvas */}
      {filteredLines.length > 0 ? (
        <div style={{ height }}>
          {useCanvas ? (
            <CanvasRenderer
              lines={canvasLines}
              width={800} // You can make this dynamic
              height={height}
              theme={theme}
            />
          ) : (
            <FixedSizeList
              ref={listRef}
              height={height}
              itemCount={filteredLines.length}
              itemSize={24}
              width="100%"
              className="custom-scrollbar"
            >
              {Row}
            </FixedSizeList>
          )}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          {searchTerm ? 'No matching lines found' : 'No content to display'}
        </div>
      )}

      {/* Footer stats */}
      <div className={`p-3 border-t text-xs ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
      }`}>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Zap size={12} />
            <span>Ultra-fast rendering • {useCanvas ? 'Canvas (GPU)' : 'Virtual DOM'}</span>
          </div>
          <div>
            Press <kbd className={`px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>Ctrl+F</kbd> to search
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with React.memo for performance
export default React.memo(UltraFastJsonViewer);