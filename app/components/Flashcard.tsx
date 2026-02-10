'use client';

import { useState } from 'react';
import { Question, StudyProgress } from '../types';

interface FlashcardProps {
  questions: Question[];
  progress: StudyProgress;
  onUpdateProgress: (questionId: number, isCorrect: boolean) => void;
}

export default function Flashcard({ questions, progress, onUpdateProgress }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No questions available for the selected filter.</p>
      </div>
    );
  }

  const current = questions[currentIndex];
  const correctAnswers = current.correctAnswer.split('');
  const correctOptions = current.options.filter(opt => correctAnswers.includes(opt.letter));
  const isMultiAnswer = correctAnswers.length > 1;

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const handleKnow = () => {
    onUpdateProgress(current.id, true);
    handleNext();
  };

  const handleDontKnow = () => {
    onUpdateProgress(current.id, false);
    setShowAnswer(true);
  };

  const progressInfo = progress[current.id];
  const accuracy = progressInfo ? Math.round((progressInfo.correct / progressInfo.attempts) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Topic {current.topic} • Q#{current.questionNumber}</span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{current.question}</h2>
          
          {!showAnswer && (
            <div className="space-y-3 mt-6">
              {current.options.map((option) => (
                <div
                  key={option.letter}
                  className="p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <span className="font-medium text-gray-700">{option.letter}.</span> {option.text}
                </div>
              ))}
            </div>
          )}

          {showAnswer && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-md">
              <p className="font-semibold text-green-800 mb-2">
                Correct Answer{isMultiAnswer ? 's' : ''}: {current.correctAnswer}
                {isMultiAnswer && <span className="text-sm font-normal ml-2">(Choose {correctAnswers.length})</span>}
              </p>
              <div className="space-y-2">
                {correctOptions.map(opt => (
                  <div key={opt.letter} className="text-gray-700">
                    <span className="font-semibold">{opt.letter}.</span> {opt.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {progressInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Attempts: {progressInfo.attempts}</span>
              <span>Correct: {progressInfo.correct}</span>
              <span>Accuracy: {accuracy}%</span>
              {progressInfo.mastered && <span className="text-green-600 font-semibold">✓ Mastered</span>}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {!showAnswer ? (
            <>
              <button
                onClick={handleKnow}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-green-700 transition-colors"
              >
                I Know This
              </button>
              <button
                onClick={handleDontKnow}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors"
              >
                Show Answer
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Next Question
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
