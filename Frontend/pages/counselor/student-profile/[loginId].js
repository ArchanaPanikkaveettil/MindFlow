// pages/counselor/student-profile/[loginId].js
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import StudentProfile from '@/components/StudentProfile/StudentProfile';
import React from 'react';

const StudentProfilePage = () => {
    // Role protection is handled inside the StudentProfile component's useEffect
    return (
        <div>
            <InnerBanner title={'Student Profile'} />
            <StudentProfile />
        </div>
    );
};

export default StudentProfilePage;