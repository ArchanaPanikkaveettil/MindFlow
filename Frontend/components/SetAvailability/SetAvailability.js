// components/SetAvailability/SetAvailability.js
"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/router';
import { CalendarDays, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import styles from "./SetAvailability.module.scss";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Defines the fixed time slots available for booking (1 hour each)
const FIXED_SLOTS = [
    { start: "10:00", end: "11:00", display: "10:00 AM" },
    { start: "11:00", end: "12:00", display: "11:00 AM" },
    { start: "12:00", end: "13:00", display: "12:00 PM" },
    { start: "13:00", end: "14:00", display: "01:00 PM" },
    { start: "14:00", end: "15:00", display: "02:00 PM" },
    { start: "15:00", end: "16:00", display: "03:00 PM" },
];

// Utility to filter out past dates
const isDayAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

export default function SetAvailability() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(null); 
    const [selectedSlots, setSelectedSlots] = useState([]); // Array of {start, end} objects
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', message: string }
    
    // --- Authentication Check (Client-side) ---
    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (Number(userRole) !== 1) {
             if (localStorage.getItem('authToken')) {
                router.replace('/dashboard'); // Unauthorized access attempt
            } else {
                router.replace('/login');
            }
        }
    }, [router]);


    // --- Handlers ---

    const toggleSlot = (slot) => {
        // Check if slot is already selected
        const index = selectedSlots.findIndex(s => s.start === slot.start);
        if (index > -1) {
            // Deselect: remove it from the array
            setSelectedSlots(prev => prev.filter(s => s.start !== slot.start));
        } else {
            // Select: add it to the array
            setSelectedSlots(prev => [...prev, slot]);
        }
    };

    // components/SetAvailability/SetAvailability.js (Only the handlePublish function is changed)

const handlePublish = async () => {
    if (!selectedDate || selectedSlots.length === 0) {
        setStatusMessage({ type: 'error', message: "Please select a date and at least one time slot." });
        return;
    }

    const token = localStorage.getItem('authToken');
    setIsSaving(true);
    setStatusMessage(null);

    const publishPromises = selectedSlots.map(slot => {
        const dateOnly = selectedDate.toISOString().split('T')[0];

        return axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/availability/set`,
            {
                date: dateOnly,
                startTime: slot.start,
                endTime: slot.end
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
    });

    try {
        const results = await Promise.allSettled(publishPromises);
        
        const successfulCount = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
        const totalAttempts = selectedSlots.length; // Same as results.length
        
        // --- REVISED MESSAGE LOGIC START ---
        let message;
        let type;

        if (successfulCount > 0 && successfulCount === totalAttempts) {
            // Case 1: All succeeded
            message = `${successfulCount} slot(s) published successfully.`;
            type = 'success';
        } else if (successfulCount > 0 && successfulCount < totalAttempts) {
            // Case 2: Some succeeded, some failed (Duplicates)
            // We only show the successful count to hide the failure detail, as requested
            message = `${successfulCount} slot(s) published successfully.`; 
            type = 'success';
        } else {
            // Case 3: All failed (Unlikely, but handles critical errors or full failure)
            message = `Failed to publish any slots. Please try again.`;
            type = 'error';
        }
        // --- REVISED MESSAGE LOGIC END ---

        // Clear selections on success
        if (successfulCount > 0) {
            setSelectedSlots([]); 
            setSelectedDate(null);
        }
        
        setStatusMessage({ 
            type: type, 
            message: message 
        });

    } catch (err) {
        console.error("Publish Availability Error:", err);
        setStatusMessage({ type: 'error', message: "A critical error occurred during publishing." });
    } finally {
        setIsSaving(false);
    }
};

    // --- Render Component ---

    return (
        <div className={`wrap pt_100 pb_100`}>
            <div className={styles.availabilityCard}>
                <h1 className={styles.title}>Set Your Availability</h1>
                <p className={styles.subtitle}>Select the dates and 1-hour slots you are available for student bookings.</p>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.success : styles.error}`}>
                        {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <strong>{statusMessage.message}</strong>
                    </div>
                )}
                
                {/* 1. Date Picker */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}><CalendarDays size={20} /> Select Date</h2>
                    <div className={styles.datePickerWrapper}>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                setSelectedSlots([]); // Reset slots when date changes
                            }}
                            inline
                            filterDate={isDayAvailable} 
                            minDate={new Date()}
                            calendarClassName={styles.customCalendar}
                            className={styles.dateInput} // Hidden input style, used only for mobile fallback
                        />
                    </div>
                </div>

                {/* 2. Time Slots */}
                {selectedDate && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}><Clock size={20} /> Select Time Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
                        
                        <div className={styles.timeSlotsGrid}>
                            {FIXED_SLOTS.map((slot) => {
                                const isSelected = selectedSlots.some(s => s.start === slot.start);
                                return (
                                    <button
                                        key={slot.start}
                                        className={`${styles.timeSlot} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => toggleSlot(slot)}
                                        disabled={isSaving}
                                    >
                                        {slot.display}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Publish Button */}
                <button
                    className={`${styles.publishButton} common_btn mt_40`}
                    onClick={handlePublish}
                    disabled={!selectedDate || selectedSlots.length === 0 || isSaving}
                >
                    {isSaving ? "Publishing..." : `Publish ${selectedSlots.length} Slot(s)`}
                </button>
            </div>
        </div>
    );
}