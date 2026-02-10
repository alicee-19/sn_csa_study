'use client';

import { Question, StudyProgress } from '../types';

interface ProgressProps {
  progress: StudyProgress;
  questions: Question[];
}

export default function Progress({ progress, questions }: ProgressProps) {
  const totalQuestions = questions.length;
  const attempted = Object.keys(progress).filter(id => {
    const q = progress[id];
    return q && q.attempts > 0;
  }).length;

  const mastered = Object.keys(progress).filter(id => {
    const q = progress[id];
    return q && q.mastered;
  }).length;

  const totalAttempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);
  const totalCorrect = Object.values(progress).reduce((sum, p) => sum + p.correct, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Questions Attempted</p>
          <p className="text-3xl font-bold text-gray-800">{attempted}/{totalQuestions}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-md">
          <p className="text-sm text-gray-600">Mastered</p>
          <p className="text-3xl font-bold text-green-600">{mastered}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-600">Total Attempts</p>
          <p className="text-3xl font-bold text-blue-600">{totalAttempts}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-md">
          <p className="text-sm text-gray-600">Overall Accuracy</p>
          <p className="text-3xl font-bold text-purple-600">{overallAccuracy}%</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round((attempted / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(attempted / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
