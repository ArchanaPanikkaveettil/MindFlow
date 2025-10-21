// components/Login/Login.js
"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
// Assuming you have installed sweetalert2 and @sweetalert2/react-content
import Swal from "sweetalert2"; 
import withReactContent from "sweetalert2-react-content";
import style from "./Login.module.scss";

const MySwal = withReactContent(Swal);

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loader, setLoader] = useState(false);

  const loginFormDataHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      // Using MySwal instead of alert()
      MySwal.fire({
          icon: 'warning',
          title: 'Missing Details',
          text: 'Please fill out both email and password.',
      });
      return;
    }

    setLoader(true);
    
    // FIX: Convert email to lowercase here before sending to backend
    const submissionData = {
        email: formData.email.toLowerCase(), 
        password: formData.password
    };

    try {
      // 1. Send Login Request
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URI}/login`,
        submissionData // Use the lowercase-ensured data
      );

      // --- 2. Store Token and Role ---
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('userProfile', JSON.stringify(res.data.profile));
        // Ensure role is stored
        localStorage.setItem('userRole', res.data.role); 
      }

      // --- 3. Determine Role-Based Redirection Path ---
      const roleNum = Number(res.data.role);
      let redirectPath = "/dashboard"; // Default to Role 2 (User/Student)

      if (roleNum === 0) { // Role 0: Admin
        redirectPath = "/admin-dashboard"; 
      } else if (roleNum === 1) { // Role 1: Counselor
        redirectPath = "/counselor-dashboard"; 
      }

      // Show success message before redirecting
      await MySwal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: res.data.message || 'Welcome back to MindFlow!',
          timer: 1000,
          showConfirmButton: false,
      });

      // 4. Navigate to the specific dashboard
      router.push(redirectPath);

    } catch (error) {
      // --- Error Handling ---
      const errorMessage = error.response
        ? error.response.data.message
        : "Login failed. Please check your network or try again.";

      console.error('Login Error Response:', error.response ? error.response.data : error.message);

      MySwal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={`${style.loginMainBody}`}>
      <form className={`${style.loginFormBody}`} onSubmit={formSubmit}>
        <div className={style.content}>
          <img
            src="/images/login.png"
            alt="Login"
            className={style.loginFormTitle}
          />

          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={loginFormDataHandler}
            className={style.loginFormInput}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={loginFormDataHandler}
            className={style.loginFormInput}
          />

          <button type="submit" className={style.loginFormBtn} disabled={loader}>
            {loader ? "Loading..." : "Login"}
          </button>

          <div className={style.loginFooter}>
            New to MindFlow?{" "}
            <Link href="/register" className={style.registerLink}>
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;