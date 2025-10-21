import React, { useEffect, useState } from "react";

import AOS from "aos";
import "aos/dist/aos.css";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";


const Layout = (props) => {

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
        });
    }, []);





    return (
        <React.Fragment>
            <main
                id="main-element"
                className={`main`}
            >
                <head>
                    <title>MindFlow | Your Intimate Companion for Women’s Health</title>
                    <meta name="description" content="MindFlow is a trusted companion for women, helping you track your period cycles and care for your mental health. Like an intimate friend, always here for your well-being." />

                    <link rel="icon" href="/favicon.svg" sizes="any" />

                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta charSet="UTF-8" />
                </head>

                < Header />
                {props.children}
                {/* <Footer /> */}
                <Footer />
            </main>
        </React.Fragment>
    );
};

export default Layout;