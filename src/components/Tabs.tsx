import {Plus, X, HelpCircle, Download, Upload, FileJson} from 'lucide-react';
import {useState, useRef} from 'react';
import {cn} from '@/src/lib/utils';
import {Tab} from '@/src/types';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabAdd: () => void;
  onTabRename: (id: string, name: string) => void;
  onOpenHelp: () => void;
  onImport: (tabs: Tab[]) => void;
  onExport: () => void;
  onOpenTextTransfer: () => void;
}

export function Tabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabAdd,
  onTabRename,
  onOpenHelp,
  onImport,
  onExport,
  onOpenTextTransfer,
}: TabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRename = (tab: Tab) => {
    setEditingId(tab.id);
    setEditValue(tab.name);
  };

  const finishRename = () => {
    if (editingId && editValue.trim()) {
      onTabRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImport(imported);
        }
      } catch (err) {
        console.error('Failed to import tabs', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-12 w-full shrink-0 items-center border-b border-border bg-[#161618] px-2 pt-2 gap-1 select-none overflow-y-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />
      
      <div className="flex items-center gap-1 mb-2 pr-2 border-r border-border mr-1 shrink-0">
        <button
          onClick={onTabAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2a2a2c] text-muted-foreground transition-colors"
          title="New Tab"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2a2a2c] text-muted-foreground transition-colors"
          title="Import JSON"
        >
          <Upload className="h-4 w-4" />
        </button>
        <button
          onClick={onExport}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2a2a2c] text-muted-foreground transition-colors"
          title="Export JSON"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenTextTransfer}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2a2a2c] text-muted-foreground transition-colors"
          title="Import/Export via Text"
        >
          <FileJson className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1 items-end h-full overflow-x-auto no-scrollbar flex-1 pr-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            onDoubleClick={() => startRename(tab)}
            className={cn(
              "group relative flex min-w-[120px] max-w-[200px] h-9 items-center justify-between gap-2 px-4 py-2 cursor-default rounded-t-lg transition-all border-t border-x border-transparent shrink-0",
              activeTabId === tab.id 
                ? "bg-[#0d0d0e] border-border text-foreground z-10 -mb-px" 
                : "text-muted-foreground hover:bg-[#1d1d20]"
            )}
          >
            {editingId === tab.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none text-foreground"
              />
            ) : (
              <span className="truncate text-sm font-medium">{tab.name}</span>
            )}
            
            {(tabs.length > 1 || tab.isHelp) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={cn(
                   "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:text-red-400",
                   activeTabId === tab.id && "opacity-100"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="ml-auto pr-2 mb-2 shrink-0 border-l border-border pl-2">
        <button
          onClick={onOpenHelp}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#2a2a2c] text-muted-foreground transition-colors"
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

