import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  PieChart, 
  ShieldCheck, 
  Settings, 
  Zap, 
  RefreshCw,
  X,
  CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const actions = [
    { id: 'nav-dashboard', title: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'nav-customers', title: 'Go to Customers List', category: 'Navigation', icon: Users, action: () => navigate('/customers') },
    { id: 'nav-predict', title: 'Single & Batch Prediction', category: 'Navigation', icon: BrainCircuit, action: () => navigate('/predict') },
    { id: 'nav-segments', title: 'Customer Segments', category: 'Navigation', icon: PieChart, action: () => navigate('/segments') },
    { id: 'nav-retention', title: 'Retention Hub & Offers', category: 'Navigation', icon: ShieldCheck, action: () => navigate('/retention') },
    { id: 'nav-models', title: 'Model Performance & Retraining', category: 'Navigation', icon: Settings, action: () => navigate('/models') },
    { id: 'action-simulate', title: 'Simulate Live Event Pulse', category: 'Quick Actions', icon: Zap, action: () => navigate('/predict') },
    { id: 'action-retrain', title: 'Trigger Model Retrain', category: 'Quick Actions', icon: RefreshCw, action: () => navigate('/models') },
    { id: 'sample-cust-1', title: 'Jump to Customer #CUST-1001', category: 'Customers', icon: Users, action: () => navigate('/customers/CUST-1001') },
    { id: 'sample-cust-2', title: 'Jump to Customer #CUST-1002', category: 'Customers', icon: Users, action: () => navigate('/customers/CUST-1002') },
    { id: 'sample-cust-3', title: 'Jump to Customer #CUST-1015', category: 'Customers', icon: Users, action: () => navigate('/customers/CUST-1015') },
  ];

  const filtered = actions.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-cg-surface border border-cg-border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-cg-border bg-cg-base/50">
            <Search className="w-5 h-5 text-cg-brand" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command, page, or customer ID (e.g. CUST-1001)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-cg-primary text-sm focus:outline-none placeholder:text-cg-muted"
            />
            <button
              onClick={() => onClose(false)}
              className="text-cg-muted hover:text-cg-primary p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-cg-muted">
                No matching commands or customers found.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                      isSelected 
                        ? 'bg-cg-brand/15 text-cg-brand border border-cg-brand/30' 
                        : 'text-cg-primary hover:bg-cg-base/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-cg-brand/20 text-cg-brand' : 'bg-cg-base text-cg-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cg-muted uppercase px-2 py-0.5 rounded bg-cg-base border border-cg-border">
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-cg-brand" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2.5 border-t border-cg-border bg-cg-base/40 flex items-center justify-between text-[11px] text-cg-muted">
            <div className="flex items-center gap-3">
              <span><kbd className="px-1.5 py-0.5 rounded bg-cg-surface border border-cg-border font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-cg-surface border border-cg-border font-mono">↵</kbd> select</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-cg-surface border border-cg-border font-mono">esc</kbd> close</span>
            </div>
            <span className="font-mono">ChurnGuard AI v2.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
