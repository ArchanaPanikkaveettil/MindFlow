// MyBookings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './MyBookings.module.scss';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';

// Helper function to format date/time
const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// CRITICAL TEMPORARY DISPLAY FIX: Compensate for local timezone daylight savings/shifts 
// by checking the time and adjusting the day for display only.
const formatDate = (isoString) => {
    const date = new Date(isoString);
    
    // Check if the booking time is early in the local morning (e.g., before 5 AM local time). 
    // This typically indicates the browser has flipped the date backward when converting UTC.
    // If you are in IST (UTC+5:30), 12:00 AM UTC lands at 5:30 AM IST. 
    // If the time is 00:00 (local), the display needs to be fixed.
    if (date.getHours() < 5) {
        // Apply the +1 day correction for display purposes only
        date.setDate(date.getDate() + 1); 
    }
    
    // Use the default behavior to display the date based on the adjusted date object.
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};


export default function MyBookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showPopup, setShowPopup] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null); // State to hold the booking being cancelled
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancelStatus] = useState(null); // For immediate cancellation feedback
  const [isCancelling, setIsCancelling] = useState(false);


  // Effect to manage scroll bar on popup (Keep original logic)
  useEffect(() => {
    document.documentElement.style.overflow = showPopup ? "hidden" : "auto";
    // Cleanup function
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [showPopup]);

  // Function to fetch bookings (reusable)
  const fetchBookings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    setCancelStatus(null); // Clear status messages on new fetch

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URI}/bookings/my-sessions`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Filter out only relevant statuses (booked, completed, cancelled)
      setBookings(response.data.data.filter(b => b.status === 'booked' || b.status === 'completed' || b.status === 'cancelled'));
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to fetch bookings.");
      setIsLoading(false);
    }
  };

  
  // Effect to fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      setCancelStatus(null);
      setIsLoading(true); // Ensure loading state is set

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URI}/bookings/my-sessions`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setBookings(response.data.data.filter(b => b.status === 'booked' || b.status === 'completed' || b.status === 'cancelled'));
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        const errorMessage = err.response?.data?.message || "Failed to fetch bookings.";
        setError(errorMessage);

        // 🚨 CRITICAL FIX: Handle 401/403 errors by logging out and redirecting
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userRole');
          router.replace('/login');
        }

        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [router]);

  // --- Handle Cancellation Confirmation ---
  const handleCancelConfirm = async () => {
    if (!bookingToCancel || isCancelling) return;

    setIsCancelling(true);
    setCancelStatus(null);
    const token = localStorage.getItem('authToken');

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URI}/bookings/cancel/${bookingToCancel._id}`,
        {}, // Empty body for PUT request
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setCancelStatus({ success: true, message: response.data.message });
      // Re-fetch data to update the list immediately after successful cancellation
      await fetchBookings();

    } catch (err) {
      console.error("Cancellation API Error:", err);
      setCancelStatus({ success: false, message: err.response?.data?.message || "Failed to cancel session." });
    } finally {
      setIsCancelling(false);
      setShowPopup(false);
      setBookingToCancel(null);
    }
  };


  if (isLoading) {
    return (
      <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center' }}>
        <p>Loading your session history...</p>
      </div>
    );
  }

  // Filter and process data
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const isUpcoming = new Date(b.startTime) > now;
    const isActiveBooking = b.status === 'booked';
    const isPastBooking = b.status === 'completed' || b.status === 'cancelled';

    if (activeTab === 'upcoming') {
      return isUpcoming && isActiveBooking; // Only upcoming sessions that haven't been cancelled
    } else { // 'past' tab shows all non-upcoming bookings, including cancelled ones
      return !isUpcoming || isPastBooking;
    }
  });


  return (
    <div className={`wrap pt_100 pb_100`}>
      {/* Header */}
      <div className={styles.header}>
        <h2>My Bookings</h2>
        <div className={styles.tabs}>
          <button
            className={activeTab === 'upcoming' ? styles.active : ''}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={activeTab === 'past' ? styles.active : ''}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
      </div>

      {/* Cancellation Status Message (appears after attempting cancellation) */}
      {cancelStatus && (
        <div className={`mt_20 mb_20`} style={{
          textAlign: 'center',
          color: cancelStatus.success ? 'green' : 'red',
          padding: '10px',
          border: `1px solid ${cancelStatus.success ? 'green' : 'red'}`,
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          <strong>{cancelStatus.message}</strong>
        </div>
      )}

      {/* Error Message from Fetch */}
      {error && (
        <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center', color: 'red' }}>
          <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          <p>{error}</p>
        </div>
      )}


      {/* Bookings List */}
      <div className={styles.list}>
        {filteredBookings.length === 0 ? (
          <p className="mt_30" style={{ opacity: 0.7 }}>No {activeTab} sessions found.</p>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className={styles.bookingCard}>
              <div className={styles.info}>
                <div className={styles.icon}><User size={20} /></div>
                {/* Counselor Name populated from UserReg model */}
                <p>Counselor: <strong>{booking.counselorId?.name || 'Unknown Counselor'}</strong></p>
              </div>
              <div className={styles.info}>
                <div className={styles.icon}><Calendar size={20} /></div>
                <p>{formatDate(booking.startTime)}</p>
              </div>
              <div className={styles.info}>
                <div className={styles.icon}><Clock size={20} /></div>
                <p>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
              </div>

              {/* Status badge for Past tab */}
              {activeTab === 'past' && (
                <div className={styles.info} style={{ marginTop: '0.5rem', color: booking.status === 'cancelled' ? 'red' : 'green' }}>
                  Status: <strong>{booking.status.toUpperCase()}</strong>
                </div>
              )}

              {activeTab === 'upcoming' && booking.status === 'booked' && (
                <div className={styles.actions} style={{ justifyContent: 'flex-end'}}> {/* Adjust layout for single button */}
                  {/* REMOVED: Reschedule button as per request */}
                  {/* <button
                    className={styles.reschedule}
                    onClick={() => alert('Reschedule feature pending.')}
                  >
                    Reschedule
                  </button> */}
                  <button
                    className={styles.cancel}
                    onClick={() => {
                      setBookingToCancel(booking); // Set the booking data to the state
                      setShowPopup(true); // Open the popup
                    }}
                  >
                    Cancel Session
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Popup for Cancellation Confirmation */}
      {showPopup && bookingToCancel && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h3>Confirm Cancellation</h3>
            <p>You are cancelling your session with:</p>
            <p><strong>{bookingToCancel.counselorId?.name || 'Unknown Counselor'}</strong></p>
            <p>{formatDate(bookingToCancel.startTime)} at {formatTime(bookingToCancel.startTime)}</p>


            <div className={styles.popupButtons}>
              <button
                className={styles.confirm}
                onClick={handleCancelConfirm}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
              <button
                className={styles.cancel}
                onClick={() => {
                  setShowPopup(false);
                  setBookingToCancel(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}