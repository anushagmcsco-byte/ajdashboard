import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { EducationCourse, User } from '../types/index.ts';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Eye,
} from 'lucide-react';

interface EducationCoursesViewProps {
  user: User;
  onNavigateNew: () => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string, title?: string) => void;
}

export const EducationCoursesView: React.FC<EducationCoursesViewProps> = ({
  user,
  onNavigateNew,
  onOpenSsoModal,
}) => {
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<EducationCourse | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEducationCourses({
        search,
        category: categoryFilter,
        status: statusFilter,
      });
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError(err.message || 'Failed to retrieve education courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const handleSyncCourse = async (course: EducationCourse) => {
    setSyncingId(course.id);
    try {
      const res = await api.syncCourse(course.id);
      await loadCourses();
      if (confirm(`Course successfully synchronized with silper.co.in!\nAuthoritative Target ID: ${res.targetId}\n\nWould you like to open the Education Admin page via SSO?`)) {
        onOpenSsoModal('EDUCATION', res.targetAdminUrl, course.title);
      }
    } catch (err: any) {
      alert(`Synchronization failed: ${err.message}\nCourse remains safely stored in AJ database.`);
      await loadCourses();
    } finally {
      setSyncingId(null);
    }
  };

  const categories = [
    'ALL',
    'Automation & Embedded Systems',
    'Precision Manufacturing',
    'Industrial Robotics',
    'Robotic Process Automation',
    'CAD / CAM Design Engineering',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span>Education Course Management</span>
            </h1>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-mono">
              Target: silper.co.in
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage training curriculum, batches, instructors, and synchronization to the Silphor Education platform
          </p>
        </div>

        <button
          onClick={onNavigateNew}
          className="flex items-center space-x-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Education Course</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadCourses}
            className="text-[11px] bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-750 px-2.5 py-1 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, instructors, codes..."
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
            onClick={loadCourses}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table (Prompt #13) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-3 px-4">Course ID / Code</th>
                <th className="py-3 px-4">Course Title & Category</th>
                <th className="py-3 px-4">Duration & Mode</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Tuition (INR)</th>
                <th className="py-3 px-4">Sync Status</th>
                <th className="py-3 px-4">Target ID (silper.co.in)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading education courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No education courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 font-mono">
                        {course.courseCode}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {course.id}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 truncate max-w-xs">
                        {course.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {course.category}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-mono">{course.duration}</div>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                        {course.mode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {course.instructor}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      ₹{course.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          course.syncStatus === 'SYNCED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : course.syncStatus === 'SYNCING'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                            : course.syncStatus === 'SYNC_FAILED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {course.syncStatus === 'SYNCED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {course.syncStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {course.targetCourseId ? (
                        <span className="text-emerald-400 font-bold">
                          {course.targetCourseId}
                        </span>
                      ) : (
                        <span className="text-slate-600">Not assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="View Curriculum"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleSyncCourse(course)}
                          disabled={syncingId === course.id}
                          className="flex items-center space-x-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700 cursor-pointer disabled:opacity-50"
                          title="Synchronize to silper.co.in"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${syncingId === course.id ? 'animate-spin' : ''}`}
                          />
                          <span>Sync</span>
                        </button>

                        {course.targetCourseId && (
                          <button
                            onClick={() =>
                              onOpenSsoModal(
                                'EDUCATION',
                                `https://silper.co.in/admin/courses/${course.targetCourseId}`,
                                course.title
                              )
                            }
                            className="flex items-center space-x-1 text-[11px] bg-amber-950 hover:bg-amber-900 text-amber-300 px-2 py-1 rounded border border-amber-800 cursor-pointer"
                            title="Open in Education Admin"
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

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-amber-400">{selectedCourse.courseCode}</div>
                <h2 className="text-base font-bold text-slate-100">{selectedCourse.title}</h2>
                <div className="text-xs text-slate-400">
                  {selectedCourse.category} • {selectedCourse.duration}
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-1">Course Overview:</div>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedCourse.courseOverview}
                </p>
              </div>

              {selectedCourse.curriculum && selectedCourse.curriculum.length > 0 && (
                <div>
                  <div className="text-slate-400 font-semibold mb-2">Curriculum Modules:</div>
                  <div className="space-y-2">
                    {selectedCourse.curriculum.map((mod, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>{mod.title}</span>
                          <span className="text-cyan-400 font-mono">{mod.hours} Hours</span>
                        </div>
                        {mod.topics && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            Topics: {mod.topics.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target info */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Target System: </span>
                  <span className="text-amber-400 font-bold">silper.co.in</span>
                </div>
                <div>
                  <span className="text-slate-400">Target Course ID: </span>
                  <span className="text-emerald-400 font-bold">
                    {selectedCourse.targetCourseId || 'PENDING_SYNC'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCourse(null)}
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
