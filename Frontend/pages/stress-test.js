import React from 'react'
import InnerBanner from '@/components/InnerBanner/InnerBanner'
import StressTest from '@/components/StressTest/StressTest'

const StressTestPage = () => {
    return (
        <div>
            <InnerBanner title={'Stress Assessment'} />
            <StressTest />
        </div>
    )
}

export default StressTestPage
