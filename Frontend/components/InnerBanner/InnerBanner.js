"use client";
import React from "react";
import Image from "next/image";
import style from "./InnerBanner.module.scss";
import Link from "next/link";

const InnerBanner = ({ title }) => {
    return (
        <div
            className={`${style.inner_banner_main}  `}

        >
            <div className={`${style.inner_banner_container} wrap `}>
                <div className={`${style.left_sec} mb_40`}>
                    <h2>
                        {title ? title : 'Title'}
                    </h2>
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

export default InnerBanner;
