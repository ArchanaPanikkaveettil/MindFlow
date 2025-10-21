"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios'; 
import { useRouter } from 'next/router'; 
import styles from "./BookCounselor.module.scss";
import { CalendarDays, User, User2, AlertCircle, CheckCircle } from "lucide-react";

// 1. Import DatePicker and its CSS
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Utility to check for available dates (only allows future dates)
const isDayAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

// Map time string (e.g., "10 AM") to 24-hour format (e.g., "10:00")
const timeDisplayTo24Hour = (timeStr) => {
    const [time] = timeStr.split(' ');
    let [hour] = time.split(':');
    hour = parseInt(hour, 10);
    
    // Simple 12 to 24 hour conversion for standard slots (10 AM, 12 PM, etc.)
    if (timeStr.includes('PM') && hour !== 12) {
        hour += 12;
    } else if (timeStr.includes('AM') && hour === 12) {
        hour = 0; // Midnight case, though unlikely in schedule
    }
    return `${String(hour).padStart(2, '0')}:00`; // Ensure HH:00 format
};

// Map 24-hour time to display time (e.g., "10:00" -> "10 AM")
const time24HourToDisplay = (time24h) => {
    const [hourStr, minuteStr] = time24h.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}${minute !== '00' ? ':' + minute : ''} ${period}`;
};


export default function BookCounselor() {
    const router = useRouter();
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null); 
    const [selectedSlot, setSelectedSlot] = useState(null); 

    const [allCounselors, setAllCounselors] = useState([]); 
    const [availability, setAvailability] = useState({}); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter counselors based on selected gender using case-sensitive comparison
    const filteredCounselors = allCounselors.filter(c => c.gender === selectedGender); 
    
    // Derived state: Get available slots for the currently selected date
    const selectedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    const availableTimeSlots = availability[selectedDateStr] || [];

    const isBookingReady = selectedGender && selectedDate && selectedSlot;

    // --- EFFECT 1: Fetch ALL Counselors ---
    useEffect(() => {
        const fetchAllCounselors = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                router.replace('/login');
                return;
            }

            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/list-public`, 
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                setAllCounselors(response.data.data);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching counselors:", err);
                setError(err.response?.data?.message || "Failed to fetch counselor list.");
                setIsLoading(false);
            }
        };

        fetchAllCounselors();
    }, [router]);


    // --- EFFECT 2: Fetch Availability when gender changes ---
    useEffect(() => {
        if (!selectedGender) {
            setAvailability({}); // Clear availability if no gender selected
            return;
        }
        
        const apiGender = selectedGender; 

        const fetchAvailability = async () => {
             const token = localStorage.getItem('authToken');
             setError(null);
             
             try {
                // Hitting the new endpoint with a gender query filter
                 const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/availability/public?gender=${apiGender}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                 );

                 setAvailability(response.data.data);
             } catch (err) {
                 console.error("Error fetching availability:", err);
                 setError(err.response?.data?.message || "Failed to fetch counselor availability.");
                 setAvailability({});
             }
        };

        fetchAvailability();
    }, [selectedGender]);
    
    // --- Handlers ---
    const handleGenderSelect = (gender) => {
        setSelectedGender(gender); 
        // Reset selections when gender changes
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null); // Reset slot when date changes
    };

    const handleTimeSelect = (slot) => {
        // Step 1: Set the selected slot. Do NOT book immediately.
        setSelectedSlot(slot); 
    };


    // --- Booking Submission Handler (Final Logic) ---
    // Now called explicitly by the 'Book Session' button
    const handleBookSession = async () => {
        
        // Use the slot stored in state
        const finalSlot = selectedSlot;
        
        if (!finalSlot || !selectedDate || !selectedGender) {
            // Should not happen if the button is correctly disabled/hidden, but good safeguard
            setError("Internal booking error: Missing slot or date information.");
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsBooking(true);
        
        const token = localStorage.getItem('authToken');
        
        // 1. Prepare Date/Time for Backend 
        const datePart = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Use the selected date and set the time using the startTime string
        const localStartTime = new Date(datePart);
        const [startHour, startMinute] = finalSlot.startTime.split(':').map(Number);
        localStartTime.setHours(startHour, startMinute, 0, 0); 

        const localEndTime = new Date(datePart);
        const [endHour, endMinute] = finalSlot.endTime.split(':').map(Number);
        localEndTime.setHours(endHour, endMinute, 0, 0); 
        
        const bookingPayload = {
            // CRITICAL: Use the counselorId from the SELECTED SLOT
            counselorId: finalSlot.counselorId, 
            startTime: localStartTime.toISOString(),
            endTime: localEndTime.toISOString(),
        };
        
        // 2. API Call
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URI}/bookings/book`, 
                bookingPayload,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Set success message 
            setSuccessMessage(response.data.message || "Session booked successfully! Check your dashboard.");
            
            // Clear selections on success
            setSelectedDate(null);
            setSelectedSlot(null);
            
        } catch (err) {
            console.error("Booking Error:", err);
            const errorMessage = err.response?.data?.message || "Failed to book session. Please choose another slot or counselor.";
            setError(errorMessage);
        } finally {
            setIsBooking(false);
        }
    };


    if (isLoading) {
        return (
            <div className="wrap pt_100 pb_100" style={{ textAlign: 'center' }}>
                <p>Loading counselor options...</p>
            </div>
        );
    }

    // List of dates that have availability for the selected gender
    const availableDates = Object.keys(availability);
    
    // Function passed to DatePicker to disable non-available dates
    const highlightAvailableDays = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        // Only include dates in the availability list AND future dates
        return isDayAvailable(date) && availableDates.includes(dateStr); 
    };

    // Filter the date in the DatePicker to only show available dates (if availableDates is populated)
    const filterDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        // Must be a future date AND either no gender is selected OR the date is in the availability list
        return isDayAvailable(date) && (!selectedGender || availableDates.includes(dateStr));
    };
    
    return (
        <div className={`wrap pt_100 pb_100`}>
            <div className={styles.sessionCard}>
                <h2 className={styles.title}>Book a Counseling Session</h2>

                {/* --- 1. STATUS MESSAGE --- */}
                {successMessage && (
                    <div className={`${styles.statusMessage} ${styles.success} mt_30`} style={{ fontSize: '1.2rem', padding: '1.5rem', margin: '30px auto', maxWidth: '500px' }}>
                        <CheckCircle size={24} style={{ marginRight: '10px' }} /> 
                        <strong>{successMessage}</strong> 
                        <p style={{ marginTop: '10px' }}>
                             <button className={"common_btn mt_20"} onClick={() => router.push('/my-bookings')}>View My Bookings</button>
                        </p>
                    </div>
                )}
                
                {error && (
                    <div className={`${styles.statusMessage} ${styles.error} mt_30`}>
                        <AlertCircle size={18} /> <strong>{error}</strong>
                    </div>
                )}
                
                {/* --- 2. MAIN INTERFACE (Hides if successMessage is present) --- */}
                {!successMessage && (
                  <>
                      {/* Counselor Gender Selection */}
                      <div className={styles.counselorOptions}>
                          <div
                              className={`${styles.optionCard} ${
                                  selectedGender === "Male" ? styles.active : ""
                              }`}
                              onClick={() => handleGenderSelect("Male")} 
                          >
                              <User size={32} />
                              <p>Book with a Male Counselor</p>
                          </div>

                          <div
                              className={`${styles.optionCard} ${
                                  selectedGender === "Female" ? styles.active : ""
                              }`}
                              onClick={() => handleGenderSelect("Female")}
                          >
                              <User2 size={32} />
                              <p>Book with a Female Counselor</p>
                          </div>
                      </div>

                      {/* Date Selection - Integrated react-datepicker */}
                      {selectedGender && (
                          <div className={styles.dateTimeSection}>
                              <h3><CalendarDays size={20} style={{marginRight: '8px', verticalAlign: 'middle'}} /> Select Date</h3>

                              <div className={`${styles.calendar} mt_20`}>
                                  <div className={styles.datePickerContainer}>
                                      <DatePicker
                                          selected={selectedDate}
                                          onChange={handleDateSelect}
                                          inline // Renders the calendar directly
                                          filterDate={filterDate} // Only allows selection of available dates
                                          minDate={new Date()} // Prevents navigation to past months/days
                                          calendarClassName={styles.customCalendar} // Custom class for styling
                                          // NEW: Highlight dates with availability
                                          dayClassName={(date) => highlightAvailableDays(date) ? styles.available : undefined} 
                                      />
                                  </div>
                                  
                                  {availableDates.length === 0 && selectedGender && (
                                       <p style={{textAlign: 'center', opacity: 0.7, marginTop: '1rem'}}>
                                          No availability found for {selectedGender} counselors.
                                       </p>
                                  )}
                              </div>

                              {/* Time Slots */}
                              {selectedDate && availableTimeSlots.length > 0 && (
                                  <>
                                    <h3 className={`mt_50`}><CalendarDays size={20} style={{marginRight: '8px', verticalAlign: 'middle'}} /> Select Time Slot</h3>
                                    <div className={`${styles.timeSlots} mt_20 `}>
                                        {/* Use unique time/counselor ID for key */}
                                        {availableTimeSlots.map((slot, index) => {
                                            const displayTime = time24HourToDisplay(slot.startTime);
                                            // Check if this specific slot object is currently selected
                                            const isSelected = selectedSlot?.counselorId === slot.counselorId && selectedSlot?.startTime === slot.startTime;
                                            
                                            return (
                                                <button
                                                    key={`${slot.counselorId}-${slot.startTime}-${index}`}
                                                    className={`${styles.timeButton} ${isSelected ? styles.selectedTime : ''}`}
                                                    onClick={() => handleTimeSelect(slot)} 
                                                    disabled={isBooking}
                                                >
                                                    {displayTime}
                                                </button>
                                            )
                                        })}
                                    </div>
                                  </>
                              )}
                          </div>
                      )}

                      {/* NEW: Book Button - Visible only when a slot is selected */}
                      {selectedSlot && (
                           <button
                               className={`common_btn mt_30`}
                               onClick={handleBookSession} 
                               disabled={isBooking}
                           >
                               {isBooking ? `Booking ${time24HourToDisplay(selectedSlot.startTime)}...` : `Book Session at ${time24HourToDisplay(selectedSlot.startTime)}`}
                           </button>
                      )}
                  </>
                )}
            </div>
        </div>
    );
}
