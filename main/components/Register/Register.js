"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import Terms from "./Terms";
import style from "./Register.module.scss";

const Register = () => {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [checkmark, setCheckmark] = useState(false);
  const [termsandcondition, setTermsandcondition] = useState(false);

  const registerformDataHandler = (e) => {
    const { name, value } = e.target;
    setRegisterFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSubmitButton = () => {
    setCheckmark((prev) => !prev);
  };

  const registerFormSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, password } = registerFormData;
    if (!name || !email || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoader(true);

    try {
      await axios.post(`${BASE_URI}/api/register/`, registerFormData);
      router.push("/");
      setCheckmark(false);
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
      setCheckmark(false);
    } finally {
      setLoader(false);
    }
  };

  const registerAlert = (e) => {
    e.preventDefault();
    alert("Please accept our terms and conditions to continue.");
  };

  const TermsHandler = () => {
    setTermsandcondition(true);
  };

  return (
    <div>

      <>
        <div className={style.registerMainBody}>
          <form className={style.registerFormBody}>
            <img
              src="/images/register.png"
              alt="Register"
              className={style.registerFormTitle}
            />

            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={registerformDataHandler}
              className={style.registerFormInput}
            />
            <input
              type="text"
              name="email"
              placeholder="Email"
              onChange={registerformDataHandler}
              className={style.registerFormInput}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={registerformDataHandler}
              className={style.registerFormInput}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              onChange={registerformDataHandler}
              className={style.registerFormInput}
            />

            <div className={style.registerTerms}>
              <span style={{ color: "red" }}>*</span>{" "}
              <input
                type="checkbox"
                id="formcheck"
                onClick={toggleSubmitButton}
              />{" "}
              I agree to the{" "}
              <span
                className={style.termsLink}
                onClick={TermsHandler}
                role="button"
              >
                terms and conditions.
              </span>
            </div>

            <button
              onClick={(e) =>
                checkmark ? registerFormSubmit(e) : registerAlert(e)
              }
              className={
                checkmark
                  ? style.registerFormBtn
                  : style.registerFormBtnDisabled
              }
            >
              Submit
              <div className={style.registerFormBtnBack}></div>
            </button>

            <div className={style.registerFooter}>
              Already registered on Bloogie?{" "}
              <Link href="/" className={style.signInLink}>
                Sign in
              </Link>
            </div>
          </form>
        </div>

      </>

    </div>
  );
};

export default Register;
