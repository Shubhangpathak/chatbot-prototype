export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-6 text-indigo-700">Dashboard</h2>
      <p className="mb-4">
        Welcome to your personalized dashboard! Here you can:
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>View your career recommendations</li>
        <li>Track your skill assessments</li>
        <li>Explore educational courses and certifications</li>
        <li>Update your profile and preferences</li>
      </ul>
    </div>
  )
}