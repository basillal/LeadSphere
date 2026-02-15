import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const RegisterCompany = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
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
      await api.post("/auth/register-company", formData);
      // On success, redirect to login with a success message (could be passed via state)
      // For now, just redirect
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <BusinessIcon className="text-black text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Register Company
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your company account
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Company Name */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BusinessIcon className="h-5 w-5 text-black transition-colors" />
              </div>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200 shadow-sm hover:bg-white"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                autoFocus
              />
            </div>

            {/* Admin Name */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PersonIcon className="h-5 w-5 text-black transition-colors" />
              </div>
              <input
                id="adminName"
                name="adminName"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200 shadow-sm hover:bg-white"
                placeholder="Admin Name"
                value={formData.adminName}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EmailIcon className="h-5 w-5 text-black transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200 shadow-sm hover:bg-white"
                placeholder="admin@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-black transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition-all duration-200 shadow-sm hover:bg-white"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-black hover:text-gray-700 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5" />
                  ) : (
                    <Visibility className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 shadow-lg hover:shadow-gray-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Register Company
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompany;
