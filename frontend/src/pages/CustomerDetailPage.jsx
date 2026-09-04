import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Mail, Calendar, Phone, Activity, AlertTriangle, Gift, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { RiskRing } from '../components/common/RiskRing';

const fetchCustomerDetail = async (id) => {
  return new Promise(resolve => setTimeout(() => resolve({
    id: id || 'CUST-1001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@enterprise.com',
    phone: '+1 (555) 389-1024',
    joinDate: '2023-04-12',
    segment: 'High Value',
    ltv: 12450,
    churnProbability: 78,
    shapValues: [
      { feature: 'Days since last purchase (54d)', impact: 0.35, direction: 'negative' },
      { feature: 'Cart abandon frequency (5x)', impact: 0.28, direction: 'negative' },
      { feature: 'Return rate spike (24%)', impact: 0.22, direction: 'negative' },
      { feature: 'High historical order value ($420)', impact: -0.18, direction: 'positive' },
      { feature: 'Multi-year tenure (380d)', impact: -0.12, direction: 'positive' }
    ],
    recommendedOffers: [
      { id: 1, name: '25% Win-Back Renewal Discount', successRate: '68%', cost: '$140' },
      { id: 2, name: 'Dedicated Account Strategist Call', successRate: '82%', cost: '$65' },
      { id: 3, name: '$50 Instant Loyalty Credit', successRate: '54%', cost: '$50' }
    ]
  }), 500));
};

const CustomerDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(1);
  const [sending, setSending] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customerDetail', id],
    queryFn: () => fetchCustomerDetail(id)
  });

  const handleSendOfferSubmit = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setShowOfferDialog(false);
      toast.success('Offer sent');
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-10 w-36 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader className="h-72 lg:col-span-1" />
          <SkeletonLoader className="h-72 lg:col-span-2" />
        </div>
        <SkeletonLoader className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/customers')} 
        className="text-cg-muted hover:text-cg-primary hover:bg-cg-surface text-xs -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Customers
      </Button>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cg-primary tracking-tight font-mono">
              {customer.id}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-cg-brand/10 text-cg-brand border border-cg-brand/30 rounded-full">
              {customer.segment}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cg-muted mt-1">{customer.name} • {customer.email}</p>
        </div>

        <Button 
          onClick={() => setShowOfferDialog(true)}
          className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-bold text-xs px-5 py-2.5 shadow-lg shadow-cg-brand/10 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          <span>Send Retention Offer</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="bg-cg-surface rounded-xl p-6 border border-cg-border flex flex-col justify-between shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-cg-primary mb-4 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-cg-brand" />
              Account Metadata
            </h2>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-cg-border/60">
                <span className="text-cg-muted">Email</span>
                <span className="text-cg-primary font-mono">{customer.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cg-border/60">
                <span className="text-cg-muted">Phone</span>
                <span className="text-cg-primary font-mono">{customer.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cg-border/60">
                <span className="text-cg-muted">Joined</span>
                <span className="text-cg-primary font-mono">{customer.joinDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cg-border/60">
                <span className="text-cg-muted">Customer Segment</span>
                <span className="text-cg-brand font-semibold">{customer.segment}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cg-border flex items-center justify-between">
            <span className="text-xs text-cg-muted uppercase font-semibold">Projected Lifetime Value</span>
            <span className="text-xl font-extrabold font-mono text-cg-safe">${customer.ltv.toLocaleString()}</span>
          </div>
        </div>

        {/* Churn Prediction & SHAP Analysis */}
        <div className="bg-cg-surface rounded-xl p-6 border border-cg-border lg:col-span-2 flex flex-col md:flex-row items-center gap-8 shadow-lg">
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center">
            <h2 className="text-xs font-bold text-cg-muted uppercase tracking-wider mb-2">Churn Risk Score</h2>
            <div className="text-5xl font-extrabold font-mono text-cg-risk tabular-nums my-2">
              {customer.churnProbability}%
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-cg-risk bg-cg-risk/10 border border-cg-risk/30 px-3 py-1 rounded-full mt-2">
              <AlertTriangle className="w-3.5 h-3.5" /> High Risk Cohort
            </span>
          </div>

          <div className="hidden md:block w-px h-48 bg-cg-border" />

          {/* SHAP Waterfall Chart */}
          <div className="flex-1 w-full">
            <h2 className="text-xs font-bold text-cg-muted uppercase tracking-wider mb-3">
              SHAP Impact Attributions
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customer.shapValues} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1B2130" />
                  <XAxis type="number" stroke="#8891A6" tick={{ fontSize: 10, fill: '#8891A6', fontFamily: 'JetBrains Mono' }} />
                  <YAxis type="category" dataKey="feature" stroke="#8891A6" tick={{ fontSize: 10, fill: '#E8EAF0' }} width={140} />
                  <Tooltip 
                    cursor={{ fill: '#12161F' }}
                    contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid #232838', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#E8EAF0' }}
                  />
                  <Bar dataKey="impact" barSize={10} radius={[0, 4, 4, 0]}>
                    {customer.shapValues.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.direction === 'negative' ? '#FF6B4A' : '#3ECF8E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-cg-muted mt-2">
              <span className="text-cg-safe">■ Mitigating factors (-)</span>
              <span className="text-cg-risk">■ Churn risk drivers (+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retention Recommendations */}
      <div className="bg-cg-surface rounded-xl p-6 border border-cg-border shadow-lg">
        <h2 className="text-base font-bold text-cg-primary mb-4">Targeted Retention Recommendations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cg-base text-cg-muted uppercase font-semibold border-b border-cg-border">
              <tr>
                <th className="px-4 py-3">Incentive Package</th>
                <th className="px-4 py-3">Model Win-Back Probability</th>
                <th className="px-4 py-3">Incentive Cost</th>
                <th className="px-4 py-3 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cg-border/50">
              {customer.recommendedOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-cg-base/50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-cg-primary">{offer.name}</td>
                  <td className="px-4 py-3.5 font-mono text-cg-safe font-bold">{offer.successRate}</td>
                  <td className="px-4 py-3.5 font-mono text-cg-muted">{offer.cost}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedOffer(offer.id);
                        setShowOfferDialog(true);
                      }}
                      className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-bold text-xs px-3 py-1"
                    >
                      Dispatch Offer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Offer Modal Dialog */}
      {showOfferDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-cg-surface border border-cg-border rounded-xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-cg-primary">Dispatch Win-Back Incentive</h3>
              <p className="text-xs text-cg-muted mt-1">
                Send personalized retention discount to <span className="font-mono text-cg-primary font-bold">{customer.id}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-cg-muted uppercase">Select Retention Package</label>
              <div className="space-y-2">
                {customer.recommendedOffers.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOffer(o.id)}
                    className={`p-3 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-all ${
                      selectedOffer === o.id
                        ? 'bg-cg-brand/10 border-cg-brand text-cg-primary font-semibold'
                        : 'bg-cg-base border-cg-border text-cg-muted hover:border-cg-muted'
                    }`}
                  >
                    <span>{o.name}</span>
                    <span className="font-mono text-cg-safe font-bold">{o.successRate} win rate</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowOfferDialog(false)} 
                className="text-xs text-cg-muted hover:text-cg-primary"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendOfferSubmit}
                disabled={sending}
                className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-bold text-xs px-5 shadow-md shadow-cg-brand/10 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Send Offer'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CustomerDetailPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <ErrorBoundary>
        <CustomerDetailContent />
      </ErrorBoundary>
    </div>
  );
}
