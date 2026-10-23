import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { IndustrialProduct, User } from '../types/index.ts';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';

interface IndustrialProductsViewProps {
  user: User;
  onNavigateNew: () => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string, title?: string) => void;
}

export const IndustrialProductsView: React.FC<IndustrialProductsViewProps> = ({
  user,
  onNavigateNew,
  onOpenSsoModal,
}) => {
  const [products, setProducts] = useState<IndustrialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IndustrialProduct | null>(null);

  const loadProducts = async () => {
    try {
      const data = await api.getIndustrialProducts({
        search,
        category: categoryFilter,
        status: statusFilter,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleSyncProduct = async (product: IndustrialProduct) => {
    setSyncingId(product.id);
    try {
      const res = await api.syncProduct(product.id);
      await loadProducts();
      // Show confirmation dialog / prompt to open external deep link
      if (confirm(`Product successfully synchronized with silphor.com!\nAuthoritative Target ID: ${res.targetId}\n\nWould you like to open the Industrial Admin page via SSO?`)) {
        onOpenSsoModal('INDUSTRIAL', res.targetAdminUrl, product.title);
      }
    } catch (err: any) {
      alert(`Synchronization failed: ${err.message}\nProduct remains safely in AJ database.`);
      await loadProducts();
    } finally {
      setSyncingId(null);
    }
  };

  const categories = [
    'ALL',
    'CNC Machinery & Robotics',
    'Robotics & Automation',
    'Laser Systems',
    'Industrial Hydraulics',
    'Precision Tooling',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <span>Industrial Products Management</span>
            </h1>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
              Target: silphor.com
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage catalog items, technical specifications, and synchronization to the Silphor Industrial platform
          </p>
        </div>

        <button
          onClick={onNavigateNew}
          className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Industrial Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, title, code..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            onClick={loadProducts}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table (Prompt #8) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-3 px-4">Product ID / SKU</th>
                <th className="py-3 px-4">Product Title & Category</th>
                <th className="py-3 px-4">Control Status</th>
                <th className="py-3 px-4">Sync Status</th>
                <th className="py-3 px-4">Target ID (silphor.com)</th>
                <th className="py-3 px-4">Last Sync</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading industrial products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No industrial products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 font-mono">
                        {prod.sku}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {prod.id}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 truncate max-w-xs">
                        {prod.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {prod.category}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          prod.status === 'PUBLISHED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : prod.status === 'APPROVED'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : prod.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          prod.syncStatus === 'SYNCED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : prod.syncStatus === 'SYNCING'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                            : prod.syncStatus === 'SYNC_FAILED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prod.syncStatus === 'SYNCED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {prod.syncStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {prod.targetProductId ? (
                        <span className="text-emerald-400 font-bold">
                          {prod.targetProductId}
                        </span>
                      ) : (
                        <span className="text-slate-600">Not assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {prod.lastSyncedAt ? new Date(prod.lastSyncedAt).toLocaleString() : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="View Specs & Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleSyncProduct(prod)}
                          disabled={syncingId === prod.id}
                          className="flex items-center space-x-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 cursor-pointer disabled:opacity-50"
                          title="Synchronize to silphor.com"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${syncingId === prod.id ? 'animate-spin' : ''}`}
                          />
                          <span>Sync</span>
                        </button>

                        {prod.targetProductId && (
                          <button
                            onClick={() =>
                              onOpenSsoModal(
                                'INDUSTRIAL',
                                `https://silphor.com/admin/products/${prod.targetProductId}`,
                                prod.title
                              )
                            }
                            className="flex items-center space-x-1 text-[11px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-1 rounded border border-indigo-800 cursor-pointer"
                            title="Open in Industrial Admin"
                          >
                            <span>Admin</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400">{selectedProduct.sku}</div>
                <h2 className="text-base font-bold text-slate-100">{selectedProduct.title}</h2>
                <div className="text-xs text-slate-400">{selectedProduct.category}</div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-1">Description:</div>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedProduct.fullDescription}
                </p>
              </div>

              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div>
                  <div className="text-slate-400 font-semibold mb-2">Technical Specifications:</div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-slate-850 py-1">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-mono text-slate-200 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div>
                  <div className="text-slate-400 font-semibold mb-2">Key Engineering Features:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    {selectedProduct.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sync Metadata */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Target System: </span>
                  <span className="text-indigo-400 font-bold">silphor.com</span>
                </div>
                <div>
                  <span className="text-slate-400">Target Product ID: </span>
                  <span className="text-emerald-400 font-bold">
                    {selectedProduct.targetProductId || 'PENDING_SYNC'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
