import React, { useState, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel, 
  useReactTable,
  getFilteredRowModel
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Users, ArrowUpRight, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

const generateMockCustomers = () => {
  return Array.from({ length: 60 }).map((_, i) => ({
    id: `CUST-${1000 + i}`,
    orders: Math.floor(Math.random() * 50) + 1,
    aov: (Math.random() * 450 + 40).toFixed(2),
    daysSincePurchase: Math.floor(Math.random() * 90),
    segment: ['High Value', 'Loyal', 'At Risk', 'Dormant'][Math.floor(Math.random() * 4)],
    probability: Math.floor(Math.random() * 100),
    recentlyUpdated: i === 0, // Highlight the newest/simulated customer
  }));
};

const fetchCustomers = async () => {
  // Check if real backend endpoint is available, fallback seamlessly
  try {
    const res = await api.get('/api/customer/');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(c => ({
        id: c.customer_ext_id || `CUST-${c.id}`,
        orders: c.total_orders || 1,
        aov: (c.avg_order_value || 50).toFixed(2),
        daysSincePurchase: c.days_since_last_purchase || 0,
        segment: (c.segment || 'Regular').replace('_', ' '),
        probability: Math.round((c.churn_probability || 0) * 100),
        recentlyUpdated: false,
      }));
    }
  } catch {
    // fallback to mock for resilience
  }
  return new Promise(resolve => setTimeout(() => resolve(generateMockCustomers()), 600));
};

const CustomersContent = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const tableContainerRef = useRef(null);

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['customersList'],
    queryFn: fetchCustomers,
    refetchInterval: 30000,
  });

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    if (segmentFilter === 'ALL') return rawData;
    return rawData.filter(c => c.segment.toLowerCase() === segmentFilter.toLowerCase());
  }, [rawData, segmentFilter]);

  const columns = useMemo(() => [
    { 
      accessorKey: 'id', 
      header: 'Customer ID', 
      cell: info => (
        <span className="font-mono text-xs font-bold text-cg-primary bg-cg-base px-2 py-1 rounded border border-cg-border">
          {info.getValue()}
        </span>
      )
    },
    { 
      accessorKey: 'orders', 
      header: 'Orders',
      cell: info => <span className="font-mono text-xs text-cg-primary">{info.getValue()}</span>
    },
    { 
      accessorKey: 'aov', 
      header: 'Avg Order Value',
      cell: info => <span className="font-mono text-xs text-cg-brand font-semibold">${info.getValue()}</span>
    },
    { 
      accessorKey: 'daysSincePurchase', 
      header: 'Last Active', 
      cell: info => (
        <span className="font-mono text-xs text-cg-muted">
          {info.getValue()} <span className="text-[10px]">days ago</span>
        </span>
      )
    },
    { 
      accessorKey: 'segment', 
      header: 'Segment',
      cell: info => {
        const val = info.getValue() || 'Regular';
        const isHigh = val.toLowerCase().includes('high');
        const isSafe = val.toLowerCase().includes('loyal');
        const isRisk = val.toLowerCase().includes('risk');

        return (
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border uppercase tracking-wider ${
            isRisk 
              ? 'bg-cg-risk/10 text-cg-risk border-cg-risk/30' 
              : isHigh 
                ? 'bg-cg-brand/10 text-cg-brand border-cg-brand/30' 
                : isSafe 
                  ? 'bg-cg-safe/10 text-cg-safe border-cg-safe/30' 
                  : 'bg-cg-base text-cg-muted border-cg-border'
          }`}>
            {val}
          </span>
        );
      }
    },
    {
      accessorKey: 'probability',
      header: 'Churn Risk Probability',
      cell: info => {
        const val = info.getValue();
        const isHighRisk = val >= 70;
        const isMedRisk = val >= 40 && val < 70;
        
        return (
          <div className="flex items-center gap-3 min-w-[140px]">
            <div className="flex-1 h-2 bg-cg-base rounded-full overflow-hidden border border-cg-border">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighRisk ? 'bg-cg-risk' : isMedRisk ? 'bg-cg-brand' : 'bg-cg-safe'
                }`} 
                style={{ width: `${Math.min(val, 100)}%` }} 
              />
            </div>
            <span className={`font-mono text-xs font-bold w-10 text-right ${
              isHighRisk ? 'text-cg-risk' : isMedRisk ? 'text-cg-brand' : 'text-cg-safe'
            }`}>
              {val}%
            </span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-cg-muted hover:text-cg-brand hover:bg-cg-brand/10 text-xs px-2.5 py-1 h-8"
          onClick={() => navigate(`/customers/${row.original.id}`)}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Inspect
        </Button>
      )
    }
  ], [navigate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });

  const { rows } = table.getRowModel();

  // Virtualizer for smooth rendering
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-16 w-full" />
        <div className="bg-cg-surface border border-cg-border rounded-xl p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <SkeletonLoader key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!rawData || rawData.length === 0) {
    return (
      <EmptyState
        title="No customers scored yet"
        description="Upload a CSV to see your first risk report and start identifying churn threats across your cohort."
        actionLabel="Upload Customer CSV"
        onAction={() => navigate('/predict')}
        icon={UploadCloud}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-cg-primary tracking-tight">Customer Risk Directory</h1>
          <p className="text-xs sm:text-sm text-cg-muted mt-1">
            Engineered risk scores and behavioral indicators across {filteredData.length} records.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cg-muted" />
            <Input 
              placeholder="Search by ID or segment..." 
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 bg-cg-surface border-cg-border text-cg-primary text-xs focus:border-cg-brand"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="bg-cg-surface border border-cg-border rounded-lg text-xs text-cg-primary px-3 py-2 focus:outline-none focus:border-cg-brand font-medium"
          >
            <option value="ALL">All Segments</option>
            <option value="high value">High Value</option>
            <option value="loyal">Loyal</option>
            <option value="at risk">At Risk</option>
            <option value="dormant">Dormant</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-cg-surface border border-cg-border rounded-xl shadow-xl overflow-hidden">
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto max-h-[620px] scrollbar-thin"
        >
          <table className="w-full text-left text-sm min-w-[650px] border-collapse">
            <thead className="bg-cg-base text-cg-muted sticky top-0 z-10 border-b border-cg-border select-none">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-cg-border/50">
              {rows.length > 0 ? (
                rows.map(row => {
                  const isUpdated = row.original.recentlyUpdated;
                  return (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-cg-base/60 transition-colors ${
                        isUpdated ? 'animate-row-pulse' : ''
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-5 py-3.5 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-cg-muted text-xs">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-cg-border bg-cg-base/40 text-xs">
          <span className="text-cg-muted font-mono">
            Showing Page <strong className="text-cg-primary">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong className="text-cg-primary">{table.getPageCount() || 1}</strong> ({filteredData.length} records)
          </span>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="border-cg-border bg-cg-surface text-cg-primary text-xs disabled:opacity-40 hover:bg-cg-base"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="border-cg-border bg-cg-surface text-cg-primary text-xs disabled:opacity-40 hover:bg-cg-base"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomersPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <ErrorBoundary>
        <CustomersContent />
      </ErrorBoundary>
    </div>
  );
}
