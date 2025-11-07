import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Chatbot from './chat/Chatbot';
import { requestSocketToken } from '@/utils/tokenHelper';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { state, logout } = useAuth();
  const [socketToken, setSocketToken] = useState<string | null>(null);

  // Fetch socket token when component mounts
  useEffect(() => {
    const fetchSocketToken = async () => {
      if (state.isAuthenticated) {
        const token = await requestSocketToken();
        setSocketToken(token);
      }
    };
    fetchSocketToken();
  }, [state.isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-nav">
          <h1>Dashboard</h1>
          <div className="user-menu">
            <span className="user-greeting">Welcome, {state.user?.name}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>User Information</h2>
          <div className="user-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{state.user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{state.user?.email}</span>
            </div>
            <div className="info-item">
              <label>User ID:</label>
              <span>{state.user?.id}</span>
            </div>
            {state.user?.createdAt && (
              <div className="info-item">
                <label>Member Since:</label>
                <span>
                  {new Date(state.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-button">
              <span className="action-icon">👤</span>
              <span>Profile Settings</span>
            </button>
            <button className="action-button">
              <span className="action-icon">🔒</span>
              <span>Change Password</span>
            </button>
            <button className="action-button">
              <span className="action-icon">📊</span>
              <span>View Analytics</span>
            </button>
            <button className="action-button">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">Just now</span>
              <span className="activity-text">Successfully logged in</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <span className="activity-text">Profile updated</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 day ago</span>
              <span className="activity-text">Password changed</span>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      {state.isAuthenticated && <Chatbot token={socketToken} />}
    </div>
  );
};

export default Dashboard;
