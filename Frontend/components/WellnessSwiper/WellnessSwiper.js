import React from 'react';
import { Heart, Handshake, TrendingUp } from 'lucide-react';
// REMOVED: import { Swiper, SwiperSlide } from 'swiper/react';
// REMOVED: import 'swiper/css';
import styles from './WellnessSwiper.module.scss';
// Keep Link import if other parts might use it, but not needed for the card
// import Link from 'next/link'; 

export default function WellnessSwiper() {
    const cards = [
        {
            icon: Heart,
            title: "Track Your Mood",
            description: "Understand your emotional patterns. Quickly log how you're feeling each day and gain insights into your well-being journey.",
            // buttonText: "Log My Mood", // Button text no longer needed
            // Link:'log-mood', // Link no longer needed
        },

        {
            icon: Handshake,
            title: "Professional Support",
            description: "Find the right help you need. Browse our network of certified counselors and book sessions directly through Mindflow.",
            // buttonText: "Find a Counselor",
            // Link:'#',
        },
        {
            icon: TrendingUp,
            title: "Your Weekly Insights",
            description: "Visualize your progress. Get personalized reports on mood trends and activities' wellness journey.",
        },
    ];

    return (
        <div className={styles.container}>
            <div className={`${styles.wrapper} wrap pt_100 pb_100`}>
                <div className={styles.header}>
                    <h1 className={styles.mainTitle}>Insights and professional guidance.</h1>
                    <p className={styles.mainDescription}>
                        {/* Revised description to match the image */}
                        Discover tools and resources designed to support your emotional well-being.
                        Take control of your mental health with personalized insights and professional guidance.
                    </p>
                </div>

                {/* ✅ REPLACED: Swiper Slider with a plain div for the static 3-column layout */}
                <div className={styles.cardsGrid}>
                    {cards.map((card, index) => (
                        <Card key={index} card={card} />
                    ))}
                </div>
                {/* // Swiper Code Removed:
                // <Swiper ... >
                //     {cards.map((card, index) => (
                //         <SwiperSlide key={index}>
                //             <Card card={card} />
                //         </SwiperSlide>
                //     ))}
                // </Swiper> 
                */}
            </div>
        </div>
    );
}

// Card component (unchanged)
function Card({ card }) {
    const IconComponent = card.icon;

    return (
        <div className={styles.card}>
            <div className={styles.cardIcon}>
                <IconComponent />
            </div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
        </div>
    );
}