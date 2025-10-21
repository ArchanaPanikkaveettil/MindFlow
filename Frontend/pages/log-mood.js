import InnerBanner from '@/components/InnerBanner/InnerBanner'
import LogMood from '@/components/LogMood/LogMood'
import React from 'react'

const LogingMood = () => {
    return (
        <div>
            <InnerBanner title={'Track My Mood'} />
            <LogMood />
        </div>
    )
}

export default LogingMood