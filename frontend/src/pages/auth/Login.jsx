import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

/* ─────────────────────────────────────────────────────────────
   Brand Logo
───────────────────────────────────────────────────────────── */
const BrandLogo = () => (
  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="9" fill="url(#loginLg)" />
    <path d="M9 22L16 10L23 22H9Z" fill="white" fillOpacity="0.9" />
    <circle cx="16" cy="14" r="3" fill="white" />
    <defs>
      <linearGradient id="loginLg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "0.75rem 0.875rem 0.75rem 2.75rem",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.875rem",
    color: "#0F172A",
    background: "#FAFBFF",
    border: `1.5px solid ${focusedField === field ? "#4F46E5" : "#E2E8F0"}`,
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.18s ease",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
    lineHeight: 1.5,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "1.5rem",
        background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #F0F9FF 100%)",
      }}
    >
      {/* Decorative background blobs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%", width: "450px", height: "450px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-5%", width: "400px", height: "400px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} className="animate-float animation-delay-2000" />
      <div style={{
        position: "absolute", top: "30%", right: "10%", width: "250px", height: "250px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} className="animate-float animation-delay-4000" />

      {/* Login Card */}
      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(226,232,240,0.8)",
          boxShadow: "0 24px 64px -12px rgba(79,70,229,0.14), 0 8px 24px -8px rgba(15,23,42,0.08)",
          padding: "2.5rem 2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <BrandLogo />
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.5rem", fontWeight: 800,
              color: "#0F172A", margin: "0 0 0.25rem",
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #0F172A, #4F46E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            LeadSphere
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0, fontWeight: 500 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex", alignItems: "flex-start", gap: "0.75rem",
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: "10px", padding: "0.875rem 1rem", marginBottom: "1.25rem",
            }}
          >
            <CheckCircleIcon style={{ fontSize: 18, color: "#16A34A", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "0.84rem", color: "#15803D", margin: 0, fontWeight: 500 }}>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex", alignItems: "flex-start", gap: "0.75rem",
              background: "#FFF1F2", border: "1px solid #FECDD3",
              borderRadius: "10px", padding: "0.875rem 1rem", marginBottom: "1.25rem",
            }}
          >
            <ErrorIcon style={{ fontSize: 18, color: "#E11D48", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "0.84rem", color: "#BE123C", margin: 0, fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <EmailIcon style={{
                position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                fontSize: 18, color: focusedField === "email" ? "#4F46E5" : "#94A3B8",
                transition: "color 0.18s ease", pointerEvents: "none",
              }} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={inputStyle("email")}
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <LockIcon style={{
                position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                fontSize: 18, color: focusedField === "password" ? "#4F46E5" : "#94A3B8",
                transition: "color 0.18s ease", pointerEvents: "none",
              }} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                style={{ ...inputStyle("password"), paddingRight: "3rem" }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: "#94A3B8", display: "flex", alignItems: "center",
                  transition: "color 0.18s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#4F46E5"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
              >
                {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.8rem",
              border: "none",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
              color: "white",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
              transition: "all 0.2s ease",
              marginTop: "0.25rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #4338CA, #4F46E5)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.45)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #4F46E5, #6366F1)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Sign In
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: "center", fontSize: "0.84rem", color: "#64748B", margin: "1.5rem 0 0" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "none", transition: "color 0.15s ease" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#4338CA"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#4F46E5"}
          >
            Register as Organization Admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
