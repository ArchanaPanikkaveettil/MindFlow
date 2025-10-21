"use client";
import React from "react";
import { Droplets, Brain, Apple, BedDouble, Sun } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./QuoteSec.module.scss";

export default function MotivationalSection() {
  const wellnessTips = [
    {
      icon: <Droplets size={40} />,
      title: "Stay Hydrated",
      description:
        "Drink at least 8 glasses of water daily. Hydration supports brain function, focus, and overall emotional balance.",
      colorClass: styles.iconBlue,
    },
    {
      icon: <Apple size={40} />,
      title: "Eat Mindfully",
      description:
        "Include omega-rich foods, fruits, and green veggies. A healthy diet helps reduce anxiety and boosts mood stability.",
      colorClass: styles.iconGreen,
    },
    {
      icon: <Brain size={40} />,
      title: "Practice Mindfulness",
      description:
        "Spend a few minutes meditating or journaling. It helps you understand your thoughts and manage emotional swings better.",
      colorClass: styles.iconPurple,
    },
    {
      icon: <BedDouble size={40} />,
      title: "Get Quality Sleep",
      description:
        "A full night’s rest allows your brain to reset, improving mental clarity, energy, and emotional regulation.",
      colorClass: styles.iconPink,
    },
    {
      icon: <Sun size={40} />,
      title: "Morning Sunshine",
      description:
        "Spend a few minutes in sunlight every morning — it enhances serotonin levels and helps fight stress.",
      colorClass: styles.iconYellow,
    },
  ];

  return (
    <div className={`wrap pt_50 pb_100 ${styles.motivationSection}`}>
      {/* Quote of the Day */}
      <div className={styles.quoteCard}>
        <h2 className={styles.quoteHeading}>✨ Quote of the Day</h2>
        <p className={styles.quoteText}>
          “You don’t have to control your thoughts. You just have to stop letting them control you.”
        </p>
        <p className={styles.quoteAuthor}>— Dan Millman</p>
      </div>

      {/* Swiper for Wellness Tips */}
      <div className={`${styles.tipsSection} mt_50`}>
        <h2 className={styles.sectionTitle}>Daily Mental Wellness Tips</h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={4}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className={styles.mySwiper}
        >
          {wellnessTips.map((tip, index) => (
            <SwiperSlide key={index}>
              <div className={styles.tipCard}>
                <div className={`${styles.iconWrapper} ${tip.colorClass}`}>
                  {tip.icon}
                </div>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipDesc}>{tip.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
