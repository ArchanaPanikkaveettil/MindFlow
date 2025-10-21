"use client"; // Keep or remove based on Next.js setup
import React, { useState, useEffect } from 'react'; // Import hooks
import axios from 'axios'; // Import axios
import { useRouter } from 'next/router'; // Import useRouter
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, AlertCircle } from 'lucide-react'; // Import AlertCircle
import styles from './WeekChart.module.scss'
import Link from 'next/link';

// Helper to format date string 'YYYY-MM-DD' to 'Mon', 'Tue' etc.
const formatDay = (dateString) => {
    // Adding time avoids timezone issues where date might shift back
    const date = new Date(dateString + 'T00:00:00');
    // Ensure valid date before formatting
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
};


export default function WeeklyReport() {
    const router = useRouter(); // Initialize router
    const [moodData, setMoodData] = useState([]); // State for fetched data
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [averageMood, setAverageMood] = useState(null); // State for overall average

    // --- NEW: Fetch weekly report data ---
    useEffect(() => {
        const fetchWeeklyReport = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("Not authenticated. Redirecting to login...");
                // Redirect after a delay
                const timer = setTimeout(() => router.replace('/login'), 1500);
                return () => clearTimeout(timer); // Cleanup timeout on unmount
            }

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URI}/mood/report/weekly`, // Backend endpoint
                    {
                        headers: { 'Authorization': `Bearer ${token}` } // Send token
                    }
                );

                console.log("Weekly Report Raw Data:", response.data.data); // Log raw data

                // Process data for the chart
                // Backend sends: [{ _id: "YYYY-MM-DD", averageScore: X }, ...]
                // Chart needs: [{ day: "Mon", mood: X }, ...]
                const processedData = response.data.data.map(item => ({
                    day: formatDay(item._id), // Format 'YYYY-MM-DD' to 'Mon'
                    // Round averageScore to 1 decimal place for display
                    mood: parseFloat(item.averageScore.toFixed(1))
                }));

                // Calculate overall average mood for the week
                if (processedData.length > 0) {
                     const totalScore = processedData.reduce((sum, item) => sum + item.mood, 0);
                     const avg = totalScore / processedData.length;
                     setAverageMood(avg.toFixed(1)); // Store rounded average
                } else {
                    setAverageMood(null); // No data, no average
                }


                setMoodData(processedData); // Update state with processed data

            } catch (err) {
                console.error("Error fetching weekly report:", err);
                const errorMessage = err.response?.data?.message || "Failed to fetch weekly report.";
                setError(errorMessage);
                // Handle auth errors specifically
                if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 400) {
                     // The 400 error is most likely an invalid token, so clear it and redirect
                     localStorage.removeItem('authToken'); // Clear potentially invalid token
                     localStorage.removeItem('userProfile');
                     localStorage.removeItem('userRole');
                     router.replace('/login');
                 }
            } finally {
                setIsLoading(false); // Stop loading
            }
        };

        fetchWeeklyReport();
    }, [router]); // Re-run if router changes (e.g., after redirect)
    // --- END Fetch weekly report data ---


    // --- Loading State Display ---
    if (isLoading) {
        return (
            <div className={'wrap pt_100 pb_100'} style={{ textAlign: 'center' }}>
                Loading weekly report...
            </div>
        );
    }

    // --- Render Component ---
    return (
        <div className={styles.container}>
            <div className={'wrap pt_100 pb_100'}>
                <div className={styles.card}> {/* Assuming a .card wrapper like other pages */}
                    {/* Header with Back Button */}
                    <div className={styles.header}>
                        <Link href={'/dashboard'} className={styles.backButton}>
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className={styles.title}>Weekly Report</h1>
                    </div>

                    {/* Display Error if any */}
                    {error && (
                        <div style={{ color: 'red', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                           <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {/* Chart Section - Use fetched moodData */}
                    <div className={styles.chartSection}>
                        <h2 className={styles.sectionTitle}>Your Mood Journey (Last 7 Days)</h2>
                        <div className={styles.chartWrapper}>
                           {/* Show message if no data */}
                           {moodData.length === 0 && !error && (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>No mood data logged in the past 7 days.</p>
                           )}
                           {/* Render chart only if there is data */}
                           {moodData.length > 0 && (
                                <ResponsiveContainer width="100%" height={400}>
                                    {/* Pass fetched and processed data to the chart */}
                                    <LineChart data={moodData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#BFA2DB" opacity={0.2} />
                                        <XAxis
                                            dataKey="day" // Use the 'day' key ('Mon', 'Tue', etc.)
                                            stroke="#BFA2DB"
                                            tick={{ fontSize: '14px' }} // Use object for tick style
                                        />
                                        <YAxis
                                            stroke="#BFA2DB"
                                            domain={[0, 10]} // Mood score range
                                            tick={{ fontSize: '14px' }} // Use object for tick style
                                        />
                                        <Tooltip
                                            contentStyle={{ // Correct prop for content style
                                                backgroundColor: '#FDFCFB',
                                                border: '2px solid #BFA2DB',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="mood" // Use the 'mood' key (average score)
                                            stroke="#EFBBCF" // Line color
                                            strokeWidth={3}
                                            dot={{ fill: '#BFA2DB', r: 6 }} // Dot style
                                            activeDot={{ r: 8 }} // Style for hovered dot
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                           )}
                        </div>
                    </div>

                    {/* Mood Trends Section - Updated Dynamically */}
                    <div className={styles.trendsSection}>
                        <h2 className={styles.sectionTitle}>Mood Trends</h2>
                        <p className={styles.trendText}>
                           {/* Show dynamic trend based on average */}
                           {averageMood === null && "Not enough data for trends this week."}
                           {averageMood !== null && (
                                <>
                                Your average mood score this week was <span className={styles.highlight}>{averageMood}</span>.
                                {/* Add more detailed trend text based on score */}
                                {averageMood >= 7 ? " Keep up the great work!" : averageMood >= 4 ? " Reflect on what influences your mood." : " Consider reaching out for support if needed."}
                                </>
                           )}
                        </p>
                    </div>

                    {/* Insights & Suggestions Section (Keep static for now or update based on data) */}
                    <div className={styles.insightsSection}>
                        <h2 className={styles.sectionTitle}>Insights & Suggestions</h2>
                        <div className={styles.insightCard}>
                            <p className={styles.insightText}>
                                Continue mindfulness practice for stress management. Regular check-ins help build self-awareness.
                            </p>
                            <div className={styles.tags}>
                                <span className={styles.tag}>Meditation</span>
                                <span className={styles.tag}>Wellness</span>
                                <span className={styles.tag}>Self-Care</span>
                            </div>
                        </div>
                    </div>
                </div> {/* End Card */}
            </div>
        </div>
    );
}