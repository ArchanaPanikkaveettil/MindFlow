// components/StudentProfile/StudentProfile.js
"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/router';
import { User, Heart, TrendingUp, AlertCircle, Phone, Mail, GraduationCap } from 'lucide-react';
import styles from "./StudentProfile.module.scss";

// Utility to format date for display
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function StudentProfile() {
    const router = useRouter();
    // Get the studentId (which is the loginId) from the URL query
    const { loginId } = router.query; 

    const [profile, setProfile] = useState(null);
    const [moodHistory, setMoodHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // NEW: State to hold extracted email
    const [studentEmail, setStudentEmail] = useState('N/A'); 

    // --- Fetch Student Profile and Mood History ---
    useEffect(() => {
        // Ensure router is ready and we have the loginId
        if (!router.isReady || !loginId) return;
        
        const fetchStudentData = async () => {
            const token = localStorage.getItem('authToken');
            const userRole = localStorage.getItem('userRole');

            if (!token || Number(userRole) !== 1) { // Must be a Counselor
                router.replace('/login');
                return;
            }
            
            setIsLoading(true);
            setError(null);

            try {
                // Backend endpoint: GET /counselor/students/profile/:studentId
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/students/profile/${loginId}`, 
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                const studentData = response.data.data.profile;
                
                setProfile(studentData);
                setMoodHistory(response.data.data.moodHistory);
                
                // FIX: Set email state using the 'email' property injected by the backend (Routes/counselorRouter.js)
                setStudentEmail(studentData.email || 'Email unavailable');


            } catch (err) {
                console.error("Student Profile Fetch Error:", err);
                const errorMessage = err.response?.data?.message || "Failed to fetch student details.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudentData();
    }, [router.isReady, loginId, router]); // Dependency on router readiness and loginId
    
    
    // --- Conditional Renderings ---
    if (isLoading) {
        return (
          <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center' }}>
            <p>Loading student profile and mood history...</p>
          </div>
        );
    }
    
    if (error) {
        return (
            <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center', color: 'red' }}>
                <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                <p>{error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center' }}>
                <p>No student profile found for this ID.</p>
            </div>
        );
    }


    return (
        <div className={`wrap pt_50 pb_100`}>
            <div className={styles.profileContainer}>
                
                {/* --- Profile Card --- */}
                <div className={styles.profileCard}>
                    <div className={styles.header}>
                        <User size={30} className={styles.icon} />
                        <h1 className={styles.title}>{profile.name}</h1>
                        <p className={styles.subtitle}>Student Profile Overview</p>
                    </div>

                    <div className={styles.infoSection}>
                        <p><GraduationCap size={20} /> Class/Group: <strong>{profile.classOrGroup || 'N/A'}</strong></p>
                        <p><Phone size={20} /> Phone: <strong>{profile.phone || '-'}</strong></p>
                        {/* Display the email fetched from the backend (username from login model) */}
                        <p><Mail size={20} /> Email: <strong>{studentEmail}</strong></p> 
                        <p><Heart size={20} /> Gender: <strong>{profile.gender || '-'}</strong></p>
                    </div>
                </div>

                {/* --- Mood History Section --- */}
                <div className={styles.moodSection}>
                    <h2 className={styles.sectionTitle}>
                        <TrendingUp size={24} /> Recent Mood History
                    </h2>
                    
                    {moodHistory.length === 0 ? (
                        <p className={styles.empty}>No mood logs available for this student.</p>
                    ) : (
                        <div className={styles.moodList}>
                            {moodHistory.map((log) => (
                                <div key={log._id} className={styles.moodLog}>
                                    <div className={styles.logHeader}>
                                        <span className={styles.emotion}>Feeling: {log.emotion}</span>
                                        <span className={styles.date}>{formatDate(log.loggedAt)}</span>
                                    </div>
                                    <div className={styles.logDetails}>
                                        {/* FIX: Displays raw number value without markdown (**) */}
                                        <p>Intensity: {log.intensity}/10</p> 
                                        <p className={styles.score}>Normalized Score: {log.moodScore}/10</p>
                                    </div>
                                    {log.notes && <p className={styles.logNotes}>Notes: {log.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
