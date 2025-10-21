// components/Profile/Profile.js
"use client"; 
import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import { Camera, Edit2, Save, User, AlertCircle } from 'lucide-react'; 
import styles from './Profile.module.scss';
import { useRouter } from 'next/router'; 

export default function Profile() {
  const router = useRouter(); 
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [profileData, setProfileData] = useState({
    name: '',
    email: '', 
    phone: '',
    gender: '',
    classOrGroup: '', 
    image: '/images/default-avatar.png', 
  });
  
  // --- NEW STATE: User Role ---
  const [userRole, setUserRole] = useState(null); 
  // --- END NEW STATE ---

  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true); 

  const btechBranches = ["Naval - NASB", "CS", "EEE", "MECH"]; 

  // --- Fetch profile data on component mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true); 
      setError(null); 
      const token = localStorage.getItem('authToken');
      // Fetch role from local storage
      const role = localStorage.getItem('userRole'); 
      setUserRole(role);

      if (!token) {
        setError("Not authenticated. Redirecting to login...");
        router.replace('/login'); 
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URI}/profile`, 
          {
            headers: {
              'Authorization': `Bearer ${token}` 
            }
          }
        );

        const userData = response.data.data;
        setProfileData({
          name: userData.name || '',
          email: userData.loginId?.username || 'Email not found',
          phone: userData.phone || '',
          gender: userData.gender || '',
          classOrGroup: userData.classOrGroup || '',
          image: profileData.image,
        });

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to fetch profile data. Please try logging in again.");
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userProfile');
          localStorage.removeItem('userRole');
          router.replace('/login');
        }
      } finally {
        setIsLoading(false); 
      }
    };

    fetchProfile();
  }, [router]); 

  // --- useEffect to populate course/branch from fetched data ---
  useEffect(() => {
    if (profileData.classOrGroup) {
      setIsInitialLoad(true); 
      const parts = profileData.classOrGroup.split(" - ");
      if (parts.length === 2 && parts[0] === "BTECH" && btechBranches.includes(parts[1])) {
        setCourse("BTECH");
        setBranch(parts[1]);
      } else if (["MCA", "IMCA", "MBA", "BTECH"].includes(profileData.classOrGroup)) { 
        setCourse(profileData.classOrGroup);
        setBranch("");
      } else {
          setCourse("");
          setBranch("");
      }
    } else {
      setCourse("");
      setBranch("");
    }
    const timer = setTimeout(() => setIsInitialLoad(false), 10);
    return () => clearTimeout(timer); 
  }, [profileData.classOrGroup]); 


  // --- useEffect to update main profileData when course/branch changes DURING EDITING ---
  useEffect(() => {
    if (!isInitialLoad && isEditing) {
      if (course === "BTECH" && branch) {
        setProfileData(prev => ({ ...prev, classOrGroup: `BTECH - ${branch}` }));
      } else if (course && course !== "BTECH") {
        setProfileData(prev => ({ ...prev, classOrGroup: course }));
      } else {
         setProfileData(prev => ({ ...prev, classOrGroup: course })); 
      }
    }
  }, [course, branch, isEditing, isInitialLoad]);


  // --- HandleSave function to send data to backend ---
  const handleSave = async () => {
    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Authentication error. Please log in again.");
        router.replace('/login');
        return;
    }

    // Only set finalClassOrGroup if the user is a Student (Role 2)
    let finalClassOrGroup = profileData.classOrGroup; // Default to existing value
    if (Number(userRole) === 2) { 
        if (course === "BTECH" && branch) {
             finalClassOrGroup = `BTECH - ${branch}`;
        } else if (course) {
             finalClassOrGroup = course;
        } else {
             finalClassOrGroup = "";
        }
    }

    const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        // Only send classOrGroup if the user is a student (Role 2)
        ...(Number(userRole) === 2 && { classOrGroup: finalClassOrGroup }) 
    };

    // Simple validation before sending
    if (!updateData.name || !updateData.phone || !updateData.gender) {
        setError("Please fill in all mandatory fields (Name, Phone, Gender).");
        return;
    }
    // Student specific validation
    if (Number(userRole) === 2 && !finalClassOrGroup) {
         setError("Please select a valid Class/Group.");
         return;
    }


    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URI}/profile`,
            updateData,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

         setProfileData(prev => ({ ...prev, classOrGroup: finalClassOrGroup }));
        alert(response.data.message || '✅ Profile updated successfully!');
        setIsEditing(false); 

    } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    }
  };
   // --- END HandleSave ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name !== 'course' && name !== 'branch'){
         setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  if (isLoading) {
    return <div className="wrap pt_100 pb_100" style={{ textAlign: 'center' }}>Loading profile...</div>;
  }
  
  // Flag to check if the user is a Student (Role 2)
  const isStudent = Number(userRole) === 2;


  return (
    <div className={`wrap pt_100 pb_100`}>
      <div className={styles.profileCard}>
        {/* Profile Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img src={profileData.image} alt="Profile" className={styles.avatar} />
            {isEditing && (
              <label className={styles.cameraIcon}>
                <Camera size={20} />
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <h2 className={styles.name}>{profileData.name}</h2>
          <p className={styles.email}>{profileData.email}</p>
        </div>

        {/* Display Error Message */}
        {error && (
            <div style={{ color: 'red', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
               <AlertCircle size={18} /> {error}
            </div>
        )}

        {/* Edit / Save Button */}
        <div className={styles.actionBar}>
          {isEditing ? (
            <button className="common_btn" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          ) : (
            <button className="common_btn" onClick={() => { setIsEditing(true); setError(null); }}> 
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.field}>
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{profileData.name || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Email</label>
             {/* Email Read-only */}
             <p>{profileData.email || '-'}</p>
          </div>

          <div className={styles.field}>
            <label>Phone</label>
            {isEditing ? (
              <input
                type="text" 
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
              />
            ) : (
              <p>{profileData.phone || '-'}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Gender</label>
            {isEditing ? (
              <select name="gender" value={profileData.gender} onChange={handleChange}>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p>{profileData.gender || '-'}</p>
            )}
          </div>

          {/* --- CONDITIONAL RENDERING FOR CLASS/GROUP (STUDENT ONLY) --- */}
          {isStudent && (
             <div className={styles.field}>
                <label>Class/Group</label>
                {isEditing ? (
                   <>
                     <div className={styles.dropdown_sec}>
                       <select
                         name="course"
                         value={course}
                         onChange={(e) => {
                            setCourse(e.target.value);
                            if (e.target.value !== "BTECH") setBranch(""); 
                         }}
                         className={`${styles.select_dropdown}`}
                       >
                         <option value="" disabled>Select Course</option>
                         <option value="MCA">MCA</option>
                         <option value="IMCA">IMCA</option>
                         <option value="MBA">MBA</option>
                         <option value="BTECH">BTECH</option>
                       </select>
                     </div>
     
                     {course === "BTECH" && (
                       <div className={styles.dropdown_sec} style={{ marginTop: '10px' }}>
                         <select
                           name="branch"
                           value={branch}
                           onChange={(e) => setBranch(e.target.value)}
                           className={`${styles.select_dropdown}`}
                           style={{ width: '100%' }}
                         >
                           <option value="" disabled>Select BTECH Branch</option>
                           {btechBranches.map((branchName) => (
                             <option key={branchName} value={branchName}>
                               {branchName}
                             </option>
                           ))}
                         </select>
                       </div>
                     )}
                   </>
                ) : (
                  <p>{profileData.classOrGroup || 'N/A'}</p>
                )}
             </div>
          )}
          {/* --- END CONDITIONAL RENDERING --- */}

        </div> {/* End infoSection */}

      </div> {/* End profileCard */}
    </div> // End wrap
  );
}