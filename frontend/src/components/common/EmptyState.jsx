import React from 'react';
import { FileQuestion, UploadCloud, Users, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = ({ 
  title = "No data found", 
  description = "Get started by creating a new entry.", 
  actionLabel, 
  onAction,
  icon: Icon = FileQuestion,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-cg-surface rounded-xl border border-cg-border ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-cg-base border border-cg-border flex items-center justify-center mb-4 text-cg-brand shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-cg-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-cg-muted max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-semibold px-5 py-2.5 shadow-lg shadow-cg-brand/10 transition-all flex items-center gap-2"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
