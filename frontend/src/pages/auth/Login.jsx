import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

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
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-black to-black -z-10"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-zinc-900/40 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-zinc-400 text-sm font-semibold tracking-wide">
              LeadSphere
            </p>
          </div>

          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl"
              >
                <p className="text-xs font-bold text-emerald-400 text-center">{successMessage}</p>
              </motion.div>
            )}

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
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EmailIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockIcon className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-zinc-800/50 border border-zinc-800 rounded-2xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all font-medium"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex justify-end">
              <Link to="#" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 bg-white text-black font-bold rounded-2xl shadow-xl hover:bg-zinc-100 transition-colors text-sm"
            >
              Sign In
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 font-semibold text-xs">
              Don't have an account?{" "}
              <Link to="/register" className="text-white hover:underline transition-all">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
