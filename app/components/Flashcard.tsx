'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Question, StudyProgress } from '../types';

interface FlashcardProps {
  questions: Question[];
  progress: StudyProgress;
  onUpdateProgress: (questionId: number, isCorrect: boolean) => void;
  onComplete: () => void;
}

export default function Flashcard({ questions, progress, onUpdateProgress, onComplete }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  // After flip-back animation completes, run pending action
  useEffect(() => {
    if (!isFlipped && pendingAction.current) {
      const timer = setTimeout(() => {
        pendingAction.current?.();
        pendingAction.current = null;
        setIsTransitioning(false);
      }, 350); // wait for flip animation
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
        <p className="text-gray-600">No questions available for the selected filter.</p>
      </div>
    );
  }

  if (completed) {
    const studiedCount = questions.filter(q => {
      const p = progress[q.id];
      return p && p.attempts > 0;
    }).length;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Flashcards Complete!</h2>
        <p className="text-lg text-gray-600 mb-6">You reviewed all {questions.length} questions.</p>
        <p className="text-gray-500 mb-8">{studiedCount} marked as studied</p>
        <button
          onClick={onComplete}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Settings
        </button>
      </div>
    );
  }

  const current = questions[currentIndex];
  const correctAnswers = current.correctAnswer.split('');
  const correctOptions = current.options.filter(opt => correctAnswers.includes(opt.letter));
  const isMultiAnswer = correctAnswers.length > 1;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleFlip = () => {
    if (isTransitioning) return;
    setIsFlipped(prev => !prev);
  };

  const advanceOrComplete = () => {
    if (isLastQuestion) {
      setCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const flipThenAdvance = (action: () => void) => {
    if (isFlipped) {
      setIsTransitioning(true);
      pendingAction.current = () => {
        action();
        advanceOrComplete();
      };
      setIsFlipped(false);
    } else {
      action();
      advanceOrComplete();
    }
  };

  const handleNext = () => {
    if (isTransitioning) return;
    if (isFlipped) {
      setIsTransitioning(true);
      pendingAction.current = () => advanceOrComplete();
      setIsFlipped(false);
    } else {
      advanceOrComplete();
    }
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    if (currentIndex === 0) return;
    if (isFlipped) {
      setIsTransitioning(true);
      pendingAction.current = () => setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    } else {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleStudied = () => {
    if (isTransitioning) return;
    flipThenAdvance(() => onUpdateProgress(current.id, true));
  };

  const handleNotStudied = () => {
    if (isTransitioning) return;
    flipThenAdvance(() => onUpdateProgress(current.id, false));
  };

  const progressInfo = progress[current.id];
  const accuracy = progressInfo ? Math.round((progressInfo.correct / progressInfo.attempts) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Topic {current.topic} • Q#{current.questionNumber}</span>
      </div>

      {/* Flip Card */}
      <div className="flashcard-container cursor-pointer" onClick={handleFlip}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front - Question */}
          <div className="flashcard-front bg-white shadow-lg border-2 border-gray-200 p-5 sm:p-8">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Tap to flip</span>
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4">{current.question}</h2>
            {isMultiAnswer && (
              <p className="text-xs sm:text-sm text-blue-600 mb-3">({correctAnswers.length} correct answers)</p>
            )}
            <div className="space-y-2 sm:space-y-3 mt-4">
              {current.options.map((option) => (
                <div
                  key={option.letter}
                  className="p-2 sm:p-3 border border-gray-200 rounded-md bg-gray-50 text-sm sm:text-base"
                >
                  <span className="font-medium text-gray-700">{option.letter}.</span> {option.text}
                </div>
              ))}
            </div>
          </div>

          {/* Back - Answer */}
          <div className="flashcard-back bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border-2 border-green-300 p-5 sm:p-8">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Tap to flip back</span>
            </div>
            <div className="mb-6">
              <p className="text-sm sm:text-base font-semibold text-green-800 mb-1">
                Correct Answer{isMultiAnswer ? 's' : ''}:
              </p>
              <div className="space-y-2 mt-3">
                {correctOptions.map(opt => (
                  <div key={opt.letter} className="p-2 sm:p-3 bg-green-100 border border-green-300 rounded-md text-sm sm:text-base">
                    <span className="font-bold text-green-800">{opt.letter}.</span>{' '}
                    <span className="text-green-900">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Original question:</p>
              <p className="text-sm sm:text-base text-gray-700 italic">{current.question}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress info */}
      {progressInfo && (
        <div className="p-3 bg-gray-50 rounded-md text-xs sm:text-sm">
          <div className="flex flex-wrap justify-between gap-2 text-gray-600">
            <span>Attempts: {progressInfo.attempts}</span>
            <span>Correct: {progressInfo.correct}</span>
            <span>Accuracy: {accuracy}%</span>
            {progressInfo.mastered && <span className="text-green-600 font-semibold">Mastered</span>}
          </div>
        </div>
      )}

      {/* Action buttons - Studied / Not Studied */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleStudied}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
        >
          Studied
        </button>
        <button
          onClick={handleNotStudied}
          className="flex-1 bg-amber-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-amber-600 active:bg-amber-700 transition-colors text-sm sm:text-base"
        >
          Not Studied
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isTransitioning}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isTransitioning}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
