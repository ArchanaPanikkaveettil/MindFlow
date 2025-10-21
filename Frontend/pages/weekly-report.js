import InnerBanner from '@/components/InnerBanner/InnerBanner'
import WeeklyChart from '@/components/WeekChart/WeekChart'
import React from 'react'

const WeeklyReport = () => {
    return (
        <div>
            <InnerBanner title={'Weekly Report'} />
            <WeeklyChart />
        </div>
    )
}

export default WeeklyReport