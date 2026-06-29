/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JobApplication, ApplicationStatus, UserProfile } from './types';
import { INITIAL_APPLICATIONS } from './initialData';

// Component Imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import KanbanBoardView from './components/KanbanBoardView';
import Modal from './components/Modal';
import ApplicationDetails from './components/ApplicationDetails';
import InsightsView from './components/InsightsView';
import ScheduleView from './components/ScheduleView';
import SettingsView from './components/SettingsView';
import SupportView from './components/SupportView';

// Default User Profile matching screenshots
const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  role: 'Senior Product Designer',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUxdSSVnJrLoFK5jfRXKWg23Nw-Gg3yQCV9Gz2Uh8JHuUEbpn1APHgHcCCLVcliw6zOe_Ohvw7kaVH2mghfVZcdk4MSAhiBHtgRWqjowiH2r9P68l--OYboCTvwcil6BeiSQvuaCmAHTv4rQ-Bxb8wxg2ZfCFDt_GwMikUTUt5_uVyes8MiYHU4rf7bpjmft_Pz9ItDgepuGPZ1vEjnp9QAHSfp0souOFnICGfOY596QbpaPj2awgRiD7iO67w0o-leR9501SItQ',
  resumeText: '',
};

export default function App() {
  // Navigation States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubView, setActiveSubView] = useState<'table' | 'kanban'>('table');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Core Database States
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Modal Dialog Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState<JobApplication | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<ApplicationStatus | undefined>(undefined);

  // 1. Initial Data Loading (Local Storage Persistence)
  useEffect(() => {
    // Load applications
    const cachedApps = localStorage.getItem('careerflow_applications');
    if (cachedApps) {
      try {
        const parsed = JSON.parse(cachedApps);
        // Force clear old mock demo data if it matches the first Google mock item
        if (parsed.length > 0 && parsed.some((app: any) => app.id === '1' && app.companyName === 'Google')) {
          setApplications([]);
          localStorage.setItem('careerflow_applications', JSON.stringify([]));
        } else {
          setApplications(parsed);
        }
      } catch (err) {
        console.error('Failed to parse cached applications. Rolling back to default data.', err);
        setApplications([]);
      }
    } else {
      setApplications([]);
      localStorage.setItem('careerflow_applications', JSON.stringify([]));
    }

    // Load user profile
    const cachedProfile = localStorage.getItem('careerflow_profile');
    if (cachedProfile) {
      try {
        setUserProfile(JSON.parse(cachedProfile));
      } catch (err) {
        console.error('Failed to parse cached profile. Resetting to default.', err);
      }
    }
  }, []);

  // Sync Applications database
  const saveApplicationsToCache = (updatedApps: JobApplication[]) => {
    setApplications(updatedApps);
    localStorage.setItem('careerflow_applications', JSON.stringify(updatedApps));

    // Also update any selected active detail panel reference in-memory
    if (selectedApplication) {
      const match = updatedApps.find(app => app.id === selectedApplication.id);
      setSelectedApplication(match || null);
    }
  };

  // Sync User Profile Details
  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('careerflow_profile', JSON.stringify(profile));
  };

  // Restore factory mock demo data
  const handleResetToDemo = () => {
    localStorage.removeItem('careerflow_applications');
    localStorage.removeItem('careerflow_profile');
    setApplications(INITIAL_APPLICATIONS);
    setUserProfile(DEFAULT_PROFILE);
  };

  // 2. Database Triggers (Create, Read, Update, Delete)
  const handleSaveApplication = (formData: Omit<JobApplication, 'id' | 'updatedAt'> & { id?: string }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (formData.id) {
      // Editing existing record
      const updated = applications.map((app) => {
        if (app.id === formData.id) {
          return {
            ...app,
            ...formData,
            updatedAt: todayStr,
          } as JobApplication;
        }
        return app;
      });
      saveApplicationsToCache(updated);
    } else {
      // Creating a brand new record
      const newApp: JobApplication = {
        ...formData,
        id: Math.random().toString(36).substring(2, 9),
        updatedAt: todayStr,
        contacts: [],
        events: [],
      } as JobApplication;

      const updated = [newApp, ...applications];
      saveApplicationsToCache(updated);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = applications.map((app) => {
      if (app.id === id) {
        // Automatically append a quick event log when dragging status
        const statusEvent = {
          id: Math.random().toString(36).substring(2, 9),
          title: `Status updated to ${newStatus.toUpperCase()}`,
          date: todayStr,
        };

        return {
          ...app,
          status: newStatus,
          updatedAt: todayStr,
          events: [...(app.events || []), statusEvent],
        } as JobApplication;
      }
      return app;
    });
    saveApplicationsToCache(updated);
  };

  const handleDeleteApplication = (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    saveApplicationsToCache(updated);
    if (selectedApplication?.id === id) {
      setSelectedApplication(null);
    }
  };

  const handleUpdateSingleApplication = (updatedApp: JobApplication) => {
    const updated = applications.map((app) => (app.id === updatedApp.id ? updatedApp : app));
    saveApplicationsToCache(updated);
  };

  // 3. Navigation helpers
  const handleOpenAddNewJobModal = (presetStatus?: ApplicationStatus) => {
    setApplicationToEdit(null);
    setModalInitialStatus(presetStatus);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setApplicationToEdit(app);
    setIsModalOpen(true);
  };

  const handleSidebarTabClick = (tabId: string) => {
    setSelectedApplication(null); // Close detail panels
    setIsMobileMenuOpen(false); // Close responsive drawers

    if (tabId === 'applications') {
      setActiveTab('dashboard');
      setActiveSubView('table');
    } else if (tabId === 'kanban') {
      setActiveTab('dashboard');
      setActiveSubView('kanban');
    } else {
      setActiveTab(tabId);
    }
  };

  const handleSelectApplicationDetail = (app: JobApplication) => {
    setSelectedApplication(app);
  };

  // Render content based on selected tabs and views
  const renderTabContent = () => {
    if (selectedApplication) {
      return (
        <ApplicationDetails
          application={selectedApplication}
          userProfile={userProfile}
          onBack={() => setSelectedApplication(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteApplication}
          onUpdateApplication={handleUpdateSingleApplication}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        if (activeSubView === 'table') {
          return (
            <DashboardView
              applications={applications}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteApplication}
              onAddNewJob={() => handleOpenAddNewJobModal()}
              activeSubView={activeSubView}
              setActiveSubView={setActiveSubView}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectApplication={handleSelectApplicationDetail}
            />
          );
        } else {
          return (
            <KanbanBoardView
              applications={applications}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteApplication}
              onAddNewJob={handleOpenAddNewJobModal}
              onUpdateStatus={handleUpdateStatus}
              onSelectApplication={handleSelectApplicationDetail}
              activeSubView={activeSubView}
              setActiveSubView={setActiveSubView}
            />
          );
        }
      case 'insights':
        return <InsightsView applications={applications} />;
      case 'schedule':
        return (
          <ScheduleView
            applications={applications}
            onSelectApplication={handleSelectApplicationDetail}
          />
        );
      case 'settings':
        return (
          <SettingsView
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetToDemo}
          />
        );
      case 'support':
        return <SupportView />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-on-surface flex h-screen w-screen overflow-hidden antialiased font-sans select-none relative">
      {/* 1. Desktop Side Navigation Bar (Hidden on Mobile) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeTab={
            activeTab === 'dashboard'
              ? activeSubView === 'table'
                ? 'dashboard'
                : 'kanban'
              : activeTab
          }
          setActiveTab={handleSidebarTabClick}
          onAddNewJob={() => handleOpenAddNewJobModal()}
          userProfile={userProfile}
        />
      </div>

      {/* Mobile navigation Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Slide-out Sidebar Box */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 bg-surface-lowest h-full border-r border-outline-variant shadow-2xl z-10"
            >
              <Sidebar
                activeTab={
                  activeTab === 'dashboard'
                    ? activeSubView === 'table'
                      ? 'dashboard'
                      : 'kanban'
                    : activeTab
                }
                setActiveTab={handleSidebarTabClick}
                onAddNewJob={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenAddNewJobModal();
                }}
                userProfile={userProfile}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Content viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userProfile={userProfile}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        {/* Dashboard Content Canvas */}
        <main className="flex-1 overflow-hidden p-4 md:p-6 bg-background flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeSubView}-${selectedApplication?.id || 'main'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Global Add/Edit Job Application Modal Dialogue */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setApplicationToEdit(null);
          setModalInitialStatus(undefined);
        }}
        onSave={handleSaveApplication}
        applicationToEdit={applicationToEdit}
        initialStatus={modalInitialStatus}
      />
    </div>
  );
}
