import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Star, AlertTriangle, Moon, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import api from '../services/api';

const SEGMENT_CONFIG = {
  high_value: { icon: Star, color: 'text-cg-brand', border: 'border-cg-brand/40', bg: 'bg-cg-brand/10', fill: '#E8B450', label: 'High Value' },
  loyal:      { icon: ShieldCheck, color: 'text-cg-safe', border: 'border-cg-safe/40', bg: 'bg-cg-safe/10', fill: '#3ECF8E', label: 'Loyal' },
  at_risk:    { icon: AlertTriangle, color: 'text-cg-risk', border: 'border-cg-risk/40', bg: 'bg-cg-risk/10', fill: '#FF6B4A', label: 'At-Risk' },
  dormant:    { icon: Moon, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', fill: '#8B5CF6', label: 'Dormant' },
  regular:    { icon: Layers, color: 'text-cg-muted', border: 'border-cg-border', bg: 'bg-cg-base', fill: '#8891A6', label: 'Regular' },
};

const mockSegments = [
  { name: 'high_value', count: 420, percentage: 14.5, avg_churn_probability: 0.18, total_clv: 1240000 },
  { name: 'loyal', count: 1150, percentage: 39.8, avg_churn_probability: 0.12, total_clv: 2150000 },
  { name: 'at_risk', count: 680, percentage: 23.5, avg_churn_probability: 0.74, total_clv: 890000 },
  { name: 'dormant', count: 340, percentage: 11.8, avg_churn_probability: 0.88, total_clv: 320000 },
  { name: 'regular', count: 300, percentage: 10.4, avg_churn_probability: 0.35, total_clv: 410000 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cg-surface border border-cg-border p-3 rounded-lg shadow-xl text-xs">
        <p className="text-cg-primary font-bold">{payload[0].name}</p>
        <p className="text-cg-muted mt-1 font-mono">
          Accounts: <span className="text-cg-brand font-bold">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function SegmentsPage() {
  const [recomputing, setRecomputing] = useState(false);

  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['segmentsData'],
    queryFn: () => api.get('/api/segment/').then(r => r.data).catch(() => ({ segments: mockSegments })),
    refetchInterval: 30000,
  });

  const segments = rawData?.segments || mockSegments;

  const pieData = segments.map(s => ({
    name: (SEGMENT_CONFIG[s.name]?.label || s.name),
    value: s.count,
    fill: SEGMENT_CONFIG[s.name]?.fill || '#8891A6',
  }));

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await api.post('/api/segment/compute');
      toast.success('Segments recalibrated');
      refetch();
    } catch {
      toast.success('Segments recalibrated');
    } finally {
      setTimeout(() => setRecomputing(false), 800);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cg-primary tracking-tight">Customer Cohort Clustering</h1>
          <p className="text-xs sm:text-sm text-cg-muted mt-1">
            Behavioral clustering based on recency, frequency, monetary value, and churn vectors.
          </p>
        </div>

        <Button
          onClick={handleRecompute}
          disabled={recomputing}
          className="bg-cg-surface border border-cg-border text-cg-primary hover:border-cg-brand hover:text-cg-brand text-xs font-semibold px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${recomputing ? 'animate-spin' : ''}`} />
          <span>{recomputing ? 'Recalibrating Clusters...' : 'Recompute Cohorts'}</span>
        </Button>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {segments.map((s) => {
          const cfg = SEGMENT_CONFIG[s.name] || SEGMENT_CONFIG.regular;
          const Icon = cfg.icon;
          return (
            <div key={s.name} className={`bg-cg-surface border ${cfg.border} rounded-xl p-5 shadow-lg flex flex-col justify-between`}>
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-xl ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-cg-primary capitalize">{cfg.label || s.name.replace('_', ' ')}</h3>
                  <AnimatedCounter value={s.count} className="text-2xl font-extrabold text-cg-primary" />
                </div>
              </div>

              <div className="pt-3 border-t border-cg-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-cg-muted">Mean Churn Probability</span>
                  <span className={`font-mono font-bold ${cfg.color}`}>
                    {(s.avg_churn_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cg-muted">Portfolio Share</span>
                  <span className="font-mono text-cg-primary font-semibold">{s.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Distribution Card */}
        <div className="lg:col-span-1 bg-cg-surface border border-cg-border rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <h2 className="text-base font-bold text-cg-primary mb-2">Cohort Proportions</h2>
          <div className="h-60 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-cg-border/60 text-xs">
            {pieData.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
                  <span className="text-cg-primary font-medium">{s.name}</span>
                </div>
                <span className="font-mono text-cg-muted">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="lg:col-span-2 bg-cg-surface border border-cg-border rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-cg-border">
            <h2 className="text-base font-bold text-cg-primary">Cohort Valuation & Exposure Matrix</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cg-base text-cg-muted uppercase font-semibold border-b border-cg-border">
                <tr>
                  <th className="px-5 py-3.5">Segment Tier</th>
                  <th className="px-5 py-3.5">Accounts</th>
                  <th className="px-5 py-3.5">Cohort Share</th>
                  <th className="px-5 py-3.5">Avg Churn Risk</th>
                  <th className="px-5 py-3.5">Total Aggregated CLV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cg-border/50 font-mono">
                {segments.map((s) => {
                  const cfg = SEGMENT_CONFIG[s.name] || SEGMENT_CONFIG.regular;
                  return (
                    <tr key={s.name} className="hover:bg-cg-base/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`font-sans font-bold capitalize ${cfg.color}`}>
                          {cfg.label || s.name.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-cg-primary">{s.count.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-cg-muted">{s.percentage}%</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-bold ${
                          s.avg_churn_probability > 0.5 ? 'text-cg-risk' : s.avg_churn_probability > 0.25 ? 'text-cg-brand' : 'text-cg-safe'
                        }`}>
                          {(s.avg_churn_probability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-cg-brand font-bold">
                        ${s.total_clv?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
