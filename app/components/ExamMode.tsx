"use client";

import { useState } from "react";
import { Question } from "../types";

interface ExamModeProps {
  questions: Question[];
  onComplete: () => void;
}

type ExamAnswer = {
  mcq?: string;
  drag?: Record<string, string>;
};

export default function ExamMode({ questions, onComplete }: ExamModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [dragAssignments, setDragAssignments] = useState<
    Record<string, string>
  >({});
  const [activeDraggedItem, setActiveDraggedItem] = useState<string | null>(
    null
  );
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setDragAssignments({});
    setActiveDraggedItem(null);
    setSelectedLeftItem(null);
    setScore(0);
    setAnswers({});
    setResults({});
  };

  if (questions.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 text-center'>
        <p className='text-gray-600'>
          No questions available for the selected filter.
        </p>
      </div>
    );
  }

  if (currentIndex >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
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

        <div className='mb-6 p-4 border border-gray-200 rounded-md bg-gray-50 max-h-[420px] overflow-y-auto'>
          <h3 className='text-lg font-semibold text-gray-800 mb-3'>
            Answer Review
          </h3>
          <div className='space-y-4'>
            {questions.map((question, index) => {
              const key =
                question.progressKey || `${question.exam}-${question.id}`;
              const saved = answers[key];
              const isCorrect = results[key];

              return (
                <div
                  key={key}
                  className='p-3 border border-gray-200 rounded-md bg-white'
                >
                  <div className='flex items-start justify-between gap-3 mb-2'>
                    <p className='text-sm font-semibold text-gray-700 whitespace-pre-line flex-1'>
                      Q{index + 1}. {question.question}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  {question.questionType === "drag_drop" &&
                  question.dragDrop ? (
                    <div className='text-sm text-gray-700 space-y-1'>
                      <p className='font-medium text-gray-800'>Your mapping:</p>
                      {question.dragDrop.columnB.map((target) => {
                        const leftId = saved?.drag?.[target.id];
                        const leftText = question.dragDrop?.columnA.find(
                          (item) => item.id === leftId
                        )?.text;
                        return (
                          <p
                            key={`your-${target.id}`}
                            className='whitespace-pre-line'
                          >
                            - {target.text}: {leftText || "(No match)"}
                          </p>
                        );
                      })}
                      <p className='font-medium text-gray-800 mt-2'>
                        Correct mapping:
                      </p>
                      {question.dragDrop.correctMatches.map((match) => {
                        const leftText = question.dragDrop?.columnA.find(
                          (item) => item.id === match.leftId
                        )?.text;
                        const rightText = question.dragDrop?.columnB.find(
                          (item) => item.id === match.rightId
                        )?.text;
                        return (
                          <p
                            key={`correct-${match.leftId}-${match.rightId}`}
                            className='whitespace-pre-line'
                          >
                            - {rightText}: {leftText}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-sm text-gray-700 space-y-1'>
                      <p className='font-medium text-gray-800'>Options:</p>
                      <div className='space-y-1'>
                        {question.options.map((option) => {
                          const userSelected =
                            !!saved?.mcq && saved.mcq.includes(option.letter);
                          const isCorrectOption =
                            question.correctAnswer.includes(option.letter);

                          return (
                            <div
                              key={`${key}-${option.letter}`}
                              className={`p-2 rounded border text-sm whitespace-pre-line ${
                                isCorrectOption
                                  ? "border-green-300 bg-green-50"
                                  : userSelected
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              <span className='font-semibold mr-2'>
                                {option.letter}.
                              </span>
                              <span>{option.text}</span>
                              {userSelected && (
                                <span className='ml-2 text-blue-700 font-medium'>
                                  (Your choice)
                                </span>
                              )}
                              {isCorrectOption && (
                                <span className='ml-2 text-green-700 font-medium'>
                                  (Correct)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p>Your answer: {saved?.mcq || "(No answer)"}</p>
                      <p className='font-medium text-gray-800'>
                        Correct answer: {question.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={handleRestart}
            className='flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors'
          >
            Restart Exam
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
  const currentKey = current.progressKey || `${current.exam}-${current.id}`;

  const resetCurrentSelection = () => {
    setSelectedAnswers([]);
    setDragAssignments({});
    setActiveDraggedItem(null);
    setSelectedLeftItem(null);
  };

  const handleSelectAnswer = (letter: string) => {
    setSelectedAnswers((prev) => {
      if (prev.includes(letter)) {
        return prev.filter((a) => a !== letter);
      }

      if (!isDragDropQuestion && isMultiAnswer) {
        if (prev.length < requiredAnswers) return [...prev, letter];
        return prev;
      }

      return [letter];
    });
  };

  const handleDragStart = (leftId: string) => {
    setActiveDraggedItem(leftId);
    setSelectedLeftItem(leftId);
  };

  const handleSelectLeftItem = (leftId: string) => {
    const isUsed = Object.values(dragAssignments).includes(leftId);
    if (isUsed) return;
    setSelectedLeftItem((prev) => (prev === leftId ? null : leftId));
  };

  const handleDropOnRight = (rightId: string) => {
    const sourceLeftId = activeDraggedItem || selectedLeftItem;
    if (!sourceLeftId) return;
    setDragAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === sourceLeftId) {
          delete next[key];
        }
      });
      next[rightId] = sourceLeftId;
      return next;
    });
    setActiveDraggedItem(null);
    setSelectedLeftItem(null);
  };

  const clearAssignment = (rightId: string) => {
    setDragAssignments((prev) => {
      const next = { ...prev };
      delete next[rightId];
      return next;
    });
  };

  const handleSubmit = () => {
    let isCorrect = false;
    let savedAnswer: ExamAnswer = {};

    if (isDragDropQuestion && current.dragDrop) {
      const expected = current.dragDrop.correctMatches;
      const hasAll = Object.keys(dragAssignments).length === expected.length;
      isCorrect =
        hasAll &&
        expected.every(
          (match) => dragAssignments[match.rightId] === match.leftId
        );
      savedAnswer.drag = { ...dragAssignments };
    } else {
      const selectedSet = selectedAnswers.sort().join("");
      const correctSet = current.correctAnswer.split("").sort().join("");
      isCorrect = selectedSet === correctSet;
      savedAnswer.mcq = selectedSet || "(No answer)";
    }

    setAnswers((prev) => ({ ...prev, [currentKey]: savedAnswer }));
    setResults((prev) => ({ ...prev, [currentKey]: isCorrect }));
    if (isCorrect) setScore((prev) => prev + 1);

    if (isLastQuestion) {
      setCurrentIndex(questions.length);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    resetCurrentSelection();
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

          {isMultiAnswer && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <p className='text-sm text-blue-800'>
                ⓘ This question has <strong>{requiredAnswers}</strong> correct
                answers. Select {requiredAnswers} options. (
                {selectedAnswers.length}/{requiredAnswers} selected)
              </p>
            </div>
          )}

          {isDragDropQuestion && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
              <p className='text-sm text-blue-800'>
                Drag one item from Column A into each matching row in Column B.
                On mobile, tap an item in Column A, then tap a row in Column B.
              </p>
            </div>
          )}

          {!isDragDropQuestion ? (
            <div className='space-y-3 mt-6'>
              {current.options.map((option) => {
                const isSelected = selectedAnswers.includes(option.letter);
                let className =
                  "p-4 border-2 rounded-md cursor-pointer transition-all ";

                if (isSelected) {
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
                    const isSelected = selectedLeftItem === item.id;
                    return (
                      <div
                        key={item.id}
                        draggable={!isUsed}
                        onDragStart={() => handleDragStart(item.id)}
                        onClick={() => handleSelectLeftItem(item.id)}
                        className={`p-3 border rounded-md text-sm ${
                          isUsed
                            ? "bg-gray-100 text-gray-400 border-gray-200"
                            : isSelected
                            ? "bg-blue-50 border-blue-400 cursor-pointer"
                            : "bg-white border-gray-300 cursor-pointer md:cursor-grab"
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

                    return (
                      <div
                        key={target.id}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDropOnRight(target.id)}
                        onClick={() => handleDropOnRight(target.id)}
                        className='p-3 border-2 rounded-md border-dashed border-gray-300 bg-gray-50'
                      >
                        <p className='text-xs text-gray-500 mb-1 whitespace-pre-line'>
                          {target.text}
                        </p>
                        {assignedLeft ? (
                          <div className='flex items-center justify-between gap-2'>
                            <span className='text-sm text-gray-800 whitespace-pre-line'>
                              {assignedLeft.text}
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                clearAssignment(target.id);
                              }}
                              className='text-xs text-red-500 hover:text-red-700'
                            >
                              Clear
                            </button>
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
      </div>
    </div>
  );
}
