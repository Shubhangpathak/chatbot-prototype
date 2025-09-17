import { Compass, Target, BookOpen, User } from "lucide-react";

export default function Dashboard() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-10 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-100">
        {/* Heading */}
        <h2 className="text-4xl font-extrabold mb-8 text-center">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h2>

        {/* Intro */}
        <p className="mb-6 text-gray-600 text-center text-lg">
          Welcome to your personalized dashboard! Here you can:
        </p>

        {/* Features list */}
        <ul className="space-y-4 text-gray-700">
          {[
            {
              icon: <Compass className="w-5 h-5 text-indigo-600" />,
              text: "View your career recommendations",
            },
            {
              icon: <Target className="w-5 h-5 text-purple-600" />,
              text: "Track your skill assessments",
            },
            {
              icon: <BookOpen className="w-5 h-5 text-pink-600" />,
              text: "Explore educational courses and certifications",
            },
            {
              icon: <User className="w-5 h-5 text-indigo-500" />,
              text: "Update your profile and preferences",
            },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 rounded-lg hover:shadow-md transition"
            >
              {item.icon}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="/profile"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition"
          >
            Go to Profile →
          </a>
        </div>
      </div>
    </section>
  );
}
