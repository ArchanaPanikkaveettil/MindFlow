"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Login.module.scss";

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
      alert("Please fill out Email and Password");
      return;
    }

    setLoader(true);

    try {
      // Example request (adjust API endpoint as needed)
      const res = await axios.post("/api/login", formData);

      if (res.status === 200) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={style.loginMainBody}>
      <form className={style.loginFormBody} onSubmit={formSubmit}>
        <img src="/images/login.png" alt="Login" className={style.loginFormTitle} />

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
          {loader ? "Loading..." : "Submit"}
          <div className={style.loginFormBtnBack}></div>
        </button>

        <div className={style.loginFooter}>
          New to Bloogie?{" "}
          <Link href="/register" className={style.registerLink}>
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
