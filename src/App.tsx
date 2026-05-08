/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import {Notebook} from '@/src/components/Notebook';
import {Tabs} from '@/src/components/Tabs';
import {StatusBar} from '@/src/components/StatusBar';
import {TransferModal} from '@/src/components/TransferModal';
import {Tab, HELP_CONTENT} from '@/src/types';

const STORAGE_KEY = 'notecalc_tabs_v1';

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tabs', e);
      }
    }
    return [{ id: '1', name: 'Untitled', content: '3 + 1\na = 10\na + 3\nlast + 1\n# Welcome to NoteCalc' }];
  });

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: Math.random().toString(36).substring(7),
      name: 'Untitled',
      content: '',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (id: string) => {
    const remainingTabs = tabs.filter(t => t.id !== id);
    if (remainingTabs.length === 0) return;
    setTabs(remainingTabs);
    if (activeTabId === id) {
      setActiveTabId(remainingTabs[0].id);
    }
  };

  const handleTabSelect = (id: string) => setActiveTabId(id);

  const handleTabRename = (id: string, name: string) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, name } : t));
  };

  const handleContentChange = (content: string) => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, content } : t));
  };

  const handleOpenHelp = () => {
    const existingHelp = tabs.find(t => t.isHelp);
    if (existingHelp) {
      setActiveTabId(existingHelp.id);
    } else {
      const helpTab: Tab = {
        id: 'help',
        name: 'Help Guide',
        content: HELP_CONTENT,
        isHelp: true,
      };
      setTabs([...tabs, helpTab]);
      setActiveTabId(helpTab.id);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tabs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notecalc_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (importedTabs: Tab[]) => {
    if (confirm('Importing will overwrite your current tabs. Continue?')) {
      setTabs(importedTabs);
      setActiveTabId(importedTabs[0].id);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0d0d0e] text-[#e0e0e0] overflow-hidden selection:bg-white/10">
      <Tabs 
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
        onTabRename={handleTabRename}
        onOpenHelp={handleOpenHelp}
        onImport={handleImport}
        onExport={handleExport}
        onOpenTextTransfer={() => setIsTransferModalOpen(true)}
      />
      
      <main className="flex flex-1 overflow-hidden">
        <Notebook 
          content={activeTab.content}
          onChange={handleContentChange}
          readOnly={activeTab.isHelp}
        />
      </main>

      <StatusBar 
        charCount={activeTab.content.length}
        lineCount={activeTab.content.split('\n').length}
      />

      {isTransferModalOpen && (
        <TransferModal 
          tabs={tabs}
          onImport={handleImport}
          onClose={() => setIsTransferModalOpen(false)}
        />
      )}
    </div>
  );
}

