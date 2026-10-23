import React, { useState, useEffect } from 'react';
import { api, clearStoredToken } from './services/api.ts';
import { User, IndustrialProduct, EducationCourse } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, NavView } from './components/Sidebar.tsx';
import { DeviceSyncModal } from './components/DeviceSyncModal.tsx';
import { SsoHandoffModal } from './components/SsoHandoffModal.tsx';
import { LoginView } from './views/LoginView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { ManagedWebsitesView } from './views/ManagedWebsitesView.tsx';
import { IndustrialProductsView } from './views/IndustrialProductsView.tsx';
import { AddProductView } from './views/AddProductView.tsx';
import { EducationCoursesView } from './views/EducationCoursesView.tsx';
import { AddCourseView } from './views/AddCourseView.tsx';
import { SyncDashboardView } from './views/SyncDashboardView.tsx';
import { ApprovalsView } from './views/ApprovalsView.tsx';
import { FeaturesView } from './views/FeaturesView.tsx';
import { IncidentsView } from './views/IncidentsView.tsx';
import { AuditView } from './views/AuditView.tsx';
import { UsersRolesView } from './views/UsersRolesView.tsx';
import { SecurityView } from './views/SecurityView.tsx';
import { RefreshCw, Smartphone, ArrowRight, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Modals
  const [isDeviceSyncOpen, setIsDeviceSyncOpen] = useState(false);
  const [ssoTarget, setSsoTarget] = useState<'INDUSTRIAL' | 'EDUCATION' | null>(null);
  const [ssoDeepLink, setSsoDeepLink] = useState<string | undefined>(undefined);
  const [ssoItemTitle, setSsoItemTitle] = useState<string | undefined>(undefined);

  // Cross-device draft resume banner state
  const [remoteDraftNotification, setRemoteDraftNotification] = useState<{
    draft: any;
    sourceDevice: string;
    lastSyncAt: string;
  } | null>(null);
  const [resumedDraftData, setResumedDraftData] = useState<any>(null);

  // Active devices count
  const [activeDeviceCount, setActiveDeviceCount] = useState(1);

  // Check initial session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.getSession();
        setUser(res.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('aj_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('aj_auth_expired', handleAuthExpired);
  }, []);

  // Periodic device sync check
  useEffect(() => {
    if (!user) return;

    const checkDevices = async () => {
      try {
        const state = await api.getCrossDeviceState();
        setActiveDeviceCount(state.devicesCount || 1);

        // If another device has an uncommitted draft that isn't empty
        if (state.latestDraft && state.sourceDevice) {
          setRemoteDraftNotification({
            draft: state.latestDraft,
            sourceDevice: state.sourceDevice,
            lastSyncAt: state.lastSyncAt || new Date().toISOString(),
          });
        }
      } catch (err) {
        // silent sync poll
      }
    };

    checkDevices();
    const interval = setInterval(checkDevices, 12000); // Poll cross-device state
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    clearStoredToken();
    setUser(null);
  };

  const handleOpenSsoModal = (
    site: 'INDUSTRIAL' | 'EDUCATION',
    deepLink?: string,
    title?: string
  ) => {
    setSsoTarget(site);
    setSsoDeepLink(deepLink);
    setSsoItemTitle(title);
  };

  const handleResumeRemoteDraft = (draft: any, activeView: string) => {
    setResumedDraftData(draft);
    if (activeView === 'industrial-new-product') {
      setCurrentView('industrial-new-product');
    } else if (activeView === 'education-new-course') {
      setCurrentView('education-new-course');
    }
    setRemoteDraftNotification(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-900/30">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-xs font-mono tracking-wider">
          Initializing AJ Enterprise Solutions Control Plane...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenDeviceSync={() => setIsDeviceSyncOpen(true)}
        onOpenSsoModal={handleOpenSsoModal}
        deviceSyncCount={activeDeviceCount}
      />

      {/* Cross-Device State Sync Banner Alert */}
      {remoteDraftNotification && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/80 px-6 py-2.5 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-2.5">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300">
              Unsaved draft detected on <strong className="text-cyan-300 font-mono">{remoteDraftNotification.sourceDevice}</strong> ({new Date(remoteDraftNotification.lastSyncAt).toLocaleTimeString()}):
              <strong className="text-slate-100 font-semibold ml-1 font-mono">
                {remoteDraftNotification.draft.title || remoteDraftNotification.draft.sku || 'Form in progress'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                handleResumeRemoteDraft(
                  remoteDraftNotification.draft,
                  remoteDraftNotification.draft.sku ? 'industrial-new-product' : 'education-new-course'
                )
              }
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
            >
              <span>Resume Draft Here</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setRemoteDraftNotification(null)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex flex-1">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'device-sync') {
              setIsDeviceSyncOpen(true);
            } else {
              setCurrentView(view);
            }
          }}
          user={user}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              user={user}
              onNavigate={setCurrentView}
              onOpenSsoModal={handleOpenSsoModal}
              onOpenDeviceSync={() => setIsDeviceSyncOpen(true)}
            />
          )}

          {currentView === 'managed-websites' && (
            <ManagedWebsitesView
              user={user}
              onOpenSsoModal={handleOpenSsoModal}
              onNavigateSync={(site) => {
                setCurrentView(site === 'INDUSTRIAL' ? 'industrial-sync' : 'education-sync');
              }}
            />
          )}

          {currentView === 'industrial-products' && (
            <IndustrialProductsView
              user={user}
              onNavigateNew={() => setCurrentView('industrial-new-product')}
              onOpenSsoModal={handleOpenSsoModal}
            />
          )}

          {currentView === 'industrial-new-product' && (
            <AddProductView
              user={user}
              onSuccess={() => setCurrentView('industrial-products')}
              onOpenSsoModal={handleOpenSsoModal}
              initialDraft={resumedDraftData}
            />
          )}

          {currentView === 'industrial-sync' && (
            <SyncDashboardView
              user={user}
              onOpenSsoModal={handleOpenSsoModal}
              defaultSiteFilter="INDUSTRIAL"
            />
          )}

          {currentView === 'education-courses' && (
            <EducationCoursesView
              user={user}
              onNavigateNew={() => setCurrentView('education-new-course')}
              onOpenSsoModal={handleOpenSsoModal}
            />
          )}

          {currentView === 'education-new-course' && (
            <AddCourseView
              user={user}
              onSuccess={() => setCurrentView('education-courses')}
              onOpenSsoModal={handleOpenSsoModal}
              initialDraft={resumedDraftData}
            />
          )}

          {currentView === 'education-sync' && (
            <SyncDashboardView
              user={user}
              onOpenSsoModal={handleOpenSsoModal}
              defaultSiteFilter="EDUCATION"
            />
          )}

          {currentView === 'approvals' && <ApprovalsView user={user} />}

          {currentView === 'integrations' && (
            <ManagedWebsitesView
              user={user}
              onOpenSsoModal={handleOpenSsoModal}
              onNavigateSync={(site) => {
                setCurrentView(site === 'INDUSTRIAL' ? 'industrial-sync' : 'education-sync');
              }}
            />
          )}

          {currentView === 'features' && <FeaturesView user={user} />}

          {currentView === 'incidents' && <IncidentsView user={user} />}

          {currentView === 'audit' && <AuditView user={user} />}

          {currentView === 'users-roles' && <UsersRolesView currentUser={user} />}

          {currentView === 'security' && <SecurityView />}
        </main>
      </div>

      {/* Multi-Device Synchronization Modal */}
      <DeviceSyncModal
        isOpen={isDeviceSyncOpen}
        onClose={() => setIsDeviceSyncOpen(false)}
        onResumeDraft={handleResumeRemoteDraft}
      />

      {/* Single-Use SSO Handoff Bridge Modal */}
      {ssoTarget && (
        <SsoHandoffModal
          isOpen={Boolean(ssoTarget)}
          onClose={() => {
            setSsoTarget(null);
            setSsoDeepLink(undefined);
            setSsoItemTitle(undefined);
          }}
          targetSite={ssoTarget}
          deepLinkUrl={ssoDeepLink}
          itemTitle={ssoItemTitle}
        />
      )}
    </div>
  );
}
