import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [sports, setSports] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSports: 0,
    totalSessions: 0,
    mySessions: 0,
    joinedSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sport creation form (admin only)
  const [showSportForm, setShowSportForm] = useState(false);
  const [newSportName, setNewSportName] = useState("");
  const [sportError, setSportError] = useState("");

  // Sport edit/delete
  const [editingSport, setEditingSport] = useState(null);
  const [editSportName, setEditSportName] = useState("");

  // Session analytics (admin)
  const [analytics, setAnalytics] = useState(null);

  // Cancel/Leave modals
  const [cancelModal, setCancelModal] = useState({
    show: false,
    session: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [leaveModal, setLeaveModal] = useState({ show: false, session: null });
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchDashboardData();
    if (isAdmin()) {
      fetchAnalytics();
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

      const popularRes = await api.get(
        `/reports/popular-sports?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      setAnalytics(popularRes.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sportsRes, mySessionsRes, joinedRes, allSessionsRes] =
        await Promise.all([
          api.get("/sports"),
          api.get("/sessions/my"),
          api.get("/sessions/joined"),
          api.get("/sessions"),
        ]);

      const sportsData = sportsRes.data.sports || [];
      const mySessionsData = mySessionsRes.data.sessions || [];
      const joinedData = joinedRes.data.sessions || [];
      const allSessionsData = allSessionsRes.data.sessions || [];

      setSports(sportsData);
      setMySessions(mySessionsData);
      setJoinedSessions(joinedData);
      setAllSessions(allSessionsData);

      setStats({
        totalSports: sportsData.length,
        totalSessions: allSessionsData.filter((s) => s.status === "active")
          .length,
        mySessions: mySessionsData.length,
        joinedSessions: joinedData.length,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSport = async (e) => {
    e.preventDefault();
    setSportError("");

    if (!newSportName.trim()) {
      setSportError("Sport name is required");
      return;
    }

    try {
      await api.post("/sports", { name: newSportName });
      setNewSportName("");
      setShowSportForm(false);
      fetchDashboardData();
      if (isAdmin()) fetchAnalytics();
    } catch (err) {
      setSportError(err.response?.data?.error || "Failed to create sport");
    }
  };

  const handleEditSport = async (sportId) => {
    setSportError("");

    if (!editSportName.trim()) {
      setSportError("Sport name is required");
      return;
    }

    try {
      await api.put(`/sports/${sportId}`, { name: editSportName });
      setEditingSport(null);
      setEditSportName("");
      fetchDashboardData();
    } catch (err) {
      setSportError(err.response?.data?.error || "Failed to edit sport");
    }
  };

  const handleDeleteSport = async (sportId, sportName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${sportName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/sports/${sportId}`);
      fetchDashboardData();
      if (isAdmin()) fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete sport");
    }
  };

  const handleCancelSession = async () => {
    setModalError("");

    if (!cancelReason.trim()) {
      setModalError("Cancellation reason is required");
      return;
    }

    try {
      await api.put(`/sessions/${cancelModal.session.id}/cancel`, {
        reason: cancelReason,
      });
      setCancelModal({ show: false, session: null });
      setCancelReason("");
      fetchDashboardData();
    } catch (err) {
      setModalError(err.response?.data?.error || "Failed to cancel session");
    }
  };

  const handleLeaveSession = async () => {
    setModalError("");

    try {
      await api.post(`/sessions/${leaveModal.session.id}/leave`);
      setLeaveModal({ show: false, session: null });
      fetchDashboardData();
    } catch (err) {
      setModalError(err.response?.data?.error || "Failed to leave session");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUpcomingSessions = () => {
    return [...mySessions, ...joinedSessions]
      .filter((s) => s.status === "active" && new Date(s.date) > new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Sports Scheduler
                  </h1>
                  <p className="text-xs text-gray-500">
                    {user?.name} • {isAdmin() ? "Administrator" : "Player"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/sessions"
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-all font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Browse Sessions</span>
              </Link>

              {isAdmin() && (
                <Link
                  to="/reports"
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Reports</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-8 py-4 mb-6 flex items-center mt-6 mx-8">
            <svg
              className="w-6 h-6 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Clean Stats Bar */}
        <div className="bg-orange-100 py-12 px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isAdmin() ? "Dashboard Overview" : "Your Sports Activity"}
                </h2>
                <p className="text-gray-700">
                  {isAdmin()
                    ? "Monitor platform activity and manage sports"
                    : "Track your sessions and join new matches"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                      Total Sports
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {stats.totalSports}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                      Active Sessions
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {stats.totalSessions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                      My Sessions
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {stats.mySessions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                      Joined Sessions
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {stats.joinedSessions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Admin Section - Manage Sports */}
              {isAdmin() && (
                <>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Sports Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Add, edit, or remove sports (only if no active
                          sessions)
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSportForm(!showSportForm)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                      >
                        {showSportForm ? "Cancel" : "+ Add Sport"}
                      </button>
                    </div>

                    {showSportForm && (
                      <div className="bg-orange-50 border border-orange-200 p-5 rounded-lg mb-6">
                        <form onSubmit={handleCreateSport}>
                          <label className="block text-gray-700 text-sm font-medium mb-2">
                            Sport Name
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={newSportName}
                              onChange={(e) => setNewSportName(e.target.value)}
                              placeholder="e.g., Cricket, Football, Badminton"
                              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2.5 rounded-lg hover:opacity-90 font-medium"
                            >
                              Create
                            </button>
                          </div>
                          {sportError && (
                            <p className="text-red-600 text-sm mt-2">
                              {sportError}
                            </p>
                          )}
                        </form>
                      </div>
                    )}

                    <div className="space-y-3">
                      {sports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <p className="text-base font-medium">
                            No sports available yet
                          </p>
                          <p className="text-sm">
                            Create your first sport to get started!
                          </p>
                        </div>
                      ) : (
                        sports.map((sport) => (
                          <div
                            key={sport.id}
                            className="border border-gray-200 bg-white p-4 rounded-lg hover:border-orange-300 transition-colors"
                          >
                            {editingSport === sport.id ? (
                              <div className="flex gap-3 items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-xl">🏆</span>
                                </div>
                                <input
                                  type="text"
                                  value={editSportName}
                                  onChange={(e) =>
                                    setEditSportName(e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                  placeholder="Sport name"
                                />
                                <button
                                  onClick={() => handleEditSport(sport.id)}
                                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 font-medium shadow-md transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSport(null);
                                    setEditSportName("");
                                    setSportError("");
                                  }}
                                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🏆</span>
                                  </div>
                                  <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                      {sport.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Created by:{" "}
                                      {sport.creator?.name || "Unknown"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingSport(sport.id);
                                      setEditSportName(sport.name);
                                      setSportError("");
                                    }}
                                    className="text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                                    title="Edit sport"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSport(sport.id, sport.name)
                                    }
                                    className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                    title="Delete sport"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                            {sportError && editingSport === sport.id && (
                              <p className="text-red-600 text-sm mt-2 ml-13">
                                {sportError}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Admin Analytics - Popular Sports */}
                  {analytics &&
                    analytics.popularSports &&
                    analytics.popularSports.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          Sports Popularity (Last 3 Months)
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                          Analyze which sports are most active to improve
                          scheduling
                        </p>

                        <div className="space-y-4">
                          {analytics.popularSports
                            .slice(0, 5)
                            .map((item, index) => {
                              const maxCount =
                                analytics.popularSports[0].sessionCount;
                              const percentage =
                                (item.sessionCount / maxCount) * 100;

                              return (
                                <div key={item.sport.id} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-2xl font-bold text-gray-400 w-6">
                                        #{index + 1}
                                      </span>
                                      <span className="text-lg">🏆</span>
                                      <span className="font-semibold text-gray-900">
                                        {item.sport.name}
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600">
                                      {item.sessionCount} sessions
                                    </span>
                                  </div>
                                  <div className="ml-12">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                  {/* Admin - All Platform Sessions */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      All Platform Sessions
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Monitor and manage all sessions created by players
                    </p>

                    <div className="space-y-3">
                      {allSessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-base font-medium">
                            No sessions yet
                          </p>
                          <p className="text-sm">
                            Sessions will appear here once created
                          </p>
                        </div>
                      ) : (
                        allSessions.slice(0, 10).map((session) => {
                          const isCreator = session.createdBy === user?.id;
                          const playerCount = session.players?.length || 0;
                          const isCancelled = session.status === "cancelled";
                          const isExpired = new Date(session.date) < new Date();

                          return (
                            <div
                              key={session.id}
                              className={`border rounded-lg p-4 ${
                                isCancelled
                                  ? "border-red-200 bg-red-50"
                                  : isExpired
                                  ? "border-gray-200 bg-gray-50"
                                  : "border-orange-200 bg-orange-50"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">🏆</span>
                                    <div>
                                      <h3 className="font-bold text-gray-900">
                                        {session.sport?.name}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {formatDate(session.date)}
                                      </p>
                                    </div>
                                    {isCancelled && (
                                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        CANCELLED
                                      </span>
                                    )}
                                    {isExpired && !isCancelled && (
                                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        EXPIRED
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">
                                    📍 {session.venue}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Organized by:{" "}
                                    {session.creator?.name || "Unknown"} •
                                    Players: {playerCount}/
                                    {session.maxPlayers || 10}
                                  </p>
                                  {isCancelled && session.reason && (
                                    <p className="text-xs text-red-700 mt-2 italic">
                                      Reason: {session.reason}
                                    </p>
                                  )}
                                </div>

                                {!isCancelled && !isExpired && (
                                  <div className="flex gap-2 ml-4">
                                    {isCreator && (
                                      <button
                                        onClick={() => {
                                          setCancelModal({
                                            show: true,
                                            session,
                                          });
                                          setCancelReason("");
                                          setModalError("");
                                        }}
                                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                      >
                                        Cancel Session
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {allSessions.length > 10 && (
                      <Link
                        to="/sessions"
                        className="mt-4 block text-center text-orange-600 hover:text-orange-700 font-medium text-sm py-2 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        View All {allSessions.length} Sessions →
                      </Link>
                    )}
                  </div>
                </>
              )}

              {/* Player Section - Available Sports */}
              {!isAdmin() && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Available Sports
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sports.length === 0 ? (
                      <div className="col-span-2 text-center py-12 text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-base font-medium">
                          No sports available yet
                        </p>
                        <p className="text-sm">
                          Check back later for available sports!
                        </p>
                      </div>
                    ) : (
                      sports.map((sport) => (
                        <div
                          key={sport.id}
                          className="border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-5 rounded-lg hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl">🏆</span>
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">
                                {sport.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Available to join
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/sessions"
                    className="border-2 border-orange-200 bg-orange-50 p-6 rounded-xl hover:border-orange-300 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Create Session
                        </h3>
                        <p className="text-sm text-gray-600">
                          Organize a new match
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/sessions"
                    className="border-2 border-orange-200 bg-orange-50 p-6 rounded-xl hover:border-orange-300 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          Find Matches
                        </h3>
                        <p className="text-sm text-gray-600">
                          Browse available sessions
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Upcoming Sessions
                </h3>

                <div className="space-y-3">
                  {getUpcomingSessions().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">
                        No upcoming sessions
                      </p>
                      <p className="text-xs text-gray-500">
                        Create or join a session!
                      </p>
                    </div>
                  ) : (
                    getUpcomingSessions().map((session) => (
                      <div
                        key={session.id}
                        className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg hover:bg-orange-100 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">🏆</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">
                              {session.sport?.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatDate(session.date)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              📍 {session.venue}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/sessions"
                  className="mt-4 block text-center text-orange-600 hover:text-orange-700 font-medium text-sm py-2 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  View All Sessions →
                </Link>
              </div>

              {/* User Role Info */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isAdmin() ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Account Type</p>
                    <p className="text-lg font-bold">
                      {isAdmin() ? "Administrator" : "Player"}
                    </p>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  {isAdmin()
                    ? "You have full access to manage sports, oversee sessions, and view reports."
                    : "Join sessions, create matches, and connect with other players."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Session Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Session
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to cancel:{" "}
              <strong>{cancelModal.session?.sport?.name}</strong> at{" "}
              {cancelModal.session?.venue}
            </p>

            <label className="block text-gray-700 text-sm font-medium mb-2">
              Cancellation Reason (Required)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors mb-4"
              rows="4"
            />

            {modalError && (
              <p className="text-red-600 text-sm mb-4">{modalError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelSession}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => {
                  setCancelModal({ show: false, session: null });
                  setCancelReason("");
                  setModalError("");
                }}
                className="flex-1 text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-lg font-medium"
              >
                Keep Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Session Modal */}
      {leaveModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Leave Session
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave:{" "}
              <strong>{leaveModal.session?.sport?.name}</strong> at{" "}
              {leaveModal.session?.venue}?
            </p>

            {modalError && (
              <p className="text-red-600 text-sm mb-4">{modalError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleLeaveSession}
                className="flex-1 bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 font-medium"
              >
                Confirm Leave
              </button>
              <button
                onClick={() => {
                  setLeaveModal({ show: false, session: null });
                  setModalError("");
                }}
                className="flex-1 text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-lg font-medium"
              >
                Stay in Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
