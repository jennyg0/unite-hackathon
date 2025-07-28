"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  Trophy,
  CheckCircle,
  ChevronRight,
  Star,
  Lock,
  ArrowLeft,
} from "lucide-react";
import {
  educationModules,
  type EducationModule,
} from "@/lib/education-modules";
import { usePrivy } from "@privy-io/react-auth";
import { MilestoneSDK } from "@/lib/milestone-nft";

interface ModuleProgress {
  moduleId: number;
  completed: boolean;
  completedAt?: Date;
  quizScore?: number;
}

export default function EducationCenter() {
  const { user } = usePrivy();
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(
    null
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("educationProgress");
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Calculate total points
  useEffect(() => {
    const points = progress.reduce((total, p) => {
      if (p.completed) {
        const module = educationModules.find((m) => m.id === p.moduleId);
        return total + (module?.points || 0);
      }
      return total;
    }, 0);
    setTotalPoints(points);
  }, [progress]);

  const isModuleCompleted = (moduleId: number) => {
    return progress.some((p) => p.moduleId === moduleId && p.completed);
  };

  const getModuleProgress = (moduleId: number) => {
    return progress.find((p) => p.moduleId === moduleId);
  };

  const completeModule = async (moduleId: number, quizScore: number) => {
    const newProgress: ModuleProgress = {
      moduleId,
      completed: true,
      completedAt: new Date(),
      quizScore,
    };

    const updatedProgress = [
      ...progress.filter((p) => p.moduleId !== moduleId),
      newProgress,
    ];
    setProgress(updatedProgress);
    localStorage.setItem("educationProgress", JSON.stringify(updatedProgress));

    // Record in smart contract if connected
    if (user?.wallet?.address) {
      try {
        const sdk = new MilestoneSDK();
        // This would call the contract to record education progress
        console.log("Recording education progress for module:", moduleId);
      } catch (error) {
        console.error("Failed to record on chain:", error);
      }
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null || !selectedModule) return;

    setShowResult(true);

    if (selectedAnswer === selectedModule.content.quiz?.correctAnswer) {
      // Correct answer - complete the module
      setTimeout(() => {
        completeModule(selectedModule.id, 100);
        setSelectedModule(null);
        setShowQuiz(false);
        setShowResult(false);
        setSelectedAnswer(null);
        setCurrentSection(0);
      }, 2000);
    }
  };

  const completedCount = progress.filter((p) => p.completed).length;
  const progressPercentage = (completedCount / educationModules.length) * 100;

  // Group modules by category
  const modulesByCategory = educationModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, EducationModule[]>);

  const categoryTitles = {
    basics: "Getting Started",
    saving: "Saving Strategies",
    defi: "DeFi Essentials",
    advanced: "Advanced Topics",
  };

  if (selectedModule) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          {/* Module Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setSelectedModule(null);
                setCurrentSection(0);
                setShowQuiz(false);
                setShowResult(false);
                setSelectedAnswer(null);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to modules</span>
            </button>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{selectedModule.duration} min</span>
              </span>
              <span className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>{selectedModule.points} points</span>
              </span>
            </div>
          </div>

          {/* Module Content */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{selectedModule.icon}</span>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedModule.title}
              </h2>
            </div>

            {!showQuiz ? (
              <div className="space-y-6">
                {/* Section Navigation */}
                <div className="flex space-x-2 mb-6">
                  {selectedModule.content.sections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSection(index)}
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        index === currentSection
                          ? "bg-blue-600"
                          : index < currentSection
                          ? "bg-blue-300"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Section Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedModule.content.sections[currentSection].title}
                    </h3>

                    <p className="text-gray-700 leading-relaxed">
                      {selectedModule.content.sections[currentSection].content}
                    </p>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Key Points:
                      </h4>
                      <ul className="space-y-2">
                        {selectedModule.content.sections[
                          currentSection
                        ].keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      setCurrentSection(Math.max(0, currentSection - 1))
                    }
                    disabled={currentSection === 0}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {currentSection <
                  selectedModule.content.sections.length - 1 ? (
                    <button
                      onClick={() => setCurrentSection(currentSection + 1)}
                      className="btn-primary"
                    >
                      Next
                    </button>
                  ) : selectedModule.content.quiz ? (
                    <button
                      onClick={() => setShowQuiz(true)}
                      className="btn-primary"
                    >
                      Take Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => completeModule(selectedModule.id, 100)}
                      className="btn-primary"
                    >
                      Complete Module
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Section */
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Quick Quiz
                </h3>

                <p className="text-gray-700">
                  {selectedModule.content.quiz?.question}
                </p>

                <div className="space-y-3">
                  {selectedModule.content.quiz?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showResult && setSelectedAnswer(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === idx
                          ? showResult
                            ? idx === selectedModule.content.quiz?.correctAnswer
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult &&
                          idx ===
                            selectedModule.content.quiz?.correctAnswer && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                      </div>
                    </button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      selectedAnswer ===
                      selectedModule.content.quiz?.correctAnswer
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <p className="font-medium mb-1">
                      {selectedAnswer ===
                      selectedModule.content.quiz?.correctAnswer
                        ? "🎉 Correct!"
                        : "💡 Not quite right"}
                    </p>
                    <p className="text-sm">
                      {selectedModule.content.quiz?.explanation}
                    </p>
                  </motion.div>
                )}

                {!showResult && (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Education Center
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Learn about personal finance, saving strategies, and DeFi concepts.
          Complete modules to earn points and unlock achievements!
        </p>
      </div>

      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Progress
            </h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {educationModules.length} modules completed
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
            <p className="text-sm text-gray-600">Total Points</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {completedCount === educationModules.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <p className="text-green-800 font-medium">
              🎓 Congratulations! You've completed all modules and earned the
              Education Master achievement!
            </p>
          </motion.div>
        )}
      </div>

      {/* Modules by Category */}
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {categoryTitles[category as keyof typeof categoryTitles]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, idx) => {
              const isCompleted = isModuleCompleted(module.id);
              const isLocked =
                idx > 0 && !isModuleCompleted(modules[idx - 1].id);

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card hover:shadow-lg transition-shadow cursor-pointer ${
                    isLocked ? "opacity-60" : ""
                  }`}
                  onClick={() => !isLocked && setSelectedModule(module)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className="text-3xl p-3 rounded-lg"
                      style={{ backgroundColor: `${module.color}20` }}
                    >
                      {module.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {module.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3 text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{module.duration} min</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4" />
                            <span>{module.points} pts</span>
                          </span>
                        </div>

                        {isCompleted && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-xs font-medium">
                              Completed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
