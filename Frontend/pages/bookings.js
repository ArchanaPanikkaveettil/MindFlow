'use client';
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import MyBookings from '@/components/MyBookings/MyBookings';
import React from 'react'

const BookingsPage = () => {
  return (
    <div>


      <InnerBanner title={'Bookings'} />
      <MyBookings />

    </div>
  )
}

export default BookingsPage