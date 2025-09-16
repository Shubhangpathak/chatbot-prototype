import { motion } from "framer-motion";

export default function Home() {
  return (
    <section className="flex flex-col justify-center items-center text-center  bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen w-full">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        {/* Logo */}
        {/* <div className="flex justify-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold shadow-sm">
            M
          </div>
        </div> */}

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
          Empower Your Future with{" "}
          <span className="text-indigo-600">Mentora</span>
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Mentora is your personal AI-powered career and education guide.
          Discover tailored career paths, explore top universities, and improve
          your skills with smart recommendations. All in one place.
        </p>

        <a
          href="/signup"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full shadow-md hover:bg-indigo-700 transition"
        >
          Get Started →
        </a>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full"
      >
        {[
          {
            title: "Career Paths",
            desc: "Find roles that match your skills and interests.",
          },
          {
            title: "Skill Assessments",
            desc: "Know your strengths and bridge your skill gaps.",
          },
          {
            title: "Education Roadmap",
            desc: "Get curated courses and university suggestions.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
