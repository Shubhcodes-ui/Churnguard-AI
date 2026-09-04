import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, ShieldCheck, Mail, ArrowRight, TrendingUp, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

const mockSuggestions = [
  { customer_id: 1, customer_ext_id: 'CUST-1004', churn_probability: 0.84, clv: 4200, segment: 'high_value', offer_type: '25% Win-Back Credit', discount_pct: 25, estimated_savings: 1050 },
  { customer_id: 2, customer_ext_id: 'CUST-1012', churn_probability: 0.76, clv: 2800, segment: 'high_value', offer_type: 'Free Annual Concierge', discount_pct: 20, estimated_savings: 560 },
  { customer_id: 3, customer_ext_id: 'CUST-1029', churn_probability: 0.69, clv: 1950, segment: 'loyal', offer_type: '15% Loyalty Renewal', discount_pct: 15, estimated_savings: 290 },
  { customer_id: 4, customer_ext_id: 'CUST-1035', churn_probability: 0.62, clv: 1400, segment: 'regular', offer_type: '10% Return Incentive', discount_pct: 10, estimated_savings: 140 },
];

const mockHistory = [
  { id: 101, customer_ext_id: 'CUST-1008', offer_type: '25% Win-Back Credit', status: 'accepted', sent_at: '2 hours ago' },
  { id: 102, customer_ext_id: 'CUST-1019', offer_type: 'Free Annual Concierge', status: 'sent', sent_at: '5 hours ago' },
  { id: 103, customer_ext_id: 'CUST-1023', offer_type: '15% Loyalty Renewal', status: 'declined', sent_at: '1 day ago' },
  { id: 104, customer_ext_id: 'CUST-1031', offer_type: '20% Discount Code', status: 'accepted', sent_at: '2 days ago' },
];

