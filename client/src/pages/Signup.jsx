import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-20 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create an Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center text-gray-600 mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 hover:underline font-medium">
          Login here
        </Link>
      </p>
    </motion.div>
  );
}