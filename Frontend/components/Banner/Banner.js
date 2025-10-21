"use client";
import React from "react";
import Image from "next/image";
import style from "./Banner.module.scss";
import Link from "next/link";

const Banner = () => {
    return (
        <div
            className={`${style.banner_main}  `}

        >
            <div className={`${style.banner_container} wrap `}>
                <div className={`${style.left_sec} `}>
                    <h2>
                        MindFlow – Your Companion in Every Cycle of Life
                    </h2>
                    {/* <Link href={'/'} className="common_btn">Found a Councelor</Link> */}
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
