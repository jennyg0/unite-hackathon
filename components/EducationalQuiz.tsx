"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  BookOpen,
  Lightbulb,
} from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  questions: QuizQuestion[];
  rewards: {
    points: number;
    nftEligible: boolean;
  };
}

const DEFI_QUIZZES: Quiz[] = [
  {
    id: "defi-basics",
    title: "DeFi Fundamentals",
    description: "Master the basics of decentralized finance",
    icon: "📚",
    difficulty: "beginner",
    estimatedTime: "5 min",
    questions: [
      {
        id: 1,
        question: "What does DeFi stand for?",
        options: [
          "Digital Finance",
          "Decentralized Finance",
          "Distributed Finance",
          "Direct Finance"
        ],
        correctAnswer: 1,
        explanation: "DeFi stands for Decentralized Finance, which refers to financial services built on blockchain technology without traditional intermediaries.",
        difficulty: "beginner"
      },
      {
        id: 2,
        question: "What is the main advantage of DeFi over traditional banking?",
        options: [
          "Higher fees",
          "More regulations",
          "24/7 availability and higher yields",
          "Slower transactions"
        ],
        correctAnswer: 2,
        explanation: "DeFi offers 24/7 availability, typically higher yields than traditional savings accounts, and operates without banking hours or geographical restrictions.",
        difficulty: "beginner"
      },
      {
        id: 3,
        question: "What is a smart contract?",
        options: [
          "A legal document",
          "Self-executing code on blockchain",
          "A type of cryptocurrency",
          "A trading strategy"
        ],
        correctAnswer: 1,
        explanation: "A smart contract is self-executing code deployed on a blockchain that automatically enforces the terms of an agreement without intermediaries.",
        difficulty: "beginner"
      }
    ],
    rewards: {
      points: 100,
      nftEligible: true
    }
  },
  {
    id: "yield-farming",
    title: "Yield Farming Mastery",
    description: "Learn advanced yield optimization strategies",
    icon: "🌾",
    difficulty: "intermediate",
    estimatedTime: "8 min",
    questions: [
      {
        id: 1,
        question: "What is yield farming?",
        options: [
          "Growing crops for profit",
          "Providing liquidity to earn rewards",
          "Trading cryptocurrencies",
          "Mining Bitcoin"
        ],
        correctAnswer: 1,
        explanation: "Yield farming involves providing liquidity to DeFi protocols in exchange for rewards, typically in the form of tokens or fees.",
        difficulty: "intermediate"
      },
      {
        id: 2,
        question: "What is impermanent loss?",
        options: [
          "Losing your private keys",
          "Temporary market volatility",
          "Loss due to price divergence in liquidity pools",
          "Exchange going offline"
        ],
        correctAnswer: 2,
        explanation: "Impermanent loss occurs when the price ratio of tokens in a liquidity pool changes compared to when you deposited them, resulting in fewer tokens when withdrawn.",
        difficulty: "intermediate"
      }
    ],
    rewards: {
      points: 200,
      nftEligible: true
    }
  }
];

interface EducationalQuizProps {
  quizId?: string;
  onComplete?: (score: number, totalQuestions: number) => void;
  onClose?: () => void;
}

export function EducationalQuiz({ quizId, onComplete, onClose }: EducationalQuizProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(
    quizId ? DEFI_QUIZZES.find(q => q.id === quizId) || null : null
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    if (answerIndex === selectedQuiz!.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < selectedQuiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      onComplete?.(score, selectedQuiz!.questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
      setShowExplanation(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  };

  if (!selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Learning Path
          </h2>
          <p className="text-gray-600">
            Select a quiz to test your knowledge and earn rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEFI_QUIZZES.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleQuizSelect(quiz)}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{quiz.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {quiz.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{quiz.questions.length} questions</span>
                      <span>{quiz.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {quiz.rewards.points} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="card">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <Lightbulb className="w-10 h-10 text-yellow-600" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Good Effort!'}
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            You scored {score} out of {selectedQuiz.questions.length} ({percentage}%)
          </p>

          {passed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Rewards Earned!</span>
              </div>
              <p className="text-green-700">
                +{selectedQuiz.rewards.points} points
                {selectedQuiz.rewards.nftEligible && ' • NFT eligible'}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="btn-secondary"
            >
              Try Another Quiz
            </button>
            <button
              onClick={() => handleQuizSelect(selectedQuiz)}
              className="btn-primary"
            >
              Retake Quiz
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const question = selectedQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedQuiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedQuiz.title}
          </h2>
          <button
            onClick={resetQuiz}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {selectedQuiz.questions.length}
        </p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card mb-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showResult = showExplanation;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                      : isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card mb-6 bg-blue-50 border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {showExplanation && (
          <button
            onClick={handleNext}
            className="btn-primary flex items-center space-x-2"
          >
            <span>
              {currentQuestion === selectedQuiz.questions.length - 1 ? 'Finish' : 'Next'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default EducationalQuiz;