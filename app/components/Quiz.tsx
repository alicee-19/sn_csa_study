"use client";

import { useState } from "react";
import { Question, StudyProgress } from "../types";

interface QuizProps {
  questions: Question[];
  progress: StudyProgress;
  onUpdateProgress: (questionKey: string, isCorrect: boolean) => void;
  onComplete: () => void;
  testMode?: boolean;
}

export default function Quiz({
  questions,
  progress,
  onUpdateProgress,
  onComplete,
  testMode = false,
}: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [dragAssignments, setDragAssignments] = useState<
    Record<string, string>
  >({});
  const [activeDraggedItem, setActiveDraggedItem] = useState<string | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [testSelections, setTestSelections] = useState<Record<string, string>>(
    {}
  );
  const [testDragSelections, setTestDragSelections] = useState<
    Record<string, Record<string, string>>
  >({});

  if (questions.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 text-center'>
        <p className='text-gray-600'>
          No questions available for the selected filter.
        </p>
      </div>
    );
  }

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setDragAssignments({});
    setActiveDraggedItem(null);
    setShowResult(false);
    setScore(0);
    setTestSelections({});
    setTestDragSelections({});
  };

  if (currentIndex >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className='bg-white rounded-lg shadow-md p-6 sm:p-8'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4'>
          {testMode ? 'Test Complete!' : 'Quiz Complete!'}
        </h2>
        <div className='mb-6'>
          <div className='text-5xl sm:text-6xl font-bold text-center my-6 sm:my-8 text-blue-600'>
            {percentage}%
          </div>
          <p className='text-lg sm:text-xl text-center text-gray-700 mb-2'>
            You scored {score} out of {questions.length}
          </p>
          <div className='w-full bg-gray-200 rounded-full h-4 mt-4'>
            <div
              className='bg-blue-600 h-4 rounded-full transition-all duration-500'
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        {testMode && (
          <div className='mb-6 p-4 border border-gray-200 rounded-md bg-gray-50 max-h-[360px] overflow-y-auto'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3'>
              Answer Review
            </h3>
            <div className='space-y-4'>
              {questions.map((question, index) => {
                const key = question.progressKey || `${question.exam}-${question.id}`;
                const selectedAnswer = testSelections[key] || '(No answer)';
                const dragSelection = testDragSelections[key] || {};

                return (
                  <div key={key} className='p-3 border border-gray-200 rounded-md bg-white'>
                    <p className='text-sm font-semibold text-gray-700 mb-2 whitespace-pre-line'>
                      Q{index + 1}. {question.question}
                    </p>
                    {question.questionType === 'drag_drop' && question.dragDrop ? (
                      <div className='text-sm text-gray-700 space-y-1'>
                        <p className='font-medium text-gray-800'>Your mapping:</p>
                        {question.dragDrop.columnB.map((target) => {
                          const leftId = dragSelection[target.id];
                          const leftText = question.dragDrop?.columnA.find((item) => item.id === leftId)?.text;
                          return (
                            <p key={`your-${target.id}`} className='whitespace-pre-line'>
                              - {target.text}: {leftText || '(No match)'}
                            </p>
                          );
                        })}
                        <p className='font-medium text-gray-800 mt-2'>Correct mapping:</p>
                        {question.dragDrop.correctMatches.map((match) => {
                          const leftText = question.dragDrop?.columnA.find((item) => item.id === match.leftId)?.text;
                          const rightText = question.dragDrop?.columnB.find((item) => item.id === match.rightId)?.text;
                          return (
                            <p key={`correct-${match.leftId}-${match.rightId}`} className='whitespace-pre-line'>
                              - {rightText}: {leftText}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='text-sm text-gray-700 space-y-1'>
                        <p>Your answer: {selectedAnswer}</p>
                        <p className='font-medium text-gray-800'>Correct answer: {question.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={handleRestart}
            className='flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors'
          >
            Restart Quiz
          </button>
          <button
            onClick={onComplete}
            className='flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-md font-semibold hover:bg-gray-50 transition-colors'
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const isDragDropQuestion =
    current.questionType === "drag_drop" && !!current.dragDrop;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isMultiAnswer = !isDragDropQuestion && current.correctAnswer.length > 1;
  const requiredAnswers = isDragDropQuestion ? 0 : current.correctAnswer.length;

  const handleSelectAnswer = (letter: string) => {
    if (showResult) return;

    setSelectedAnswers((prev) => {
      // If already selected, deselect it
      if (prev.includes(letter)) {
        return prev.filter((a) => a !== letter);
      }

      // For multi-answer questions, add to selection if under limit
      if (!isDragDropQuestion && isMultiAnswer) {
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
    if (!isDragDropQuestion && selectedAnswers.length === 0) return;
    if (isDragDropQuestion && Object.keys(dragAssignments).length === 0) return;

    let isCorrect = false;
    if (isDragDropQuestion && current.dragDrop) {
      const expected = current.dragDrop.correctMatches;
      const hasAll = Object.keys(dragAssignments).length === expected.length;
      isCorrect =
        hasAll &&
        expected.every(
          (match) => dragAssignments[match.rightId] === match.leftId
        );

      if (testMode) {
        setTestDragSelections((prev) => ({
          ...prev,
          [current.progressKey || `${current.exam}-${current.id}`]: {
            ...dragAssignments,
          },
        }));
      }
    } else {
      const selectedSet = selectedAnswers.sort().join("");
      const correctSet = current.correctAnswer.split("").sort().join("");
      isCorrect = selectedSet === correctSet;

      if (testMode) {
        setTestSelections((prev) => ({
          ...prev,
          [current.progressKey || `${current.exam}-${current.id}`]:
            selectedSet || '(No answer)',
        }));
      }
    }

    onUpdateProgress(
      current.progressKey || `${current.exam}-${current.id}`,
      isCorrect
    );

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setDragAssignments({});
    setActiveDraggedItem(null);
    setShowResult(false);
    setCurrentIndex(currentIndex + 1);
  };

  const handleDragStart = (leftId: string) => {
    if (showResult) return;
    setActiveDraggedItem(leftId);
  };

  const handleDropOnRight = (rightId: string) => {
    if (showResult || !activeDraggedItem) return;
    setDragAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === activeDraggedItem) {
          delete next[key];
        }
      });
      next[rightId] = activeDraggedItem;
      return next;
    });
    setActiveDraggedItem(null);
  };

  const clearAssignment = (rightId: string) => {
    if (showResult) return;
    setDragAssignments((prev) => {
      const next = { ...prev };
      delete next[rightId];
      return next;
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center text-xs sm:text-sm text-gray-600'>
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>
          Score: {score}/{questions.length}
        </span>
      </div>

      <div className='bg-white rounded-lg shadow-md p-4 sm:p-8'>
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-4'>
            <h2 className='text-base sm:text-xl font-semibold text-gray-800 flex-1 whitespace-pre-line'>
              {current.question}
            </h2>
            <span className='text-xs sm:text-sm text-gray-500 sm:ml-4'>
              Topic {current.topic}
            </span>
          </div>

          {current.imageUrl && (
            <div className='mb-4 border-2 border-dashed border-gray-300 rounded-md min-h-36 flex items-center justify-center bg-gray-50 overflow-hidden'>
              <img
                src={current.imageUrl}
                alt={current.imageAlt || "Question visual"}
                className='max-h-72 w-full object-contain'
              />
            </div>
          )}

          {isMultiAnswer && !showResult && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <p className='text-sm text-blue-800'>
                ⓘ This question has <strong>{requiredAnswers}</strong> correct
                answers. Select {requiredAnswers} options. (
                {selectedAnswers.length}/{requiredAnswers} selected)
              </p>
            </div>
          )}

          {isDragDropQuestion && !showResult && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <p className='text-sm text-blue-800'>
                Drag one item from Column A into each matching row in Column B.
              </p>
            </div>
          )}
          {!isDragDropQuestion ? (
            <div className='space-y-3 mt-6'>
              {current.options.map((option) => {
                const isCorrectAnswer = current.correctAnswer.includes(
                  option.letter
                );
                const isSelected = selectedAnswers.includes(option.letter);
                let className =
                  "p-4 border-2 rounded-md cursor-pointer transition-all ";

                if (showResult) {
                  if (testMode) {
                    className += isSelected
                      ? 'border-blue-500 bg-blue-50 opacity-90'
                      : 'border-gray-200 bg-gray-50 opacity-70';
                  } else {
                    if (isCorrectAnswer) {
                      className += "border-green-500 bg-green-50";
                    } else if (isSelected) {
                      className += "border-red-500 bg-red-50";
                    } else {
                      className += "border-gray-200 bg-gray-50 opacity-60";
                    }
                  }
                } else if (isSelected) {
                  className += "border-blue-500 bg-blue-50";
                } else {
                  className +=
                    "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
                }

                return (
                  <div
                    key={option.letter}
                    onClick={() => handleSelectAnswer(option.letter)}
                    className={className}
                  >
                    <div className='flex items-center'>
                      <div className='flex items-center mr-3'>
                        {isMultiAnswer ? (
                          <div
                            className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center mr-2 ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-400"
                            }`}
                          >
                            {isSelected && (
                              <span className='text-white text-xs'>✓</span>
                            )}
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center mr-2 ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-400"
                            }`}
                          >
                            {isSelected && (
                              <div className='w-2 h-2 bg-white rounded-full'></div>
                            )}
                          </div>
                        )}
                        <span className='font-bold text-gray-700 min-w-[24px]'>
                          {option.letter}.
                        </span>
                      </div>
                      <span className='text-gray-800 flex-1 whitespace-pre-line'>
                        {option.text}
                      </span>
                      {showResult && isCorrectAnswer && (
                        <span className='ml-auto text-green-600 font-semibold'>
                          ✓ Correct
                        </span>
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <span className='ml-auto text-red-600 font-semibold'>
                          ✗ Wrong
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
              <div>
                <p className='text-sm font-semibold text-gray-700 mb-2'>
                  Column A
                </p>
                <div className='space-y-2'>
                  {current.dragDrop?.columnA.map((item) => {
                    const isUsed = Object.values(dragAssignments).includes(
                      item.id
                    );
                    return (
                      <div
                        key={item.id}
                        draggable={!showResult && !isUsed}
                        onDragStart={() => handleDragStart(item.id)}
                        className={`p-3 border rounded-md text-sm ${
                          isUsed
                            ? "bg-gray-100 text-gray-400 border-gray-200"
                            : "bg-white border-gray-300 cursor-grab"
                        }`}
                      >
                        <span className='whitespace-pre-line'>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className='text-sm font-semibold text-gray-700 mb-2'>
                  Column B
                </p>
                <div className='space-y-2'>
                  {current.dragDrop?.columnB.map((target) => {
                    const assignedLeftId = dragAssignments[target.id];
                    const assignedLeft = current.dragDrop?.columnA.find(
                      (item) => item.id === assignedLeftId
                    );
                    const correctLeftId = current.dragDrop?.correctMatches.find(
                      (match) => match.rightId === target.id
                    )?.leftId;
                    const isCorrectMatch =
                      !!assignedLeftId && assignedLeftId === correctLeftId;

                    return (
                      <div
                        key={target.id}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDropOnRight(target.id)}
                        className={`p-3 border-2 rounded-md ${
                          showResult
                            ? testMode
                              ? 'border-gray-300 bg-gray-50'
                              : isCorrectMatch
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            : "border-dashed border-gray-300 bg-gray-50"
                        }`}
                      >
                        <p className='text-xs text-gray-500 mb-1'>
                          {target.text}
                        </p>
                        {assignedLeft ? (
                          <div className='flex items-center justify-between gap-2'>
                            <span className='text-sm text-gray-800'>
                              {assignedLeft.text}
                            </span>
                            {!showResult && (
                              <button
                                onClick={() => clearAssignment(target.id)}
                                className='text-xs text-red-500 hover:text-red-700'
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className='text-sm text-gray-400'>Drop here</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={
              isDragDropQuestion
                ? Object.keys(dragAssignments).length === 0
                : selectedAnswers.length === 0 ||
                  (isMultiAnswer && selectedAnswers.length !== requiredAnswers)
            }
            className='w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            Submit Answer
            {isMultiAnswer && ` (${selectedAnswers.length}/${requiredAnswers})`}
            {isDragDropQuestion &&
              ` (${Object.keys(dragAssignments).length}/${
                current.dragDrop?.columnB.length || 0
              })`}
          </button>
        ) : (
          <div className='space-y-4'>
            {testMode ? (
              <div className='p-4 bg-blue-50 border border-blue-300 rounded-md'>
                <p className='font-semibold text-blue-800'>
                  Answer submitted. Correct answers will be shown after the test ends.
                </p>
              </div>
            ) : (
              (
                isDragDropQuestion
                  ? current.dragDrop?.correctMatches.every(
                      (match) => dragAssignments[match.rightId] === match.leftId
                    )
                  : selectedAnswers.sort().join("") ===
                    current.correctAnswer.split("").sort().join("")
              ) ? (
                <div className='p-4 bg-green-50 border border-green-500 rounded-md'>
                  <p className='font-semibold text-green-800'>
                    Correct! Great job!
                  </p>
                </div>
              ) : (
                <div className='p-4 bg-red-50 border border-red-500 rounded-md'>
                  <p className='font-semibold text-red-800'>
                    Incorrect.
                    {isDragDropQuestion
                      ? " Review the highlighted matches in Column B."
                      : ` The correct answer is ${current.correctAnswer}.`}
                  </p>
                </div>
              )
            )}
            <button
              onClick={handleNext}
              className='w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors'
            >
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
