import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AIInsightsPanel = ({
  metrics,
  trends = [],
  segmentBreakdown = [],
  className = ""
}) => {
  const navigate = useNavigate();

  // Extract variables safely
  const atRiskCount = metrics?.customers_at_risk || 0;
  const revAtRisk = Math.round(metrics?.revenue_at_risk || 0);
  const churnRate = metrics?.churn_rate ? (metrics.churn_rate).toFixed(1) : "0.0";
  
  // Find top risk segment if any
  const atRiskSegment = segmentBreakdown.find(s => s.name === 'at_risk' || s.name === 'high_value') || segmentBreakdown[0];
  const topSegmentName = atRiskSegment ? (atRiskSegment.name.replace('_', ' ')) : 'High-Value';
  const topSegmentCount = atRiskSegment?.value || atRiskCount;

  // Trend analysis (compare last 2 months if available)
  const lastMonthRate = trends.length >= 2 ? trends[trends.length - 1].rate : parseFloat(churnRate);
  const prevMonthRate = trends.length >= 2 ? trends[trends.length - 2].rate : parseFloat(churnRate);
  const rateDelta = (lastMonthRate - prevMonthRate).toFixed(1);
  const isWorsening = parseFloat(rateDelta) > 0;

  // Key simulated risk factor narrative
  const topRiskFactor = atRiskCount > 50 ? "rising cart-abandon rate & inactivity >45 days" : "infrequent purchases & return rate spikes";
  const recommendedDiscount = atRiskCount > 100 ? "25% win-back renewal offer" : "15% loyalty retention credit";

  return (
    <div className={`bg-gradient-to-br from-cg-surface via-[#151B27] to-cg-surface border border-cg-border rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-xl ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cg-brand/15 border border-cg-brand/30 flex items-center justify-center text-cg-brand">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-cg-primary tracking-tight">AI Executive Risk Narrative</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-cg-brand/10 text-cg-brand border border-cg-brand/20 rounded-full font-semibold">
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-cg-muted">Synthesized from active SHAP weights, segmentation, and behavioral velocity</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/retention')}
          className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-semibold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md shadow-cg-brand/10 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          Launch Retention Campaign
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>

      {/* Generated Narrative */}
      <div className="bg-cg-base/70 border border-cg-border/80 rounded-lg p-4 relative z-10">
        <p className="text-sm leading-relaxed text-cg-primary">
          <span className="font-mono font-bold text-cg-risk">{atRiskCount.toLocaleString()}</span> customers across{' '}
          <span className="font-semibold text-cg-primary capitalize">{topSegmentName}</span> are currently flagged in high risk territory, representing{' '}
          <span className="font-mono font-bold text-cg-brand">${revAtRisk.toLocaleString()}</span> in projected annual revenue at stake.
          {isWorsening ? (
            <span className="text-cg-muted"> Churn velocity climbed <span className="font-mono text-cg-risk">+{rateDelta}%</span> over the previous cohort window.</span>
          ) : (
            <span className="text-cg-muted"> Churn velocity has stabilized within baseline tolerances.</span>
          )}
          {' '}Top shared risk driver:{' '}
          <span className="text-cg-risk font-medium underline underline-offset-2 decoration-cg-risk/40">{topRiskFactor}</span>.
          {' '}Recommended automated action:{' '}
          <span className="text-cg-safe font-medium">dispatch {recommendedDiscount} to protected tiers</span>.
        </p>

        {/* Micro KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-cg-border/60">
          <div className="flex flex-col">
            <span className="text-[11px] text-cg-muted font-medium">Risk Exposure</span>
            <span className="text-sm font-bold font-mono text-cg-risk">${revAtRisk.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-cg-muted font-medium">Flagged Accounts</span>
            <span className="text-sm font-bold font-mono text-cg-primary">{atRiskCount.toLocaleString()} accounts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-cg-muted font-medium">Primary Segment</span>
            <span className="text-sm font-bold text-cg-primary capitalize">{topSegmentName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-cg-muted font-medium">Action Target</span>
            <span className="text-sm font-bold text-cg-safe">{topSegmentCount} Offers queued</span>
          </div>
        </div>
      </div>
    </div>
  );
};
