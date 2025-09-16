export default function Features() {
  return (
    <section className="py-16">
      <h2 className="text-4xl font-bold mb-10 text-center text-indigo-700">Features</h2>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Personalized Career Paths</h3>
          <p>Get career recommendations based on your skills, interests, and goals.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Education Guidance</h3>
          <p>Find the best courses, certifications, and universities tailored to your aspirations.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Skill Assessment</h3>
          <p>Evaluate your current skills and get suggestions to improve and grow professionally.</p>
        </div>
      </div>
    </section>
  )
}