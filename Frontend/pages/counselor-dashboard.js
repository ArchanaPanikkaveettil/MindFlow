// pages/counselor-dashboard.js
import CounselorDashboard from '@/components/CounselorDashboard/CounselorDashboard';
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import React, { useEffect, useState } from 'react'; // <-- Import useState
import { useRouter } from 'next/router';

const CounselorDashboardPage = () => {
    const router = useRouter();
    // State to track if the user is authenticated and authorized (defaults to null)
    const [isAuthorized, setIsAuthorized] = useState(null); 

    // This useEffect runs ONLY after the component mounts on the client-side
    useEffect(() => {
        // Now it's safe to access localStorage
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        // 1. Check for valid token AND correct role (1)
        if (token && Number(userRole) === 1) {
            setIsAuthorized(true);
        } else {
            // 2. If unauthorized, set false and redirect
            setIsAuthorized(false);
            
            // Redirect to login if token is missing, or student dashboard if token exists but role is wrong
            const redirectPath = token ? '/dashboard' : '/login';
            router.replace(redirectPath);
        }
    }, [router]);

    // Render logic based on the authorization state:

    if (isAuthorized === null) {
        // Still checking auth status (happens during the very first render)
        return (
            <div className="wrap pt_100 pb_100" style={{textAlign: 'center'}}>
                Loading and verifying access...
            </div>
        );
    }
    
    if (isAuthorized === false) {
        // Unauthorized, but waiting for router.replace to finish
        return (
            <div className="wrap pt_100 pb_100" style={{textAlign: 'center'}}>
                Access Denied. Redirecting...
            </div>
        );
    }

    // If isAuthorized is true, render the full component
    return (
        <div>
            <InnerBanner title={'Counselor Dashboard'} />
            <CounselorDashboard />
        </div>
    );
};

export default CounselorDashboardPage;
