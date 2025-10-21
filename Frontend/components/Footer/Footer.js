import React from "react";
import Image from "next/image";
import styles from "./Footer.module.scss";

export default function Footer() {
    return (
        <footer className={`${styles.footer} pt_50 pb_50`}>
            <div className={styles.footerContent}>
                <div className={styles.logoSection}>
                    <Image
                        src="/images/logo.svg"
                        alt="Mindflow Logo"
                        width={40}
                        height={40}
                        className={styles.logo}
                    />
                </div>
                <p className={styles.copyText}>
                    © {new Date().getFullYear()} Mindflow. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
