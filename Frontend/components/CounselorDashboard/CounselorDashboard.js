"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Calendar, Users, AlertCircle, Clock } from "lucide-react"; // REMOVED: HeartOff
import styles from "./CounselorDashboard.module.scss";
import Link from "next/link";

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const [hour, minute] = timeString.split(":");
    let hours = parseInt(hour, 10);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    // FIX: Ensure minutes are included from the string in case the DB stores MM
    const minutePart = minute || '00'; 
    return `${hours.toString().padStart(2, "0")}:${minutePart} ${period}`;
  } catch (e) {
    return "N/A";
  }
};

// Helper function to format date
const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return "N/A";
  }
};

export default function CounselorDashboard() {
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  // REMOVED: const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch booked sessions (counselor's schedule)
        const scheduleResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/schedule`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSchedule(scheduleResponse.data.data);

        // REMOVED: 2. Fetch low mood alerts
      } catch (err) {
        console.error("Counselor Dashboard Error:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load dashboard data.";
        setError(errorMessage);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (Number(localStorage.getItem("userRole")) === 1) {
      fetchDashboardData();
    } else if (localStorage.getItem("authToken")) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="wrap pt_100 pb_100" style={{ textAlign: "center" }}>
        <p>Loading counselor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="wrap pt_50 pb_100">
      <div className={styles.header}>
        <h1 className={styles.title}>Counselor Dashboard</h1>
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={20} /> {error}
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {/* ====================== Quick Links ====================== */}
        <div className={styles.quickLinks}>
          <h2 className={styles.sectionTitle}>Management Links</h2>
          <div className={styles.linkWrapper}>
            <Link href="/counselor/students-list" className={styles.linkCard}>
              <Users size={28} />
              <span>View All Students</span>
            </Link>
            <Link href="/counselor/set-availability" className={styles.linkCard}>
              <Calendar size={28} />
              <span>Set My Availability</span>
            </Link>
            <Link href="/profile" className={styles.linkCard}>
              <Clock size={28} />
              <span>Update Profile</span>
            </Link>
          </div>
        </div>
        
        {/* REMOVED: Low Mood Alerts Section */}

        {/* ====================== Upcoming Sessions ====================== */}
        <div className={styles.sessionsSection}> 
          <h2 className={styles.sectionTitle}>
            <Calendar size={20} /> Upcoming Sessions ({schedule.length})
          </h2>
          {schedule.length === 0 ? (
            <p className={styles.empty}>No upcoming booked sessions.</p>
          ) : (
            schedule.slice(0, 5).map((session) => (
              <div key={session._id} className={styles.sessionCard}>
                <p className={styles.sessionTime}>
                  <Clock size={16} style={{ marginRight: "5px" }} />
                  {formatDate(session.date)} at {formatTime(session.startTime)}
                </p>
                <p className={styles.studentName}>
                  <Users size={16} style={{ marginRight: "5px" }} />
                  Student: <strong>{session.userId?.name || "N/A"}</strong>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}