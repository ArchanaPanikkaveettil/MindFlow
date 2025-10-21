"use client";
// Add useEffect to imports
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Smile, Frown, Zap, Coffee, Meh, Angry, CloudRain, HeartPulse,
  AlertCircle, CalendarDays // Added CalendarDays icon
} from "lucide-react";
import styles from "./LogMood.module.scss";

// Added default props for clarity
export default function LogMood({
  min = 1, // Default minimum value
  max = 10, // Default maximum value
  step = 1,
  initialValue = 5,
  onChange,
}) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(null);
  const [thoughts, setThoughts] = useState("");
  const [intensity, setIntensity] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // State for the target date, defaults to today
  const [targetDate, setTargetDate] = useState(new Date());
  const [isDateFromUrl, setIsDateFromUrl] = useState(false); // Flag if date came from URL

  // useEffect to read the date from URL query parameter
  useEffect(() => {
    // router.isReady ensures query parameters are available
    if (router.isReady && router.query.date) {
      // Parse date, ensuring correct time zone (T00:00:00 local time)
      const dateFromUrl = new Date(router.query.date + 'T00:00:00');
      // Validate the parsed date
      if (!isNaN(dateFromUrl)) {
        setTargetDate(dateFromUrl);
        setIsDateFromUrl(true);
      } else {
        // Handle invalid date string in URL if necessary, default to today
        setTargetDate(new Date());
        setIsDateFromUrl(false);
      }
    } else if (router.isReady) {
        // If no date in URL, ensure we default to today
        setTargetDate(new Date());
        setIsDateFromUrl(false);
    }
  }, [router.isReady, router.query.date]); // Depend on router readiness and query param

  // Format the target date for display
  const formattedTargetDate = targetDate.toLocaleDateString("en-US", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Mood options array
  const moods = [
    { icon: Frown, label: "Sad" },
    { icon: Angry, label: "Angry" },
    { icon: CloudRain, label: "Anxious" },
    { icon: Meh, label: "Low" },
    { icon: Smile, label: "Happy" },
    { icon: Coffee, label: "Calm" },
    { icon: Zap, label: "Energetic" },
    // { icon: HeartPulse, label: "Excited" }, // Example addition
  ]; //

  // Handler for slider value change
  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value);
    setIntensity(newValue);
    if (onChange) onChange(newValue);
  };

  // Handler for selecting a mood icon
  const handleMoodSelect = (label) => setSelectedMood(label);

  // Handler for submitting the mood log to the backend
  const handleLogMood = async () => {
    setError(null); // Reset error before submission

    // Validation
    if (!selectedMood) {
      setError("Please select how you are feeling.");
      return;
    }

    // Get authentication token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("You need to be logged in to log your mood. Redirecting...");
      setTimeout(() => router.push('/login'), 1500); // Redirect after delay
      return;
    }

    // Prepare data payload for the backend, including the target date
    const moodLogData = {
      emotion: selectedMood,
      intensity: intensity,
      notes: thoughts,
      logDate: targetDate.toISOString() // Send date in ISO format
    };

    setIsLoading(true); // Set loading state

    // API call to backend endpoint
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URI}/mood/log`, // Backend endpoint
        moodLogData,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Authorization header
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Mood Log Success Response:', response.data);
      alert(response.data.message || "Mood logged successfully!"); // Success feedback
      router.push('/dashboard'); // Navigate back to dashboard on success

    } catch (err) { // Error handling
      console.error("Mood Log Error Response:", err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || "Failed to log mood. Please try again.";
      setError(errorMessage); // Display error message inline
      // Optional: Show alert as well
      // alert(errorMessage);

    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="wrap pt_100 pb_100">
      <div className={styles.card}>
        {/* Header - Displays the date being logged */}
        <h1 className={styles.title}>Log Your Mood</h1>
        <p className={styles.subtitle}>
          <CalendarDays size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          Logging for: <strong>{formattedTargetDate}</strong>
        </p>

         {/* --- CORRECTED Error Message Display --- */}
         {error && ( // Check if error exists
            <div style={{ color: 'red', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
               <AlertCircle size={18} /> {error} {/* Display the error message */}
            </div>
        )} {/* End of the conditional rendering block */}
         {/* --- END CORRECTION --- */}

        {/* Mood Icon Selection Grid */}
        <div className={styles.moodGrid}>
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isActive = selectedMood === mood.label;
            return (
              <div
                key={mood.label}
                className={`${styles.moodItem} ${
                  isActive ? styles.active : "" // Applies active style if selected
                }`}
                onClick={() => handleMoodSelect(mood.label)}
              >
                <Icon size={40} />
                <span>{mood.label}</span>
              </div>
            );
          })}
        </div>

        {/* Intensity Slider Section */}
        <div className={styles.sliderSection}>
          <label className={styles.sliderLabel}>
             Rate the intensity ({min}=Low, {max}=High): <strong>{intensity}</strong> {/* Shows current value */}
          </label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min={min} // Sets slider minimum
              max={max} // Sets slider maximum
              step={step}
              value={intensity}
              onChange={handleSliderChange}
              className={styles.slider}
            />
          </div>
          <div className={styles.sliderScale}>
            <span>{min}</span> {/* Displays min value below slider */}
            <span>{max}</span> {/* Displays max value below slider */}
          </div>
        </div>

        {/* Optional Notes Textarea */}
        <div className={styles.thoughtsSection}>
          <label className={styles.optionalLabel}>
            Optional: Add notes about your mood
          </label>
          <textarea
            placeholder="What's on your mind? Any triggers or activities?"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className={styles.textarea}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          className={"common_btn"}
          onClick={handleLogMood} // Calls the submission function
          disabled={isLoading} // Disables button during API call
        >
          {isLoading ? "Logging..." : "Log My Mood"} {/* Changes text during loading */}
        </button>
      </div> {/* End .card */}
    </div> // End .wrap
  );
}