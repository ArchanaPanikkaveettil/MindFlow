// pages/counselor/students-list.js
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import ViewStudents from '@/components/ViewStudents/ViewStudents';
import React from 'react';

const ViewStudentsPage = () => {
    // Role protection is handled inside the ViewStudents component's useEffect
    return (
        <div>
            <InnerBanner title={'Student Management'} />
            <ViewStudents />
        </div>
    );
};

export default ViewStudentsPage;
