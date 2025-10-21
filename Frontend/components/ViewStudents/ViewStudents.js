// components/ViewStudents/ViewStudents.js
"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from 'next/router';
import { Users, AlertCircle, Search, ArrowRight, UserCheck } from 'lucide-react';
import styles from "./ViewStudents.module.scss";
import Link from "next/link";

export default function ViewStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // --- New State for Dropdowns ---
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const btechBranches = ["Naval - NASB", "CS", "EEE", "MECH"]; 
  // --- End New State ---

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Student List (Logic remains the same) ---
  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
          router.replace('/login');
          return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URI}/counselor/students/list`, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setStudents(response.data.data);
        setFilteredStudents(response.data.data); 
      } catch (err) {
        console.error("View Students Fetch Error:", err);
        const errorMessage = err.response?.data?.message || "Failed to fetch student list.";
        setError(errorMessage);
        if (err.response?.status === 401 || err.response?.status === 403) {
            router.replace('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (Number(localStorage.getItem('userRole')) === 1) {
        fetchStudents();
    } else if (localStorage.getItem('authToken')) {
        router.replace('/dashboard');
    }
  }, [router]);


  // --- Filtering Logic (REVISED) ---
  useEffect(() => {
    let filterTerm = "";

    // 1. Determine the final classOrGroup string to filter by
    if (selectedCourse === "BTECH" && selectedBranch) {
        filterTerm = `BTECH - ${selectedBranch}`;
    } else if (selectedCourse && selectedCourse !== "BTECH") {
        filterTerm = selectedCourse;
    }
    
    if (filterTerm === "") {
        // If no course/branch is selected, show all students
        setFilteredStudents(students);
        return;
    }

    // 2. Filter students based on the constructed classOrGroup string
    const lowerCaseFilter = filterTerm.toLowerCase();
    const results = students.filter(student => 
        student.classOrGroup?.toLowerCase() === lowerCaseFilter
    );
    setFilteredStudents(results);
    
  }, [selectedCourse, selectedBranch, students]); // Dependencies are the selection states

  // --- Handlers for Dropdowns ---
  const handleCourseChange = (e) => {
      const course = e.target.value;
      setSelectedCourse(course);
      // Reset branch if BTECH is not selected
      if (course !== "BTECH") {
          setSelectedBranch("");
      }
  };
  
  const handleBranchChange = (e) => {
      setSelectedBranch(e.target.value);
  };
  // --- End Handlers ---


  if (isLoading) {
    return (
      <div className={`wrap pt_100 pb_100`} style={{ textAlign: 'center' }}>
        <p>Loading student roster...</p>
      </div>
    );
  }

  return (
    <div className={`wrap pt_50 pb_100`}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Registered Students</h1>
        <p className={styles.subtitle}>Showing: <strong>{filteredStudents.length} / {students.length}</strong> Students</p>
        
        {error && (
            <div className={styles.errorMessage}>
                <AlertCircle size={20} /> {error}
            </div>
        )}
      </div>

      {/* --- REPLACED Search Bar with Dropdowns --- */}
      <div className={styles.dropdownsContainer}>
          <select 
              value={selectedCourse} 
              onChange={handleCourseChange}
              className={styles.dropdownSelect}
          >
              <option value="">Filter by Course (All)</option>
              <option value="MCA">MCA</option>
              <option value="IMCA">IMCA</option>
              <option value="MBA">MBA</option>
              <option value="BTECH">BTECH</option>
          </select>
          
          {selectedCourse === "BTECH" && (
              <select 
                  value={selectedBranch} 
                  onChange={handleBranchChange}
                  className={styles.dropdownSelect}
              >
                  <option value="">Filter by BTECH Branch</option>
                  {btechBranches.map((branchName) => (
                      <option key={branchName} value={branchName}>
                          {branchName}
                      </option>
                  ))}
              </select>
          )}
      </div>
      {/* --- END REPLACEMENT --- */}

      <div className={styles.studentsGrid}>
        {filteredStudents.length === 0 ? (
          <p className={styles.empty}>
             {selectedCourse ? `No students found for the selected course/branch.` : "No students registered yet."}
          </p>
        ) : (
          filteredStudents.map((student) => (
            // Ensure student.loginId is available and used as key
            <div key={student.loginId} className={styles.studentCard}>
              <h3 className={styles.studentName}>
                  <UserCheck size={20} /> {student.name}
              </h3>
              <p className={styles.studentInfo}>Class/Group: <strong>{student.classOrGroup || 'N/A'}</strong></p>
              <p className={styles.studentInfo}>Phone: <span>{student.phone || '-'}</span></p>
              
              <Link 
                  href={`/counselor/student-profile/${student.loginId}`} 
                  className={styles.viewLink}
              >
                  View Profile & Mood <ArrowRight size={16} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}