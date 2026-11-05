import React, { useState, useMemo } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Search,
  Filter,
  Download,
  Boxes,
  Shield,
  Eye,
  ArrowUpDown,
  Tag,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getPhysicalStatusBadge,
  getCommercialStatusBadge,
  getERPSyncBadge,
} from '../../utils/formatters';
import { PhysicalStatus, CommercialStatus } from '../../types';

export const InventoryPage: React.FC = () => {
  const { stones, erpEvents, users, openStoneDetail } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhysical, setFilterPhysical] = useState<string>('ALL');
  const [filterCommercial, setFilterCommercial] = useState<string>('ALL');
  const [filterCustodian, setFilterCustodian] = useState<string>('ALL');
  const [filterExceptionsOnly, setFilterExceptionsOnly] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<'id' | 'carat' | 'value' | 'updated'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filteredStones = useMemo(() => {
    return stones.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesCert = s.certificateReference.toLowerCase().includes(q);
        const matchesShape = s.shape.toLowerCase().includes(q);
        if (!matchesId && !matchesCert && !matchesShape) return false;
      }

      // Physical status
      if (filterPhysical !== 'ALL' && s.physicalStatus !== filterPhysical) {
        return false;
      }

      // Commercial status
      if (filterCommercial !== 'ALL' && s.commercialStatus !== filterCommercial) {
        return false;
      }

      // Custodian
      if (filterCustodian !== 'ALL' && s.activeCustodianId !== filterCustodian) {
        return false;
      }

      // Exceptions Only
      if (filterExceptionsOnly && s.physicalStatus !== 'Exception' && s.commercialStatus !== 'Requires Review') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      else if (sortField === 'carat') comparison = a.carat - b.carat;
      else if (sortField === 'value') comparison = a.estimatedValueUSD - b.estimatedValueUSD;
      else if (sortField === 'updated') comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortAsc ? comparison : -comparison;
    });
  }, [stones, searchQuery, filterPhysical, filterCommercial, filterCustodian, filterExceptionsOnly, sortField, sortAsc]);

  const handleExportCSV = () => {
    const headers = [
      'Stone ID',
      'Certificate',
      'Carat',
      'Shape',
      'Colour',
      'Clarity',
      'Estimated Value USD',
      'Physical Status',
      'Current Location',
      'Active Custodian',
      'Commercial Status',
      'Last Updated',
    ];

    const rows = filteredStones.map((s) => [
      s.id,
      s.certificateReference,
      s.carat,
      s.shape,
      s.colour,
      s.clarity,
      s.estimatedValueUSD,
      s.physicalStatus,
      `"${s.currentLocationId}"`,
      `"${users.find((u) => u.id === s.activeCustodianId)?.name || s.activeCustodianId}"`,
      s.commercialStatus,
      s.updatedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simstar_diamond_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              One-of-a-Kind Diamond Exhibition Inventory
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {filteredStones.length} of {stones.length} Stones
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Certified GIA stone records with orthogonal physical custody and commercial state
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm flex items-center space-x-2 transition shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Inventory CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Stone ID, Certificate, Shape..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Physical Status Filter */}
          <div>
            <select
              value={filterPhysical}
              onChange={(e) => setFilterPhysical(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Physical Status: All</option>
              <option value="In Safe">In Safe</option>
              <option value="Requested">Requested</option>
              <option value="Dispatched">Dispatched / In Transit</option>
              <option value="In Cabin">In Cabin</option>
              <option value="Return Requested">Return Requested</option>
              <option value="Return Transit">Return Transit</option>
              <option value="In Safe after return">In Safe after return</option>
              <option value="Exception">Custody Exception</option>
            </select>
          </div>

          {/* Commercial State Filter */}
          <div>
            <select
              value={filterCommercial}
              onChange={(e) => setFilterCommercial(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none"
            >
              <option value="ALL">Commercial State: All</option>
              <option value="Available">Available</option>
              <option value="Hold">On Hold</option>
              <option value="Memo">On Memo</option>
              <option value="Sale Pending ERP">Sale Pending ERP</option>
              <option value="ERP Accepted">ERP Accepted</option>
              <option value="Requires Review">Requires Review</option>
            </select>
          </div>

          {/* Exceptions Toggle */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterExceptionsOnly}
                onChange={(e) => setFilterExceptionsOnly(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Exceptions Only</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th
                  onClick={() => {
                    setSortField('id');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Stone ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('carat');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Carat / Shape</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Colour / Clarity</th>
                <th
                  onClick={() => {
                    setSortField('value');
                    setSortAsc(!sortAsc);
                  }}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Est. Value</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Physical Custody</th>
                <th className="px-4 py-3">Current Location</th>
                <th className="px-4 py-3">Active Custodian</th>
                <th className="px-4 py-3">Commercial State</th>
                <th className="px-4 py-3">ERP Sync</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStones.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500 text-xs">
                    No diamond records match the applied filters.
                  </td>
                </tr>
              ) : (
                filteredStones.map((st) => {
                  const physicalBadge = getPhysicalStatusBadge(st.physicalStatus);
                  const commercialBadge = getCommercialStatusBadge(st.commercialStatus);
                  const erpEvt = erpEvents.find((e) => e.stoneId === st.id);
                  const erpBadge = erpEvt ? getERPSyncBadge(erpEvt.syncStatus) : null;
                  const custodianName = users.find((u) => u.id === st.activeCustodianId)?.name || (st.activeCustodianId === 'SYSTEM_VAULT' ? 'Safe Room' : st.activeCustodianId);

                  return (
                    <tr
                      key={st.id}
                      onClick={() => openStoneDetail(st.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-brand-600">
                        {st.id}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {st.certificateReference}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {st.carat} ct
                        <span className="block text-[11px] text-slate-600 font-normal">{st.shape}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-800">
                        <span className="font-semibold text-slate-900">{st.colour}</span> / {st.clarity}
                        <span className="block text-[10px] text-slate-500">{st.cut}</span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatUSD(st.estimatedValueUSD)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${physicalBadge.bg} ${physicalBadge.text} ${physicalBadge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${physicalBadge.dot}`} />
                          <span>{physicalBadge.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-800 truncate max-w-[160px]">
                        {st.currentLocationId}
                      </td>

                      <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[140px]">
                        {custodianName}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${commercialBadge.bg} ${commercialBadge.text} ${commercialBadge.border}`}
                        >
                          <span>{commercialBadge.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {erpBadge ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${erpBadge.bg} ${erpBadge.text}`}>
                            {erpBadge.label}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500">Synced</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openStoneDetail(st.id);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