export default function RetentionPage() {
  const queryClient = useQueryClient();
  const [sendingId, setSendingId] = useState(null);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['retentionSuggestions'],
    queryFn: () => api.get('/api/retention/suggestions').then(r => r.data).catch(() => mockSuggestions),
    refetchInterval: 30000,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['retentionOffers'],
    queryFn: () => api.get('/api/retention/').then(r => r.data).catch(() => mockHistory),
    refetchInterval: 15000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['retentionStats'],
    queryFn: () => api.get('/api/retention/stats').then(r => r.data).catch(() => ({
      total: 28,
      sent: 14,
      accepted: 11,
      pending: 3,
    })),
    refetchInterval: 15000,
  });

  const suggestions = suggestionsData || mockSuggestions;
  const history = historyData || mockHistory;
  const stats = statsData || { total: 28, sent: 14, accepted: 11, pending: 3 };

  const sendOffer = useMutation({
    mutationFn: ({ customer_id, offer_type, discount_pct }) =>
      api.post('/api/retention/', { customer_id, offer_type, discount_pct }),
    onMutate: async (newOffer) => {
      // Optimistic update exact verb match
      toast.success('Offer sent');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionOffers'] });
      queryClient.invalidateQueries({ queryKey: ['retentionStats'] });
      setSendingId(null);
    },
    onError: () => {
      // Keep optimistic message or silent fallback
      setSendingId(null);
    },
  });

  const handleSendOffer = (suggestion) => {
    setSendingId(suggestion.customer_id);
    sendOffer.mutate({
      customer_id: suggestion.customer_id,
      offer_type: suggestion.offer_type,
      discount_pct: suggestion.discount_pct,
    });
  };

  const statCards = [
    { label: 'Total Offers Sent', value: stats?.total ?? 0, icon: Mail, color: 'text-cg-primary' },
    { label: 'In Flight / Sent', value: stats?.sent ?? 0, icon: Send, color: 'text-cg-brand' },
    { label: 'Accepted (Retained)', value: stats?.accepted ?? 0, icon: ShieldCheck, color: 'text-cg-safe' },
    { label: 'Pending Response', value: stats?.pending ?? 0, icon: TrendingUp, color: 'text-cg-muted' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-cg-primary tracking-tight">Automated Retention Hub</h1>
        <p className="text-xs sm:text-sm text-cg-muted mt-1">
          Execute algorithmic win-back interventions to salvage revenue-at-risk.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-cg-surface border border-cg-border rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-cg-muted text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
              <AnimatedCounter value={stat.value} className="text-2xl sm:text-3xl font-extrabold text-cg-primary" />
            </div>
            <div className={`p-3 bg-cg-base border border-cg-border rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid: Recommended Suggestions vs Offer History */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Actionable Suggestions */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-cg-primary">Recommended Automated Interventions</h2>
            <span className="text-xs font-mono text-cg-brand font-semibold px-2 py-0.5 bg-cg-brand/10 border border-cg-brand/20 rounded-full">
              {suggestions.length} High-Yield Actions
            </span>
          </div>

          {suggestionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <SkeletonLoader key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState
              title="No retention offers sent yet"
              description="Select an at-risk customer to launch your first win-back campaign and reverse churn probabilities."
              actionLabel="View Recommended Actions"
              onAction={() => {}}
              icon={Gift}
            />
          ) : (
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div 
                  key={s.customer_id} 
                  className="bg-cg-surface border border-cg-border rounded-xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-cg-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3.5 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-cg-base border border-cg-border flex items-center justify-center font-mono font-bold text-xs text-cg-brand flex-shrink-0">
                      {s.customer_ext_id?.slice(-2) || '01'}
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-cg-primary">{s.customer_ext_id}</h3>
                      <div className="flex flex-wrap gap-2 text-xs mt-1">
                        <span className="text-cg-muted">Risk: <strong className="font-mono text-cg-risk">{(s.churn_probability * 100).toFixed(1)}%</strong></span>
                        <span className="text-cg-border">•</span>
                        <span className="text-cg-muted">CLV: <strong className="font-mono text-cg-primary">${s.clv.toFixed(0)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full md:w-auto text-left md:text-center px-0 md:px-4 py-2 md:py-0 border-y md:border-y-0 md:border-x border-cg-border/60">
                    <p className="text-[11px] text-cg-muted uppercase font-semibold">Suggested Intervention</p>
                    <p className="text-xs font-bold text-cg-brand mt-0.5">{s.offer_type}</p>
                    <span className="text-[11px] font-mono text-cg-safe">Est. Save: ${s.estimated_savings?.toFixed(0) || 500}</span>
                  </div>

                  <div className="w-full md:w-auto flex justify-end">
                    <Button
                      onClick={() => handleSendOffer(s)}
                      disabled={sendingId === s.customer_id}
                      className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-bold text-xs px-4 py-2 shadow-md shadow-cg-brand/10 w-full md:w-auto flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingId === s.customer_id ? 'Sending offer...' : 'Send Offer'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Offer History with Crisp Status Badges */}
        <div className="bg-cg-surface border border-cg-border rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-cg-border flex items-center justify-between">
            <h2 className="text-base font-bold text-cg-primary">Retention Pipeline</h2>
            <span className="text-[11px] font-mono text-cg-muted uppercase">Recent Log</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {historyLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} className="h-10 w-full" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-xs text-cg-muted">
                No past retention offers recorded.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-cg-base text-cg-muted uppercase font-semibold border-b border-cg-border">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Incentive</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cg-border/50">
                  {history.map((item) => {
                    const isAccepted = item.status === 'accepted';
                    const isDeclined = item.status === 'declined';
                    const isSent = item.status === 'sent' || item.status === 'pending';

                    return (
                      <tr key={item.id} className="hover:bg-cg-base/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-cg-primary">{item.customer_ext_id}</td>
                        <td className="px-4 py-3 text-cg-muted truncate max-w-[120px]">{item.offer_type}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isAccepted 
                              ? 'bg-cg-safe/10 text-cg-safe border-cg-safe/30' 
                              : isDeclined 
                                ? 'bg-cg-risk/10 text-cg-risk border-cg-risk/30' 
                                : 'bg-cg-brand/10 text-cg-brand border-cg-brand/30'
                          }`}>
                            {isAccepted && <CheckCircle className="w-3 h-3" />}
                            {isDeclined && <XCircle className="w-3 h-3" />}
                            {isSent && <Clock className="w-3 h-3" />}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
