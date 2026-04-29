import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calculator, LogOut, FileText, Settings, Shield, User } from 'lucide-react';
import { DeviceContext } from '../../App';
import ProjectModal from '../../components/ProjectModal/ProjectModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useProject } from '../../context/ProjectContext';
import './ModeSelection.css';

const ModeSelection = ({ onSelectMode }) => {
  const navigate = useNavigate();
  const { deviceType } = useContext(DeviceContext) || { deviceType: 'desktop' };
  const { refreshProjects, selectCalculation } = useProject();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleProjectCreated = async (newProject) => {
    await refreshProjects();
    if (newProject && newProject.initialCalculation) {
      if (newProject.lockedPressureUnit) {
        localStorage.setItem('pressureUnit', newProject.lockedPressureUnit);
      }
      if (newProject.lockedTemperatureUnit) {
        localStorage.setItem('temperatureUnit', newProject.lockedTemperatureUnit);
      }
      selectCalculation(newProject.initialCalculation);
      sessionStorage.setItem('loadCalculationData', JSON.stringify(newProject.initialCalculation));
      onSelectMode('dashboard-project');
    } else {
      onSelectMode('projects');
    }
    setShowProjectModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="mode-selection-root">
      {/* Top Navigation */}
      <nav className="mode-nav">
        <div className="mode-nav-logo">Vectarc</div>
        <div className="mode-nav-right">
          <button className="mode-nav-logout-btn" onClick={handleLogoutClick}>
            <LogOut size={16} />
            Logout
          </button>
          <div className="user-avatar">
            <User size={20} />
          </div>
        </div>
      </nav>

      <div className="mode-selection-container">
        <div className="mode-header">
          <h1 className="mode-title">Welcome back to Vectarc</h1>
          <p className="mode-subtitle">
            Your precision environment for refrigeration engineering and project management is ready.
          </p>
        </div>

        <div className={`mode-cards-grid ${deviceType === 'mobile' ? 'mobile' : ''} three-cards`}>
          {/* New Project Card */}
          <div className="mode-card action-card new-project" onClick={() => setShowProjectModal(true)}>
            <div className="mode-card-icon-box new-project">
              <Plus size={32} />
            </div>
            <div className="mode-card-content">
              <h2 className="mode-card-title">New Project</h2>
              <p className="mode-card-description">
                Initialize a fresh engineering project with automated system specs and site data templates.
              </p>
            </div>
            <button className="mode-card-btn new-project">Start Creation →</button>
          </div>

          {/* Saved Projects Card */}
          <div className="mode-card action-card saved-projects" onClick={() => onSelectMode('projects')}>
            <div className="mode-card-icon-box saved-projects">
              <FolderOpen size={32} />
            </div>
            <div className="mode-card-content">
              <h2 className="mode-card-title">Saved Projects</h2>
              <p className="mode-card-description">
                Access your vault of active and archived engineering specifications and layouts.
              </p>
            </div>
            <button className="mode-card-btn saved-projects">Browse Files →</button>
          </div>

          {/* Quick Slide Card */}
          <div className="mode-card action-card quick-slide" onClick={() => onSelectMode('dashboard')}>
            <div className="mode-card-icon-box quick-slide">
              <Calculator size={32} />
            </div>
            <div className="mode-card-content">
              <h2 className="mode-card-title">Quick Slide</h2>
              <p className="mode-card-description">
                Instant pressure-temperature conversions and refrigerant property lookups without a full project.
              </p>
            </div>
            <button className="mode-card-btn quick-slide">Open Calculator ⚡</button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="mode-footer">
        <div className="footer-left">
          <strong>Vectarc</strong>
          <span>© 2026 Vectarc. Engineering precision software.</span>
        </div>
        <div className="footer-right">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="https://www.vectarc.com">Contact Support</a>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={confirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
          confirmText="Yes, Logout"
          cancelText="Cancel"
          variant="warning"
        />
      )}

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ModeSelection;
