"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import style from "./Banner.module.scss";
import Link from "next/link";

const Banner = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("authToken"));
    }, []);

    return (
        <div
            className={`${style.banner_main}  `}

        >
            <div className={`${style.banner_container} wrap `}>
                <div className={`${style.left_sec} `}>
                    <h2>
                        MindFlow – Your Companion in Every Cycle of Life
                    </h2>
                    <p className={style.subtitle}>
                        A secure, personalized space for student mental health tracking, professional counseling bookings, and visual progress insights.
                    </p>
                    <div className={style.btn_wrapper}>
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className={style.cta_primary}>
                                    Go to Dashboard
                                </Link>
                                <Link href="/book-counselor" className={style.cta_secondary}>
                                    Book a Counselor
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/register" className={style.cta_primary}>
                                    Get Started (Free)
                                </Link>
                                <Link href="/login" className={style.cta_secondary}>
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div
                    className={`${style.image_sec}  `}
                >
                    <Image src={'/images/img6.png'} height={600} width={1000} alt="" quality={100} />
                </div>
            </div>
            <div
                className={` lines  `}
            >
                <Image src={'/images/lines.svg'} height={600} width={1000} alt="" quality={100} />
            </div>
        </div>
    );
};

export default Banner;
