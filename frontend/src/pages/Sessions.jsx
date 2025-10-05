import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Sessions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Session creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    sportId: "",
    date: "",
    venue: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, sportsRes] = await Promise.all([
        api.get("/sessions"),
        api.get("/sports"),
      ]);

      setSessions(sessionsRes.data.sessions || []);
      setSports(sportsRes.data.sports || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.sportId || !formData.date || !formData.venue) {
      setFormError("All fields are required");
      return;
    }

    try {
      await api.post("/sessions", formData);
      setFormData({ sportId: "", date: "", venue: "" });
      setShowCreateForm(false);
      fetchData(); // Refresh sessions list
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create session");
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await api.post(`/sessions/${sessionId}/join`);
      alert("Successfully joined the session!");
      fetchData(); // Refresh to show updated player count
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join session");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isUserJoined = (session) => {
    return session.players?.some((player) => player.id === user?.id);
  };

  const isUserCreator = (session) => {
    return session.creator?.id === user?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Sports Sessions</h1>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Session Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 font-semibold shadow-md transition-all"
          >
            {showCreateForm ? "Cancel" : "Create New Session"}
          </button>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">Create New Session</h3>
            <form onSubmit={handleCreateSession}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Sport
                  </label>
                  <select
                    value={formData.sportId}
                    onChange={(e) =>
                      setFormData({ ...formData, sportId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a sport</option>
                    {sports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    placeholder="Enter venue location"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-sm mb-4">{formError}</p>
              )}

              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded hover:from-orange-600 hover:to-red-700 shadow-md transition-all"
              >
                Create Session
              </button>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Available Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">
                No active sessions available. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {session.sport?.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(session.date)}
                      </p>
                      <p>
                        <span className="font-semibold">Venue:</span>{" "}
                        {session.venue}
                      </p>
                      <p>
                        <span className="font-semibold">Organizer:</span>{" "}
                        {session.creator?.name}
                      </p>
                      <p>
                        <span className="font-semibold">Players:</span>{" "}
                        {session.players?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    {isUserCreator(session) ? (
                      <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded text-sm text-center font-semibold">
                        You created this session
                      </div>
                    ) : isUserJoined(session) ? (
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm text-center font-semibold">
                        ✓ You've joined this session
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoinSession(session.id)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded hover:from-orange-600 hover:to-red-700 shadow-md transition-all font-semibold"
                      >
                        Join Session
                      </button>
                    )}
                  </div>

                  {session.players && session.players.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Participants:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {session.players.map((player) => (
                          <span
                            key={player.id}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {player.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
