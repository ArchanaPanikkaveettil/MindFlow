// components/Header/Header.js
"use client";
import { useEffect, useRef, useState } from "react";
import style from "./Header.module.scss";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
// FIX 1: Change to 'next/router' if using Next.js Pages Router (which your other files suggest)
import { useRouter } from "next/router"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Header = () => {
  const inputRef = useRef(null);
  const [inputShow, setInputShow] = useState(false);
  const [pageScrolled, setPageScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Renamed to 'userRole' for clarity. Stored as a string from localStorage.
  const [userRole, setUserRole] = useState(null); 
  // FIX 2: Initialize useRouter from 'next/router'
  const router = useRouter(); 

  // Hide search input & Load Role
  useEffect(() => {
    // FIX 3: Use setUserRole
    setUserRole(localStorage.getItem("userRole")); 

    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setInputShow(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => setPageScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check login status (and role) on mount AND route change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole"); // Fetch role here as well
      
      setIsLoggedIn(!!token);
      setUserRole(role); // Update role state
    }
  }, [router.pathname]); // router.pathname dependency is important

  // Logout with SweetAlert2 confirmation
  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out from MindFlow.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userRole");
      
      setIsLoggedIn(false); // FIX: Set logged-out state immediately

      await MySwal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // Use router.replace to handle client-side navigation after logout
      router.replace("/");
    }
  };

  // Determine the correct dashboard path based on role number (0=Admin, 1=Counselor, 2=User)
  const getDashboardPath = () => {
      // Use Number() to compare against stored role string
      const roleNum = Number(userRole);
      
      if (roleNum === 0) { // Admin role is 0
          return "/admin-dashboard";
      } else if (roleNum === 1) { // Counselor role is 1
          // Use the new path I suggested earlier
          return "/counselor-dashboard"; 
      }
      return "/dashboard"; // Default to student/user dashboard (role 2 or null)
  };


  return (
    <header className={`${style.MainHeader} ${pageScrolled ? style.scrolled : ""}`}>
      <div className="wrap">
        <div className={style.headerInner}>
          {/* Logo */}
          <div
            className={`${style.logo} ${style.header_logo} ${pageScrolled ? style.header_sticky_logo : ""}`}
          >
            <Link href="/">
              <Image src="/images/logo.svg" width={326} height={53} alt="logo" />
            </Link>
          </div>

          {/* Navigation */}
          <ul className={`${style.navLinks} navLinks`}>
            {/* Login/Logout Link */}
            {isLoggedIn ? (
              <li>
                <button 
                    onClick={handleLogout} 
                    className={style.logoutButton} // Use button for better semantics
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link href="/login">Login</Link>
              </li>
            )}
            
            {/* Conditional Dashboard Link */}
            {isLoggedIn && ( // Only show Dashboard link if logged in
              <li>
                {/* Use the helper function to determine the destination */}
                <Link href={getDashboardPath()}>Dashboard</Link>
              </li>
            )}

            {/* Profile Link (Always shown if logged in) */}
            {isLoggedIn && (
              <li>
                <Link href="/profile" className={style.profileLink}>
                  <User size={22} strokeWidth={1.75} />
                </Link>
              </li>
            )}
            {/* --- END MODIFICATION --- */}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;