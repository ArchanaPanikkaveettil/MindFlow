
import AdminDashboard from '@/components/AdminDashboard/AdminDashboard'
import InnerBanner from '@/components/InnerBanner/InnerBanner'
import React from 'react'

const adminDashboard = () => {
    return (
        <div>
            <InnerBanner title={'Admin Dashboard'} />
            <AdminDashboard />
        </div>
    )
}

export default adminDashboard