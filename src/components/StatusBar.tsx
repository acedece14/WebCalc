import {useState, useEffect} from 'react';
import {format} from 'date-fns';

interface StatusBarProps {
  charCount: number;
  lineCount: number;
}

export function StatusBar({charCount, lineCount}: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-8 items-center justify-between border-t border-border bg-[#161618] px-4 text-[11px] text-gray-500 font-mono select-none">
      <div className="flex gap-4">
        <span>{format(time, 'HH:mm:ss')}</span>
        <span>UTF-8</span>
      </div>
      <div className="flex items-center gap-4 uppercase tracking-widest">
        <span>Lines: <span className="text-gray-300">{lineCount}</span></span>
        <span>Chars: <span className="text-gray-300">{charCount}</span></span>
        <span className="text-[#5bb5a2]">● Connected</span>
      </div>
    </div>
  );
}
