"use client";
import React from "react";
import { MessageCircle, TrendingUp, Calendar, Heart, BookOpen } from "lucide-react"; // Added BookOpen icon
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
            <Link href="/my-bookings" className={"common_btn"}>
              View Bookings
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}