import { Compass, BookOpen, Target } from "lucide-react";

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-16 text-center">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Features
          </span>
        </h2>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: <Compass className="w-10 h-10 text-indigo-600" />,
              title: "Personalized Career Paths",
              desc: "Get career recommendations based on your skills, interests, and goals.",
            },
            {
              icon: <BookOpen className="w-10 h-10 text-purple-600" />,
              title: "Education Guidance",
              desc: "Find the best courses, certifications, and universities tailored to your aspirations.",
            },
            {
              icon: <Target className="w-10 h-10 text-pink-600" />,
              title: "Skill Assessment",
              desc: "Evaluate your current skills and get suggestions to improve and grow professionally.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="relative bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-lg hover:shadow-2xl transition group border border-indigo-100"
            >
              {/* Gradient ring effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 opacity-40 -z-10" />

              <div className="flex justify-center mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 group-hover:text-indigo-600 transition">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
