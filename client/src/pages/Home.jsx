import { motion } from "framer-motion";
import { BookOpen, Compass, Target } from "lucide-react";

export default function Home() {
  return (
    <section className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-indigo-50 via-white to-purple-100 min-h-screen w-full">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl px-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Empower Your Future with{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mentora
          </span>
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Mentora is your personal AI-powered career and education guide.
          Discover tailored career paths, explore top universities, and improve
          your skills with smart recommendations. All in one place.
        </p>

        <a
          href="/signup"
          className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform"
        >
          Get Started →
        </a>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full px-6"
      >
        {[
          {
            icon: <Compass className="w-8 h-8 text-indigo-600" />,
            title: "Career Paths",
            desc: "Find tech roles that match your skills & passions.",
          },
          {
            icon: <Target className="w-8 h-8 text-purple-600" />,
            title: "Skill Assessments",
            desc: "Know your strengths & bridge skill gaps confidently.",
          },
          {
            icon: <BookOpen className="w-8 h-8 text-pink-600" />,
            title: "Education Roadmap",
            desc: "Curated courses & university suggestions — just for you.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Gradient Ring Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 opacity-40 -z-10" />

            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
