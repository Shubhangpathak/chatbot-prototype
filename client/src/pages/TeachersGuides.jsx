import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Video, FileText, Calendar, Users, Share2 } from "lucide-react";

export default function TeachersGuides() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toLocaleDateString()
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 2000);
  };

  const handleGoLive = () => {
    // Simulate starting a live session
    alert("🎥 Starting live session! Students will be notified and can join your session.");
  };

  const handleScheduleSession = () => {
    // Simulate scheduling a session
    alert("📅 Session scheduling feature coming soon! You'll be able to set date, time, and send invites to students.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Teachers Guide Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your teaching resources and connect with students through live sessions
          </p>
        </motion.div>

        {/* Main Cards Container */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Upload & Share Resources Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Upload & Share Resources</h2>
                  <p className="text-blue-100 mt-1">Share learning materials with your students</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload Learning Materials
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Support for videos, PDFs, documents, and presentations
                  </p>
                  
                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      {isUploading ? "Uploading..." : "Choose Files"}
                    </motion.button>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Recently Uploaded</h4>
                    <div className="space-y-2">
                      {uploadedFiles.slice(-3).map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-700">{file.name}</p>
                              <p className="text-sm text-gray-500">{file.uploadDate}</p>
                            </div>
                          </div>
                          <button className="text-indigo-600 hover:text-indigo-800 transition">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                  >
                    View All Resources
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-medium hover:bg-indigo-200 transition"
                  >
                    Share with Class
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Go Live Session Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Go Live Session</h2>
                  <p className="text-purple-100 mt-1">Connect with students in real-time</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Live Session Options */}
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoLive}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <Video className="w-6 h-6" />
                    Start Live Session Now
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScheduleSession}
                    className="w-full bg-white border-2 border-purple-200 text-purple-700 p-6 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-6 h-6" />
                    Schedule Future Session
                  </motion.button>
                </div>

                {/* Session Info */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Live Session Features
                  </h4>
                  <ul className="space-y-2 text-purple-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Interactive whiteboard and screen sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Real-time chat and Q&A
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Student attendance tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Session recording and playback
                    </li>
                  </ul>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Sessions This Month</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-gray-600">Total Students</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Our comprehensive guides will help you make the most of your teaching tools
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-medium hover:bg-indigo-200 transition"
              >
                View Tutorial Videos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl font-medium hover:bg-purple-200 transition"
              >
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
