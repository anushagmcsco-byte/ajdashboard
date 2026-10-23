import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User, IndustrialProduct } from '../types/index.ts';
import {
  Package,
  PlusCircle,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileText,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Trash2,
  Upload,
} from 'lucide-react';

interface AddProductViewProps {
  user: User;
  onSuccess: () => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string, title?: string) => void;
  initialDraft?: Partial<IndustrialProduct>;
}

export const AddProductView: React.FC<AddProductViewProps> = ({
  user,
  onSuccess,
  onOpenSsoModal,
  initialDraft,
}) => {
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [sku, setSku] = useState(initialDraft?.sku || '');
  const [productCode, setProductCode] = useState(initialDraft?.productCode || '');
  const [category, setCategory] = useState(initialDraft?.category || 'CNC Machinery & Robotics');
  const [subcategory, setSubcategory] = useState(initialDraft?.subcategory || '5-Axis Machining');
  const [shortDescription, setShortDescription] = useState(initialDraft?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialDraft?.fullDescription || '');

  // Dynamic Specs & Features
  const [specList, setSpecList] = useState<{ key: string; value: string }[]>([
    { key: 'Spindle Speed', value: '18,000 RPM Direct-Drive' },
    { key: 'Positioning Accuracy', value: '±0.002 mm ISO 230-2' },
    { key: 'Work Envelope (X/Y/Z)', value: '1050 x 600 x 550 mm' },
  ]);
  const [features, setFeatures] = useState<string[]>([
    'Heavy Meehanite stress-relieved casting',
    'Heidenhain high-resolution optical linear encoders',
    'Integrated Industry 4.0 IoT gateway',
  ]);
  const [newFeature, setNewFeature] = useState('');

  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );
  const [seoKeywords, setSeoKeywords] = useState('industrial CNC, 5-axis precision, Hubli manufacturing');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [syncBroadcastStatus, setSyncBroadcastStatus] = useState('Synced');

  // Cross-device auto-save heartbeat
  useEffect(() => {
    const draftPayload = {
      title,
      sku,
      productCode,
      category,
      subcategory,
      shortDescription,
      fullDescription,
      specList,
      features,
      imageUrl,
    };

    setSyncBroadcastStatus('Saving...');
    const timer = setTimeout(() => {
      api.sendDeviceHeartbeat({
        activeView: 'industrial-new-product',
        currentDraft: draftPayload,
      }).then(() => {
        setSyncBroadcastStatus('Synced to all devices');
      }).catch(console.error);
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, sku, productCode, category, subcategory, shortDescription, fullDescription, specList, features, imageUrl]);

  const addSpecRow = () => {
    setSpecList([...specList, { key: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecList(specList.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index: number, field: 'key' | 'value', text: string) => {
    const updated = [...specList];
    updated[index][field] = text;
    setSpecList(updated);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISH_AND_SYNC') => {
    setError(null);
    if (!title || !sku || !shortDescription || !fullDescription) {
      setError('Please provide Product Title, SKU, and Descriptions.');
      return;
    }

    setLoading(true);
    try {
      const specifications: Record<string, string> = {};
      specList.forEach((s) => {
        if (s.key.trim() && s.value.trim()) {
          specifications[s.key.trim()] = s.value.trim();
        }
      });

      const initialStatus = submitStatus === 'PUBLISH_AND_SYNC' ? 'APPROVED' : submitStatus;

      // 1. Save product in AJ Backend
      const created = await api.createProduct({
        title,
        sku,
        productCode: productCode || `IND-${sku.toUpperCase()}`,
        category,
        subcategory,
        shortDescription,
        fullDescription,
        specifications,
        features,
        images: [imageUrl],
        seoKeywords,
        status: initialStatus,
      });

      // Clear draft on device
      api.sendDeviceHeartbeat({
        activeView: 'industrial-products',
        currentDraft: {},
      }).catch(console.error);

      // If user chose to directly Publish & Sync (Prompt #45 Acceptance Scenario 1)
      if (submitStatus === 'PUBLISH_AND_SYNC') {
        const syncRes = await api.syncProduct(created.id);
        setSuccessResult({
          created,
          synced: true,
          targetId: syncRes.targetId,
          targetUrl: syncRes.targetUrl,
          targetAdminUrl: syncRes.targetAdminUrl,
        });
      } else if (submitStatus === 'PENDING_APPROVAL') {
        // Create change request for approval workflow
        await api.createChangeRequest({
          title: `Publish Industrial Product: ${title} (${sku})`,
          type: 'PRODUCT_PUBLISH',
          referenceId: created.id,
          referenceTitle: title,
          changeSummary: `New industrial machinery spec added for catalog publication to silphor.com. SKU: ${sku}`,
          proposedChanges: { sku, category, specifications },
        });

        setSuccessResult({
          created,
          submittedApproval: true,
        });
      } else {
        setSuccessResult({
          created,
          isDraft: true,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save industrial product');
    } finally {
      setLoading(false);
    }
  };

  // Success view with deep-link redirection (Prompt #11 & #45)
  if (successResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {successResult.synced
              ? 'Industrial Product Created & Synchronized!'
              : successResult.submittedApproval
              ? 'Product Saved & Submitted for Review!'
              : 'Product Saved as Draft!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative AJ Product ID: <strong className="text-indigo-400 font-mono">{successResult.created.id}</strong>
          </p>
        </div>

        {successResult.synced && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Website:</span>
              <span className="text-indigo-400 font-bold">https://silphor.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authoritative Target ID:</span>
              <span className="text-emerald-400 font-bold">{successResult.targetId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Status:</span>
              <span className="text-emerald-400 font-bold">CONFIRMED & PUBLISHED</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onSuccess}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            Back to Products List
          </button>

          {successResult.synced && (
            <>
              <a
                href={successResult.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <span>Open Industrial Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() =>
                  onOpenSsoModal('INDUSTRIAL', successResult.targetAdminUrl, title)
                }
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Open Industrial Admin (SSO)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Cross-Device indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Create Industrial Machinery / Component</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict content routing: Industrial products synchronize exclusively to <strong className="text-indigo-400 font-mono">silphor.com</strong>
          </p>
        </div>

        {/* Device Sync Real-time Draft Status */}
        <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400">Multi-Device Draft:</span>
          <span className="text-[11px] font-mono font-semibold text-cyan-300">
            {syncBroadcastStatus}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Product Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            General Machinery Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Title / Model Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Silphor High-Speed 5-Axis VMC 850"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Keeping Unit (SKU) *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="SLP-VMC-850"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Code
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="IND-EQ-850"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="CNC Machinery & Robotics">CNC Machinery & Robotics</option>
                <option value="Robotics & Automation">Robotics & Automation</option>
                <option value="Laser Systems">Laser Systems</option>
                <option value="Industrial Hydraulics">Industrial Hydraulics</option>
                <option value="Precision Tooling">Precision Tooling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Vertical Machining Centers"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Description (Catalog Summary) *
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="High-torque 5-axis vertical machining center engineered for aerospace-grade precision milling."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Full Engineering Description *
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed description of structure, cooling, spindle torque curves, and manufacturing capabilities..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Technical Specifications Key-Value Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Parametric Technical Specifications
            </h3>
            <button
              type="button"
              onClick={addSpecRow}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>

          <div className="space-y-2">
            {specList.map((row, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Parameter (e.g. Spindle Speed)"
                  value={row.key}
                  onChange={(e) => updateSpecRow(idx, 'key', e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 15,000 RPM)"
                  value={row.value}
                  onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(idx)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Engineering Features */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Key Engineering Highlights
          </h3>

          <div className="space-y-2">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-200"
              >
                <span>• {f}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add engineering highlight..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Media & SEO */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Media Asset & Public SEO Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SEO Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="CNC milling, aerospace precision"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions with Production Approvals */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSubmit('PENDING_APPROVAL')}
              disabled={loading}
              className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('PUBLISH_AND_SYNC')}
              disabled={loading}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Publish & Synchronize to silphor.com</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
