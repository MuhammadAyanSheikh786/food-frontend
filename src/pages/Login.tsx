import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,146,60,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(251,146,60,0.05)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors duration-200 mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              Welcome Back
            </h1>
            <p className="text-dark-400 mt-2 text-sm">
              Sign in to your Iqbal Food account
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="btn-outline w-full flex items-center justify-center gap-3 py-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-dark-900">
                  G
                </div>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <p className="text-center mt-6 text-sm text-dark-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
