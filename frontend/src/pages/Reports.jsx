import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Reports = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionReport, setSessionReport] = useState(null);
  const [popularSports, setPopularSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  const handleGenerateReports = async () => {
    setError("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);

      // Fetch both reports
      const [sessionsRes, sportsRes] = await Promise.all([
        api.get(`/reports/sessions?startDate=${startDate}&endDate=${endDate}`),
        api.get(
          `/reports/popular-sports?startDate=${startDate}&endDate=${endDate}`
        ),
      ]);

      setSessionReport(sessionsRes.data);
      setPopularSports(sportsRes.data.popularSports || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate reports");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Reports</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin: {user?.name}</span>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
              Dashboard
            </Link>
            <Link to="/sessions" className="text-gray-600 hover:text-gray-800">
              Sessions
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
        {/* Date Range Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Generate Reports
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <button
                onClick={handleGenerateReports}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all font-semibold"
              >
                {loading ? "Generating..." : "Generate Reports"}
              </button>
            </div>
          </div>
        </div>

        {/* Reports Display */}
        {sessionReport && (
          <>
            {/* Session Count Report */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Session Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Date Range</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(sessionReport.startDate)} -{" "}
                    {formatDate(sessionReport.endDate)}
                  </p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
                  <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {sessionReport.sessionCount}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Average per Day</p>
                  <p className="text-3xl font-bold text-red-600">
                    {(() => {
                      const days = Math.ceil(
                        (new Date(sessionReport.endDate) -
                          new Date(sessionReport.startDate)) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (sessionReport.sessionCount / (days || 1)).toFixed(
                        1
                      );
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Sports Report */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Popular Sports
              </h2>

              {popularSports.length === 0 ? (
                <p className="text-gray-600">
                  No sessions found in the selected date range.
                </p>
              ) : (
                <div className="space-y-4">
                  {popularSports.map((item, index) => (
                    <div key={item.sport.id} className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-800">
                            {item.sport.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {item.sessionCount}{" "}
                            {item.sessionCount === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (item.sessionCount /
                                  popularSports[0].sessionCount) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Export Report
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(
                      {
                        sessionReport,
                        popularSports,
                      },
                      null,
                      2
                    );
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `sports-report-${startDate}-to-${endDate}.json`;
                    link.click();
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded hover:from-orange-600 hover:to-red-700 shadow-md transition-all font-semibold"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    const csvContent = [
                      ["Sport", "Session Count"],
                      ...popularSports.map((item) => [
                        item.sport.name,
                        item.sessionCount,
                      ]),
                    ]
                      .map((row) => row.join(","))
                      .join("\n");

                    const dataBlob = new Blob([csvContent], {
                      type: "text/csv",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `popular-sports-${startDate}-to-${endDate}.csv`;
                    link.click();
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded hover:from-orange-600 hover:to-red-700 shadow-md transition-all font-semibold"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </>
        )}

        {/* Initial State */}
        {!sessionReport && !loading && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Reports Generated
            </h3>
            <p className="text-gray-600">
              Select a date range above and click "Generate Reports" to view
              statistics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
