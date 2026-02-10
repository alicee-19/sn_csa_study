'use client';

import { useState } from 'react';
import { Question, StudyProgress } from '../types';

interface QuizProps {
  questions: Question[];
  progress: StudyProgress;
  onUpdateProgress: (questionId: number, isCorrect: boolean) => void;
}

export default function Quiz({ questions, progress, onUpdateProgress }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-8 text-center">
        <p className="text-gray-600 text-sm md:text-base">No questions available for the selected filter.</p>
      </div>
    );
  }

  const current = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isMultiAnswer = current.correctAnswer.length > 1;
  const requiredAnswers = current.correctAnswer.length;

  const handleSelectAnswer = (letter: string) => {
    if (showResult) return;
    
    setSelectedAnswers(prev => {
      // If already selected, deselect it
      if (prev.includes(letter)) {
        return prev.filter(a => a !== letter);
      }
      
      // For multi-answer questions, add to selection if under limit
      if (isMultiAnswer) {
        if (prev.length < requiredAnswers) {
          return [...prev, letter];
        }
        // Already at max, don't add more
        return prev;
      }
      
      // For single-answer questions, replace the selection
      return [letter];
    });
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    
    // For multi-answer questions, check if all selected answers match
    const selectedSet = selectedAnswers.sort().join('');
    const correctSet = current.correctAnswer.split('').sort().join('');
    const isCorrect = selectedSet === correctSet;
    
    onUpdateProgress(current.id, isCorrect);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setShowResult(false);
    setCurrentIndex(currentIndex + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setScore(0);
  };

  if (currentIndex >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
        <div className="mb-6">
          <div className="text-4xl md:text-6xl font-bold text-center my-6 md:my-8 text-blue-600">
            {percentage}%
          </div>
          <p className="text-lg md:text-xl text-center text-gray-700 mb-2">
            You scored {score} out of {questions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="w-full bg-blue-600 text-white py-3 md:py-4 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs md:text-sm text-gray-600 gap-1 sm:gap-0">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}/{questions.length}</span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 sm:gap-4">
            <h2 className="text-base md:text-xl font-semibold text-gray-800 flex-1">{current.question}</h2>
            <span className="text-xs md:text-sm text-gray-500">Topic {current.topic}</span>
          </div>
          
          {isMultiAnswer && !showResult && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs md:text-sm text-blue-800">
                ⓘ This question has <strong>{requiredAnswers}</strong> correct answers. Select {requiredAnswers} options. ({selectedAnswers.length}/{requiredAnswers} selected)
              </p>
            </div>
          )}

          <div className="space-y-2 md:space-y-3 mt-6">
            {current.options.map((option) => {
              const isCorrectAnswer = current.correctAnswer.includes(option.letter);
              const isSelected = selectedAnswers.includes(option.letter);
              let className = 'p-3 md:p-4 border-2 rounded-md cursor-pointer transition-all ';
              
              if (showResult) {
                if (isCorrectAnswer) {
                  className += 'border-green-500 bg-green-50';
                } else if (isSelected) {
                  className += 'border-red-500 bg-red-50';
                } else {
                  className += 'border-gray-200 bg-gray-50 opacity-60';
                }
              } else if (isSelected) {
                className += 'border-blue-500 bg-blue-50';
              } else {
                className += 'border-gray-300 hover:border-gray-400 hover:bg-gray-50';
              }

              return (
                <div
                  key={option.letter}
                  onClick={() => handleSelectAnswer(option.letter)}
                  className={className}
                >
                  <div className="flex items-center">
                    <div className="flex items-center mr-2 md:mr-3">
                      {isMultiAnswer ? (
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-2 ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      ) : (
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center mr-2 ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      )}
                      <span className="font-bold text-gray-700 min-w-[24px] text-sm md:text-base">{option.letter}.</span>
                    </div>
                    <span className="text-gray-800 flex-1 text-sm md:text-base">{option.text}</span>
                    {showResult && isCorrectAnswer && (
                      <span className="ml-auto text-green-600 font-semibold text-xs md:text-sm">✓ Correct</span>
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <span className="ml-auto text-red-600 font-semibold text-xs md:text-sm">✗ Wrong</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0 || (isMultiAnswer && selectedAnswers.length !== requiredAnswers)}
            className="w-full bg-blue-600 text-white py-3 md:py-4 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Submit Answer{isMultiAnswer && ` (${selectedAnswers.length}/${requiredAnswers})`}
          </button>
        ) : (
          <div className="space-y-4">
            {selectedAnswers.sort().join('') === current.correctAnswer.split('').sort().join('') ? (
              <div className="p-3 md:p-4 bg-green-50 border border-green-500 rounded-md">
                <p className="font-semibold text-green-800 text-sm md:text-base">Correct! Great job!</p>
              </div>
            ) : (
              <div className="p-3 md:p-4 bg-red-50 border border-red-500 rounded-md">
                <p className="font-semibold text-red-800 text-sm md:text-base">Incorrect. The correct answer is {current.correctAnswer}.</p>
              </div>
            )}
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 md:py-4 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
