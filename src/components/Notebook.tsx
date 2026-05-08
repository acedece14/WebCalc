import {useState, useEffect, useRef} from 'react';
import {evaluateNotebook, LineResult} from '@/src/lib/engine';
import {cn} from '@/src/lib/utils';

interface NotebookProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const SIDEBAR_WIDTH_KEY = 'notecalc_sidebar_width';

export function Notebook({content, onChange, readOnly}: NotebookProps) {
  const [results, setResults] = useState<LineResult[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 300;
  });
  const [isResizing, setIsResizing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(evaluateNotebook(content));
  }, [content]);

  const updateActiveLine = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = content.substring(0, pos);
    const lineIndex = textBefore.split('\n').length - 1;
    setActiveLineIndex(lineIndex);
  };

  useEffect(() => {
    updateActiveLine();
  }, [content]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 80 && newWidth < window.innerWidth * 0.8) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: show a toast or brief visual feedback
    });
  };

  const highlightContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Improved regex to handle comments as single tokens more reliably
      const tokens = line.split(/(\/\/.*|#.*|[+\-*/^=()])/);
      const elements: JSX.Element[] = [];
      let commentStarted = false;

      tokens.forEach((token, j) => {
        if (!token || commentStarted) return;

        if (token.startsWith('//')) {
          commentStarted = true;
          elements.push(<span key={j} className="syntax-comment-slash">{token}</span>);
          return;
        }
        if (token.startsWith('#')) {
          commentStarted = true;
          elements.push(<span key={j} className="syntax-comment-hash">{token}</span>);
          return;
        }

        if (/[+\-*/^=()]/.test(token)) {
          elements.push(<span key={j} className="syntax-operator">{token}</span>);
          return;
        }

        const trimmed = token.trim();
        if (trimmed && /^[0-9.]+$/.test(trimmed)) {
          elements.push(<span key={j} className="syntax-number">{token}</span>);
          return;
        }

        if (trimmed && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
          if (trimmed === 'pi' || trimmed === 'e') {
            elements.push(<span key={j} className="syntax-constant">{token}</span>);
          } else {
            elements.push(<span key={j} className="syntax-variable">{token}</span>);
          }
          return;
        }

        elements.push(<span key={j} className="text-[#e0e0e0]">{token}</span>);
      });

      return (
        <div key={i} className={cn("h-7 whitespace-pre flex w-full transition-colors", i === activeLineIndex && "bg-white/[0.03]")}>
          {/* Fixed width for line numbers, consistent with textarea padding */}
          <div className={cn("w-10 shrink-0 text-right pr-4 select-none leading-7 pointer-events-none transition-colors", i === activeLineIndex ? "text-[#f27d26]/40" : "text-muted-foreground/20")}>
            {i + 1}
          </div>
          <div className="flex-1 leading-7">
            {elements}
            {line === '' && ' '}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative flex-1 overflow-auto bg-background scrollbar-thin scrollbar-thumb-muted">
      <div className="flex min-w-full min-h-full font-mono text-sm leading-7 selection:bg-white/10">
        
        {/* Editor Container */}
        <div className="relative flex-1 min-w-[30ch]">
          {/* Mirror for width and highlighting */}
          <div 
            ref={highlightRef}
            className="select-none text-transparent whitespace-pre pointer-events-none p-8 pr-0"
            aria-hidden="true"
          >
            {highlightContent(content)}
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={updateActiveLine}
            onKeyUp={updateActiveLine}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            className="absolute inset-0 z-10 w-full h-full resize-none border-none bg-transparent pt-8 pb-8 pr-0 focus:ring-0 caret-[#f27d26] outline-none overflow-hidden"
            style={{ 
              color: 'transparent', 
              height: '100%', 
              width: '100%', 
              paddingLeft: 'calc(2rem + 2.5rem)', /* p-8 (2rem) + line-num-w (2.5rem/w-10) */
              lineHeight: '1.75rem' 
            }}
            placeholder="Type math here..."
          />
        </div>

        {/* Resizable Divider */}
        <div 
          onMouseDown={() => setIsResizing(true)}
          className={cn(
            "w-1 shrink-0 bg-border hover:bg-[#f27d26]/50 cursor-col-resize transition-colors relative z-30",
            isResizing && "bg-[#f27d26]"
          )}
        />

        {/* Results Panel */}
        <div 
          ref={resultsRef}
          style={{ width: sidebarWidth }}
          className="shrink-0 border-l border-transparent bg-background pt-8 pb-8 select-none overflow-hidden"
        >
          {results.map((res, i) => (
            <div 
              key={i} 
              className={cn(
                "h-7 px-4 text-left transition-all cursor-pointer hover:text-foreground group flex items-center font-bold border-l-4 border-transparent hover:border-[#f27d26]/50 shrink-0",
                res.isError ? "text-destructive" : "text-[#f27d26]",
                i === activeLineIndex && "bg-white/[0.03] border-l-[#f27d26]/30"
              )}
              onClick={() => res.value && copyToClipboard(res.value)}
              title={res.value ? "Click to copy" : ""}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-4 text-[9px] uppercase font-bold text-muted-foreground shrink-0 order-first">Copy</span>
              {res.value && <span className="mr-2 text-muted-foreground/10 select-none text-[10px] font-normal">=</span>}
              <span className="truncate flex-1">{res.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
