'use client'

import MentalDashboard from '@/components/Dashboard/MentalDashboard'
import InnerBanner from '@/components/InnerBanner/InnerBanner'
import MentalHealthExtras from '@/components/QuoteSec/QuoteSec'
import WeeklyReport from '@/components/WeekChart/WeekChart'
import Link from 'next/link'
import React from 'react'

const dashboard = () => {
    return (
        <div>
            <InnerBanner title={'Sitemap'} />
            <div className='wrap'>

                <ul className='pt_100 pb_100 common-list'>
                    <li>
                        <Link href='/'>Home Page</Link>
                    </li>
                    <li>
                        <Link href='/admin-dashboard'>Admin Dashboard</Link>
                    </li>
                    <li>
                        <Link href='/book-counselor'>Book Counselor</Link>
                    </li>
                    <li>
                        <Link href='/booking'>Booking</Link>
                    </li>
                    <li>
                        <Link href='/dashboard'>Dashboard</Link>
                    </li>
                    <li>
                        <Link href='/log-mood'>Log-Mood</Link>
                    </li>
                    <li>
                        <Link href='/login'>login</Link>
                    </li>
                    <li>
                        <Link href='/profile'>Profile</Link>
                    </li>
                    <li>
                        <Link href='/register'>Register</Link>
                    </li>
                    <li>
                        <Link href='/weekly-report'>Weekly Report</Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default dashboard