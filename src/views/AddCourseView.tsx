import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User, EducationCourse } from '../types/index.ts';
import {
  GraduationCap,
  PlusCircle,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';

interface AddCourseViewProps {
  user: User;
  onSuccess: () => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string, title?: string) => void;
  initialDraft?: Partial<EducationCourse>;
}

export const AddCourseView: React.FC<AddCourseViewProps> = ({
  user,
  onSuccess,
  onOpenSsoModal,
  initialDraft,
}) => {
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [courseCode, setCourseCode] = useState(initialDraft?.courseCode || '');
  const [category, setCategory] = useState(initialDraft?.category || 'Automation & Embedded Systems');
  const [duration, setDuration] = useState(initialDraft?.duration || '12 Weeks (90 Hours)');
  const [instructor, setInstructor] = useState(initialDraft?.instructor || 'Dr. Anand Deshpande');
  const [trainer, setTrainer] = useState(initialDraft?.trainer || 'Suresh Rao');
  const [description, setDescription] = useState(initialDraft?.description || '');
  const [courseOverview, setCourseOverview] = useState(initialDraft?.courseOverview || '');

  // Curriculum Builder
  const [curriculum, setCurriculum] = useState<{ title: string; hours: number; topics: string[] }[]>([
    { title: 'Module 1: Industrial Fieldbus & Sensors', hours: 24, topics: ['4-20mA loops', 'Modbus TCP'] },
    { title: 'Module 2: PLC Programming & SCADA', hours: 36, topics: ['TIA Portal', 'WinCC Unified'] },
  ]);

  const [price, setPrice] = useState<number>(initialDraft?.price || 35000);
  const [discount, setDiscount] = useState<number>(initialDraft?.discount || 10);
  const [batchInfo, setBatchInfo] = useState(initialDraft?.batchInfo || 'Batch 10 starting Nov 15, 2026');
  const [mode, setMode] = useState<'ONLINE' | 'OFFLINE' | 'HYBRID'>(initialDraft?.mode || 'HYBRID');
  const [certificateAvailable, setCertificateAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [syncBroadcastStatus, setSyncBroadcastStatus] = useState('Synced');

  // Cross-device draft heartbeat
  useEffect(() => {
    const draftPayload = {
      title,
      courseCode,
      category,
      duration,
      instructor,
      trainer,
      description,
      courseOverview,
      curriculum,
      price,
      discount,
      batchInfo,
      mode,
    };

    setSyncBroadcastStatus('Saving...');
    const timer = setTimeout(() => {
      api.sendDeviceHeartbeat({
        activeView: 'education-new-course',
        currentDraft: draftPayload,
      }).then(() => {
        setSyncBroadcastStatus('Synced to all devices');
      }).catch(console.error);
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, courseCode, category, duration, instructor, trainer, description, courseOverview, curriculum, price, discount, batchInfo, mode]);

  const addModule = () => {
    setCurriculum([...curriculum, { title: 'New Module', hours: 20, topics: ['Topic 1', 'Topic 2'] }]);
  };

  const removeModule = (index: number) => {
    setCurriculum(curriculum.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, field: 'title' | 'hours', val: any) => {
    const updated = [...curriculum];
    (updated[index] as any)[field] = val;
    setCurriculum(updated);
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISH_AND_SYNC') => {
    setError(null);
    if (!title || !courseCode || !category || !duration || !instructor || !batchInfo) {
      setError('Please provide Course Title, Code, Duration, Instructor, and Batch details.');
      return;
    }

    setLoading(true);
    try {
      const initialStatus = submitStatus === 'PUBLISH_AND_SYNC' ? 'APPROVED' : submitStatus;

      // 1. Save course in AJ Backend
      const created = await api.createCourse({
        title,
        courseCode,
        category,
        description: description || title,
        courseOverview: courseOverview || description || title,
        duration,
        instructor,
        trainer,
        curriculum,
        price,
        discount,
        batchInfo,
        mode,
        certificateAvailable,
        status: initialStatus,
      });

      api.sendDeviceHeartbeat({
        activeView: 'education-courses',
        currentDraft: {},
      }).catch(console.error);

      // Scenario 2: Synchronize to silper.co.in
      if (submitStatus === 'PUBLISH_AND_SYNC') {
        const syncRes = await api.syncCourse(created.id);
        setSuccessResult({
          created,
          synced: true,
          targetId: syncRes.targetId,
          targetUrl: syncRes.targetUrl,
          targetAdminUrl: syncRes.targetAdminUrl,
        });
      } else if (submitStatus === 'PENDING_APPROVAL') {
        await api.createChangeRequest({
          title: `Publish Education Course: ${title} (${courseCode})`,
          type: 'COURSE_PUBLISH',
          referenceId: created.id,
          referenceTitle: title,
          changeSummary: `New training course added for curriculum enrollment on silper.co.in. Code: ${courseCode}`,
          proposedChanges: { courseCode, duration, price, instructor },
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
      setError(err.message || 'Failed to save education course');
    } finally {
      setLoading(false);
    }
  };

  if (successResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {successResult.synced
              ? 'Education Course Created & Synchronized!'
              : successResult.submittedApproval
              ? 'Course Saved & Submitted for Review!'
              : 'Course Saved as Draft!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative AJ Course ID: <strong className="text-amber-400 font-mono">{successResult.created.id}</strong>
          </p>
        </div>

        {successResult.synced && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Website:</span>
              <span className="text-amber-400 font-bold">https://silper.co.in</span>
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
            Back to Courses List
          </button>

          {successResult.synced && (
            <>
              <a
                href={successResult.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
              >
                <span>Open Education Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() =>
                  onOpenSsoModal('EDUCATION', successResult.targetAdminUrl, title)
                }
                className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Open Education Admin (SSO)</span>
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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Create Education Course & Curriculum</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict content routing: Education courses synchronize exclusively to <strong className="text-amber-400 font-mono">silper.co.in</strong>
          </p>
        </div>

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

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Course Overview & Batch Logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Industrial Automation with PLC & SCADA"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                placeholder="EDU-AUT-401"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Automation & Embedded Systems">Automation & Embedded Systems</option>
                <option value="Precision Manufacturing">Precision Manufacturing</option>
                <option value="Industrial Robotics">Industrial Robotics</option>
                <option value="CAD / CAM Design Engineering">CAD / CAM Design Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration *
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="16 Weeks (120 Hours)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Delivery Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="HYBRID">Hybrid (Online Theory + Lab)</option>
                <option value="OFFLINE">Offline (Hubli Factory Lab)</option>
                <option value="ONLINE">Online Interactive Live</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lead Instructor *
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Dr. Anand Deshpande"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Batch Schedule Details *
              </label>
              <input
                type="text"
                value={batchInfo}
                onChange={(e) => setBatchInfo(e.target.value)}
                placeholder="Batch 14 starting Nov 10 (Evening Batch)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tuition Fee (INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Early Bird Discount (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course Overview & Syllabus Summary
            </label>
            <textarea
              rows={3}
              value={courseOverview}
              onChange={(e) => setCourseOverview(e.target.value)}
              placeholder="Comprehensive industry training curriculum..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Curriculum Modules */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Modules & Hours
            </h3>
            <button
              type="button"
              onClick={addModule}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          <div className="space-y-3">
            {curriculum.map((mod, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Module Title"
                  value={mod.title}
                  onChange={(e) => updateModule(idx, 'title', e.target.value)}
                  className="w-2/3 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                />
                <div className="flex items-center space-x-1 w-1/3">
                  <input
                    type="number"
                    placeholder="Hours"
                    value={mod.hours}
                    onChange={(e) => updateModule(idx, 'hours', Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                  />
                  <span className="text-xs text-slate-400">Hrs</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeModule(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
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
              className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Publish & Synchronize to silper.co.in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
