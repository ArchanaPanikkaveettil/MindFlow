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

// Utility to format time for display
const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  try {
    const [hour, minute] = timeString.split(":");
    let hours = parseInt(hour, 10);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutePart = minute || '00'; 
    return `${hours.toString().padStart(2, "0")}:${minutePart} ${period}`;
  } catch (e) {
    return timeString;
  }
};

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
    
    // --- New States for Managing Existing Slots ---
    const [mySlots, setMySlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    // --- Authentication Check & Fetch on Mount ---
    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (Number(userRole) !== 1) {
             if (localStorage.getItem('authToken')) {
                router.replace('/dashboard'); // Unauthorized access attempt
            } else {
                router.replace('/login');
            }
        } else {
            fetchMySlots();
        }
    }, [router]);

    const fetchMySlots = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setSlotsLoading(true);
        setSlotsError("");
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URI}/counselor/availability`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setMySlots(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching my slots:", err);
            setSlotsError("Failed to fetch slots list.");
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleToggleSlot = async (slotId) => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URI}/counselor/availability/toggle/${slotId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setMySlots(prev => prev.map(slot => slot._id === slotId ? { ...slot, isAvailable: res.data.data.isAvailable } : slot));
            }
        } catch (err) {
            console.error("Error toggling slot:", err);
            alert("Failed to update slot status.");
        }
    };

    const handleDeleteSlot = async (slotId, isBooked) => {
        if (isBooked) {
            const confirmCancel = window.confirm("This slot is already booked by a student. Deleting this slot will cancel the student booking. Are you sure you want to cancel and delete?");
            if (!confirmCancel) return;
        } else {
            const confirmDelete = window.confirm("Are you sure you want to delete this availability slot?");
            if (!confirmDelete) return;
        }

        const token = localStorage.getItem('authToken');
        try {
            const res = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URI}/counselor/availability/${slotId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setMySlots(prev => prev.filter(slot => slot._id !== slotId));
            }
        } catch (err) {
            console.error("Error deleting slot:", err);
            alert("Failed to delete slot.");
        }
    };

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
                fetchMySlots(); // Refresh list after publishing new slots
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

            {/* Manage Availability Slots Section */}
            <div className={`${styles.availabilityCard} mt_40`}>
                <h2 className={styles.sectionTitle} style={{ color: "var(--color2)" }}><CalendarDays size={24} /> Manage Existing Slots</h2>
                <p className={styles.subtitle}>View, block, or delete your scheduled slots and manage active sessions.</p>

                {slotsLoading && <p>Loading your slots...</p>}
                {slotsError && <p className={styles.errorText}>{slotsError}</p>}

                {!slotsLoading && mySlots.length === 0 && (
                    <p className={styles.empty}>You have not added any availability slots yet.</p>
                )}

                {!slotsLoading && mySlots.length > 0 && (
                    <div className={styles.manageSlotsContainer}>
                        <div className={styles.slotsTableWrapper}>
                            <table className={styles.slotsTable}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Student / Details</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mySlots.map((slot) => {
                                        const dateStr = new Date(slot.date).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                        });
                                        const displayTime = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

                                        return (
                                            <tr key={slot._id} className={slot.isBooked ? styles.rowBooked : ''}>
                                                <td className={styles.dateCell}>{dateStr}</td>
                                                <td>{displayTime}</td>
                                                <td>
                                                    {slot.isBooked ? (
                                                        <span className={`${styles.badge} ${styles.badgeBooked}`}>Booked</span>
                                                    ) : slot.isAvailable ? (
                                                        <span className={`${styles.badge} ${styles.badgeAvailable}`}>Available</span>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles.badgeBlocked}`}>Blocked</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {slot.isBooked ? (
                                                        <div>
                                                            <strong>{slot.userId?.name || "Student"}</strong>
                                                            {slot.userId?.phone && <span className={styles.studentPhone}> ({slot.userId.phone})</span>}
                                                        </div>
                                                    ) : (
                                                        <span className={styles.mutedText}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        {!slot.isBooked && (
                                                            <button
                                                                onClick={() => handleToggleSlot(slot._id)}
                                                                className={`${styles.actionBtn} ${slot.isAvailable ? styles.btnBlock : styles.btnUnblock}`}
                                                                title={slot.isAvailable ? "Block Slot" : "Make Available"}
                                                            >
                                                                {slot.isAvailable ? "Block" : "Unblock"}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot._id, slot.isBooked)}
                                                            className={`${styles.actionBtn} ${styles.btnDelete}`}
                                                            title="Delete Slot"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}