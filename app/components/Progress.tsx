"use client";

import { useState } from "react";
import { Question, StudyProgress } from "../types";

interface ProgressProps {
  progress: StudyProgress;
  questions: Question[];
  onResetProgress: () => void;
}

export default function Progress({
  progress,
  questions,
  onResetProgress,
}: ProgressProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const questionKeys = new Set(
    questions.map(
      (question) => question.progressKey || `${question.exam}-${question.id}`
    )
  );
  const scopedProgressEntries = Object.entries(progress).filter(([key]) =>
    questionKeys.has(key)
  );

  const totalQuestions = questions.length;
  const attempted = scopedProgressEntries.filter(([, q]) => {
    return q && q.attempts > 0;
  }).length;

  const mastered = scopedProgressEntries.filter(([, q]) => {
    return q && q.mastered;
  }).length;

  const totalAttempts = scopedProgressEntries.reduce(
    (sum, [, p]) => sum + p.attempts,
    0
  );
  const totalCorrect = scopedProgressEntries.reduce(
    (sum, [, p]) => sum + p.correct,
    0
  );
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const progressPercent =
    totalQuestions > 0 ? Math.round((attempted / totalQuestions) * 100) : 0;

  const handleReset = () => {
    onResetProgress();
    setShowConfirm(false);
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-700'>
          Your Progress
        </h2>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className='text-sm text-red-500 hover:text-red-700 transition-colors border border-red-300 rounded-md px-3 py-1 hover:bg-red-50 self-start sm:self-auto'
          >
            Reset Progress
          </button>
        ) : (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-red-600'>Are you sure?</span>
            <button
              onClick={handleReset}
              className='text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors'
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className='text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
        <div className='p-3 sm:p-4 bg-gray-50 rounded-md'>
          <p className='text-xs sm:text-sm text-gray-600'>
            Questions Attempted
          </p>
          <p className='text-2xl sm:text-3xl font-bold text-gray-800'>
            {attempted}/{totalQuestions}
          </p>
        </div>
        <div className='p-3 sm:p-4 bg-green-50 rounded-md'>
          <p className='text-xs sm:text-sm text-gray-600'>Mastered</p>
          <p className='text-2xl sm:text-3xl font-bold text-green-600'>
            {mastered}
          </p>
        </div>
        <div className='p-3 sm:p-4 bg-blue-50 rounded-md'>
          <p className='text-xs sm:text-sm text-gray-600'>Total Attempts</p>
          <p className='text-2xl sm:text-3xl font-bold text-blue-600'>
            {totalAttempts}
          </p>
        </div>
        <div className='p-3 sm:p-4 bg-purple-50 rounded-md'>
          <p className='text-xs sm:text-sm text-gray-600'>Overall Accuracy</p>
          <p className='text-2xl sm:text-3xl font-bold text-purple-600'>
            {overallAccuracy}%
          </p>
        </div>
      </div>

      <div className='mt-4'>
        <div className='flex justify-between text-xs sm:text-sm text-gray-600 mb-1'>
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className='bg-blue-600 h-3 rounded-full transition-all duration-500'
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
