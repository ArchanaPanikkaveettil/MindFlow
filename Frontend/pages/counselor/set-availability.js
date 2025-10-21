// pages/counselor/set-availability.js
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import SetAvailability from '@/components/SetAvailability/SetAvailability';
import React from 'react';

const SetAvailabilityPage = () => {
    // Role protection is handled inside the SetAvailability component's useEffect
    return (
        <div>
            <InnerBanner title={'Manage Schedule'} />
            <SetAvailability />
        </div>
    );
};

export default SetAvailabilityPage;