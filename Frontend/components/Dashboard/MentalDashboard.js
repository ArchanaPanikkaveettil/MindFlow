"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle, TrendingUp, Calendar, Heart, BookOpen, AlertCircle, CheckCircle, ShieldAlert, Wind } from "lucide-react"; // Added BookOpen icon
import styles from "./MentalDashboard.module.scss";
import Link from "next/link";

export default function MentalDashboard() {
  // 🗓️ Get current date
  const today = new Date();

  // Format like: "October 8th"
  const day = today.getDate();
  const month = today.toLocaleString("default", { month: "long" });
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  const formattedDate = `${month} ${day}${suffix}`;

  // 🌤️ Greeting based on time
  const hours = today.getHours();
  const greeting =
    hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";

  const [latestMood, setLatestMood] = useState(null);
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchDashboardStats = async () => {
      try {
        // Fetch latest mood log
        const moodRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URI}/mood/latest`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (moodRes.data?.data) {
          setLatestMood(moodRes.data.data);
        }

        // Fetch bookings to find the next upcoming one
        const sessionsRes = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URI}/bookings/my-sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sessionsRes.data?.data) {
          const sessions = sessionsRes.data.data;
          const now = new Date();
          const upcoming = sessions
            .filter(s => new Date(s.startTime) > now && s.status === 'booked')
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
          setUpcomingSession(upcoming);
        }
      } catch (err) {
        console.error("Error fetching student dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const isMoodLoggedToday = latestMood && new Date(latestMood.loggedAt).toDateString() === today.toDateString();

  return (
    <div className={"wrap pt_100 pb_100"}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.greeting}>{greeting}</p>
          <h1 className={styles.title}>Today is {formattedDate}</h1>
        </div>

        {/* Cards Grid */}
        <div className={styles.grid}>
          
          {/* Log Your Mood Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <Heart size={32} />
            </div>
            <h3 className={styles.cardTitle}>Log Your Mood</h3>
            <p className={styles.statusText}>
              {loading ? (
                "Checking status..."
              ) : isMoodLoggedToday ? (
                <span className={styles.loggedText}>
                  <CheckCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Today: {latestMood.emotion} ({latestMood.intensity}/10)
                </span>
              ) : (
                <span className={styles.notLoggedText}>
                  <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Not logged yet today
                </span>
              )}
            </p>
            <Link href="/log-mood" className={"common_btn"}>
              Track My Mood
            </Link>
          </div>


          {/* Book A Counselor Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <Calendar size={32} />
            </div>
            <h3 className={styles.cardTitle}>Book A Counselor</h3>
            <p className={styles.statusText}>
              <span className={styles.noSessionText}>Find professional support</span>
            </p>
            <Link href="/book-counselor" className={"common_btn"}>
              Schedule Session
            </Link>
          </div>

          {/* Weekly Report Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPink}`}>
              <TrendingUp size={32} />
            </div>
            <h3 className={styles.cardTitle}>Weekly Report</h3>
            <p className={styles.statusText}>
              <span className={styles.noSessionText}>Track your progress over time</span>
            </p>
            <Link href="/weekly-report" className={"common_btn"}>
              View Progress
            </Link>
          </div>
          
          {/* NEW: My Bookings Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <BookOpen size={32} />
            </div>
            <h3 className={styles.cardTitle}>My Sessions</h3>
            <p className={styles.statusText}>
              {loading ? (
                "Checking sessions..."
              ) : upcomingSession ? (
                <span className={styles.sessionText}>
                  Next: {new Date(upcomingSession.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(upcomingSession.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              ) : (
                <span className={styles.noSessionText}>No upcoming sessions</span>
              )}
            </p>
            <Link href="/my-bookings" className={"common_btn"}>
              View Bookings
            </Link>
          </div>

          {/* NEW: Stress Assessment Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPink}`}>
              <ShieldAlert size={32} />
            </div>
            <h3 className={styles.cardTitle}>Stress Test</h3>
            <p className={styles.statusText}>
              <span className={styles.noSessionText}>Check your anxiety & stress levels</span>
            </p>
            <Link href="/stress-test" className={"common_btn"}>
              Take Stress Test
            </Link>
          </div>

          {/* NEW: Self-Care Corner Card */}
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <Wind size={32} />
            </div>
            <h3 className={styles.cardTitle}>Self-Care Corner</h3>
            <p className={styles.statusText}>
              <span className={styles.noSessionText}>Guided breathing & resources</span>
            </p>
            <Link href="/resources" className={"common_btn"}>
              Relax & Breathe
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}