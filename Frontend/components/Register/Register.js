// components/Register/Register.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // use App Router
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import style from "./Register.module.scss";

// Wrap SweetAlert2 for React
const MySwal = withReactContent(Swal);

const Register = () => {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const checkboxRef = useRef(null);

  const btechBranches = ["Naval - NASB", "CS", "EEE", "MECH"];

  const [registerFormData, setRegisterFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    classOrGroup: "",
  });

  // Update classOrGroup based on course and branch
  useEffect(() => {
    if (course === "BTECH" && branch) {
      setRegisterFormData((prev) => ({
        ...prev,
        classOrGroup: `BTECH - ${branch}`,
      }));
    } else if (course && course !== "BTECH") {
      setRegisterFormData((prev) => ({ ...prev, classOrGroup: course }));
      setBranch("");
    } else {
      setRegisterFormData((prev) => ({ ...prev, classOrGroup: "" }));
    }
  }, [course, branch]);

  const registerformDataHandler = (e) => {
    const { name, value } = e.target;
    // FIX: Convert email to lowercase when updating state
    const processedValue = name === 'email' ? value.toLowerCase() : value; 
    setRegisterFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const toggleSubmitButton = () => {};

  const registerFormSubmit = async (e) => {
    e.preventDefault();

    if (!checkboxRef.current?.checked) {
      return MySwal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please accept our terms and conditions to continue.",
      });
    }

    const { name, email, phone, password, gender, classOrGroup } =
      registerFormData;

    if (!name || !email || !phone || !password || !gender || !classOrGroup) {
      return MySwal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in all fields.",
      });
    }

    setLoader(true);
    
    // The email is already lowercased in registerformDataHandler, but we pass the full state
    // The backend in userRouter.js also handles lowercasing, ensuring redundancy.

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URI}/register`,
        registerFormData
      );

      console.log("Registration Success Response:", res.data);

      await MySwal.fire({
        icon: "success",
        title: "Registered Successfully",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/login");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";

      console.error(
        "Registration Error Response:",
        err.response ? err.response.data : err.message
      );

      MySwal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
      });
    } finally {
      setLoader(false);
    }
  };

  const TermsHandler = () => {};

  return (
    <div>
      <div className={style.registerMainBody}>
        <form className={style.registerFormBody} onSubmit={registerFormSubmit}>
          <div className={style.content}>
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

            <div className={style.dropdown_sec}>
              <select
                name="gender"
                onChange={registerformDataHandler}
                className={`${style.registerFormInput} ${style.select_dropdown}`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className={`${style.registerFormInput} ${style.select_dropdown}`}
              >
                <option value="" disabled>
                  Select Course
                </option>
                <option value="MCA">MCA</option>
                <option value="IMCA">IMCA</option>
                <option value="MBA">MBA</option>
                <option value="BTECH">BTECH</option>
              </select>
            </div>

            {course === "BTECH" && (
              <div className={style.dropdown_sec} style={{ marginTop: "20px" }}>
                <select
                  name="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`${style.registerFormInput} ${style.select_dropdown}`}
                  style={{ width: "100%" }}
                >
                  <option value="" disabled>
                    Select BTECH Branch
                  </option>
                  {btechBranches.map((branchName) => (
                    <option key={branchName} value={branchName}>
                      {branchName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={style.registerTerms}>
              <span style={{ color: "red" }}>*</span>{" "}
              <input ref={checkboxRef} type="checkbox" id="formcheck" /> I agree to
              the{" "}
              <span className={style.termsLink} onClick={TermsHandler} role="button">
                terms and conditions.
              </span>
            </div>

            <button type="submit" className={style.registerFormBtn}>
              {loader ? "Registering..." : "Register"}
            </button>

            <div className={style.registerFooter}>
              Already registered on MindFlow? <br />
              <Link href="/login" className={style.signInLink}>
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;