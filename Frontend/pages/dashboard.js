'use client'

import MentalDashboard from '@/components/Dashboard/MentalDashboard'
import InnerBanner from '@/components/InnerBanner/InnerBanner'
import MentalHealthExtras from '@/components/QuoteSec/QuoteSec'
// Removed WeeklyReport import as it's not used directly here
import React, { useEffect, useState } from 'react' // Import useEffect, useState
import { useRouter } from 'next/router' // Import useRouter

const DashboardPage = () => { // Renamed component for clarity
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    // --- NEW: Authentication Check ---
    useEffect(() => {
        // Check only on the client side
        if (typeof window !== "undefined") {
            const token = localStorage.getItem('authToken');
            if (!token) {
                // If no token, redirect to login page immediately
                router.replace('/login'); // Use replace to prevent going back to dashboard
            } else {
                // If token exists, user is logged in, stop loading
                setIsLoading(false);
            }
        }
    }, [router]); // Re-run check if router changes
    // --- END Authentication Check ---

    // --- NEW: Conditional Rendering based on loading state ---
    if (isLoading) {
        // Optionally show a loading spinner or message while checking auth
        return <div>Loading...</div>; // Or return null;
    }
    // --- END Conditional Rendering ---

    // If not loading (meaning user is authenticated), render the dashboard
    return (
        <div>
            <InnerBanner title={'User Dashboard'} />
            <MentalDashboard />
            <MentalHealthExtras />
        </div>
    )
}

export default DashboardPage // Use the new component name