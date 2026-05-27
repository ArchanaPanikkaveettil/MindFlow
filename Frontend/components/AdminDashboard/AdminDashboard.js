"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Users, FileText, Eye, Edit, Plus, Trash2 } from "lucide-react";
import styles from "./AdminDashboard.module.scss";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_key = process.env.NEXT_PUBLIC_BASE_URI;

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_key}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
      Swal.fire("Error", "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Policies
  const fetchPolicies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_key}/admin/policies`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (res.data.success) setPolicies(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch policies");
      Swal.fire("Error", "Failed to fetch policies", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_key}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        fetchUsers();
        Swal.fire({ title: "Deleted!", text: "User deleted.", icon: "success", timer: 2000, showConfirmButton: false });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  // View Single User
  const handleViewUser = async (userId) => {
    try {
      const res = await axios.get(`${API_key}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (res.data.success) {
        const user = res.data.data;
        Swal.fire({
          title: `<strong>User Details</strong>`,
          html: `
            <div style="text-align:left">
              <p><b>Name:</b> ${user.name || "—"}</p>
              <p><b>Email:</b> ${user.loginId?.username || "—"}</p>
              <p><b>Role:</b> ${user.loginId?.role === 0 ? "Admin" : user.loginId?.role === 1 ? "Counselor" : "Student"}</p>
              <p><b>Created At:</b> ${new Date(user.createdAt).toLocaleString() || "—"}</p>
            </div>
          `,
          icon: "info",
          confirmButtonText: "Close",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load user details", "error");
    }
  };

  // EDIT USER POPUP
  const handleEditUser = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit User",
      html: `
      <input id="swal-name" class="swal2-input" placeholder="Name" value="${user.name || ""}">
      
      <select id="swal-gender" class="swal2-input" style="height:40px">
        <option value="" disabled>Select Gender</option>
        <option value="Female" ${user.gender === "Female" ? "selected" : ""}>Female</option>
        <option value="Male" ${user.gender === "Male" ? "selected" : ""}>Male</option>
        <option value="Other" ${user.gender === "Other" ? "selected" : ""}>Other</option>
      </select>

      <select id="swal-course" class="swal2-input" style="height:40px">
        <option value="" disabled>Select Course/Class</option>
        <option value="MCA" ${user.classOrGroup === "MCA" ? "selected" : ""}>MCA</option>
        <option value="IMCA" ${user.classOrGroup === "IMCA" ? "selected" : ""}>IMCA</option>
        <option value="MBA" ${user.classOrGroup === "MBA" ? "selected" : ""}>MBA</option>
        <option value="BTECH" ${user.classOrGroup === "BTECH" ? "selected" : ""}>BTECH</option>
      </select>

      <select id="swal-role" class="swal2-input" style="height:40px">
        <option value="2" ${user.loginId?.role === 2 ? "selected" : ""}>Student</option>
        <option value="1" ${user.loginId?.role === 1 ? "selected" : ""}>Counselor</option>
      </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: document.getElementById("swal-name").value,
          gender: document.getElementById("swal-gender").value,
          classOrGroup: document.getElementById("swal-course").value,
          role: parseInt(document.getElementById("swal-role").value, 10),
        };
      },
    });

    if (formValues) {
      try {
        // Update user profile fields (name, gender, course)
        await axios.put(`${API_key}/admin/users/${user._id}`, {
          name: formValues.name,
          gender: formValues.gender,
          classOrGroup: formValues.classOrGroup
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });

        // Update role if changed
        const currentRole = user.loginId?.role;
        if (currentRole !== undefined && formValues.role !== currentRole) {
          const loginId = user.loginId?._id || user.loginId;
          await axios.put(`${API_key}/admin/users/${loginId}/role`, {
            newRole: formValues.role
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
        }

        Swal.fire("Success", "User updated successfully", "success");
        fetchUsers();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to update user details or role", "error");
      }
    }
  };

  // EDIT POLICY POPUP
  const handleEditPolicy = async (policy) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Policy",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${policy.title || ""}">
        <textarea id="swal-content" class="swal2-textarea" placeholder="Content">${policy.content || ""}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          title: document.getElementById("swal-title").value,
          content: document.getElementById("swal-content").value,
        };
      },
    });

    if (formValues) {
      try {
        const res = await axios.put(`${API_key}/admin/policies/${policy._id}`, formValues, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        if (res.data.success) {
          Swal.fire("Success", "Policy updated successfully", "success");
          fetchPolicies();
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to update policy", "error");
      }
    }
  };

  // CREATE POLICY POPUP
  const handleCreatePolicy = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Create New Policy",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title">
        <textarea id="swal-content" class="swal2-textarea" placeholder="Content" style="height: 100px;"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const title = document.getElementById("swal-title").value;
        const content = document.getElementById("swal-content").value;
        if (!title || !content) {
          Swal.showValidationMessage("Title and Content are required");
          return null;
        }
        return { title, content };
      },
    });

    if (formValues) {
      try {
        const res = await axios.post(`${API_key}/admin/policies`, formValues, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        if (res.data.success) {
          Swal.fire("Success", "New policy created successfully", "success");
          fetchPolicies();
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to create policy", "error");
      }
    }
  };

  // Auto-fetch on tab change
  useEffect(() => {
    if (activeSection === "users") fetchUsers();
    if (activeSection === "policies") fetchPolicies();
  }, [activeSection]);

  return (
    <div className={`wrap pt_100 pb_100 ${styles.dashboard}`}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      {/* Tabs */}
      <div className={styles.topButtons}>
        <button onClick={() => setActiveSection("users")} className={`${styles.tabBtn} ${activeSection === "users" ? styles.active : ""}`}>
          <Users size={20} /> Manage Users
        </button>
        <button onClick={() => setActiveSection("policies")} className={`${styles.tabBtn} ${activeSection === "policies" ? styles.active : ""}`}>
          <FileText size={20} /> Agreements & Policies
        </button>
      </div>

      <div className={styles.contentSection}>
        {loading && <p className={styles.loadingText}>Loading...</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {/* Users */}
        {activeSection === "users" && !loading && (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Manage Users</h2>
            {users.length === 0 ? <p>No users found.</p> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    if (user.loginId?.role === 0) return null;
                    return (
                      <tr key={user._id || i}>
                        <td>{user.name}</td>
                        <td>{user.loginId?.username || "—"}</td>
                        <td>{user.loginId?.role === 0 ? "Admin" : user.loginId?.role === 1 ? "Counselor" : "Student"}</td>
                        <td>
                          <button onClick={() => handleViewUser(user._id)} className={styles.iconBtn}><Eye size={18} /></button>
                          <button onClick={() => handleEditUser(user)} className={styles.iconBtn}><Edit size={18} /></button>
                          <button onClick={() => handleDeleteUser(user._id)} className={styles.iconBtn}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Policies */}
        {activeSection === "policies" && !loading && (
          <div className={styles.sectionBox}>
            <h2 className={styles.sectionTitle}>Agreements & Policies</h2>
            {policies.length === 0 ? <p>No policies found.</p> : (
              <div className={styles.policyList}>
                {policies.map((p, i) => (
                  <div key={i} className={styles.policyCard}>
                    <div>
                      <h4>{p.title}</h4>
                      <p className={styles.policyDate}>Last Updated: {p.date}</p>
                    </div>
                    <button onClick={() => handleEditPolicy(p)} className={styles.editBtn}><Edit size={18} /> Edit</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleCreatePolicy} className={styles.addBtn}><Plus size={18} /> Create New Policy</button>
          </div>
        )}
      </div>
    </div>
  );
}
