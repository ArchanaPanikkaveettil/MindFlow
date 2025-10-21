import BookCounselor from '@/components/BookCounselor/BookCounselor'
import InnerBanner from '@/components/InnerBanner/InnerBanner'
import React from 'react'

const bookCounselor = () => {
    return (
        <div>
            <InnerBanner title={'User Dashboard'} />
            <BookCounselor />
        </div>
    )
}

export default bookCounselor