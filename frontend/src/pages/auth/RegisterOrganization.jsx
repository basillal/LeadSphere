import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion, AnimatePresence } from "framer-motion";

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    adminName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register-organization", formData);
      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 py-12">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.15, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-900/20 via-black to-black -z-10"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-zinc-400 text-sm font-semibold tracking-wide">
              LeadSphere
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl"
              >
                <p className="text-xs font-bold text-rose-400 text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {/* Organization Name */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <BusinessIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  name="organizationName"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Organization Name"
                  value={formData.organizationName}
                  onChange={handleChange}
                />
              </div>

              {/* Admin Name */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <PersonIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  name="adminName"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Admin Full Name"
                  value={formData.adminName}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EmailIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 bg-white text-black font-bold rounded-2xl shadow-xl hover:bg-zinc-100 transition-colors text-sm"
              >
                Register
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 font-semibold text-xs">
              Already have an account?{" "}
              <Link to="/login" className="text-white hover:underline transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterOrganization;
