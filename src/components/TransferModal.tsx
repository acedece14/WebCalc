import {useState} from 'react';
import {X, Copy, Check} from 'lucide-react';
import {Tab} from '@/src/types';

interface TransferModalProps {
  tabs: Tab[];
  onImport: (tabs: Tab[]) => void;
  onClose: () => void;
}

export function TransferModal({tabs, onImport, onClose}: TransferModalProps) {
  const [text, setText] = useState(JSON.stringify(tabs, null, 2));
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        onImport(data);
        onClose();
      } else {
        alert('Invalid format. Data must be an array of tabs.');
      }
    } catch (e) {
      alert('Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161618] border border-border rounded-xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold">Import / Export Text</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          <p className="text-xs text-muted-foreground mb-2">
            Copy the text below to export your data, or paste new data here and click "Apply Import".
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-[#0d0d0e] border border-border rounded-lg p-4 font-mono text-sm resize-none focus:ring-1 focus:ring-[#f27d26] outline-none"
            spellCheck={false}
          />
        </div>

        <div className="p-4 border-t border-border flex justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy All'}
          </button>

          <button
            onClick={handleImport}
            className="px-6 py-2 bg-[#f27d26] hover:bg-[#f27d26]/80 text-black rounded-lg transition-all text-sm font-bold shadow-lg shadow-[#f27d26]/20"
          >
            Apply Import
          </button>
        </div>
      </div>
    </div>
  );
}
