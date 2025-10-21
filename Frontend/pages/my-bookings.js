import Layout from '@/components/Layout'; // Assuming your Layout component is in @/components/Layout
import InnerBanner from '@/components/InnerBanner/InnerBanner';
import MyBookings from '@/components/MyBookings/MyBookings';

export default function MyBookingsPage() {
  return (
    <Layout>
        {/* You can reuse the InnerBanner component for a consistent header */}
        <InnerBanner title="My Counseling Sessions" /> 
        <MyBookings />
    </Layout>
  );
}