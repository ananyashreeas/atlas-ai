"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getPDFs, PDFItem } from "@/app/lib/storage";
import PDFViewer from "@/components/PDFViewer";

type ChatMessage = {
  id: number;
  pdf_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Flashcard = {
  question: string;
  answer: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export default function PDFWorkspace() {
  const params = useParams();
  const id = Number(params.id);

  const [pdf, setPdf] = useState<PDFItem | null>(null);
  const [mounted, setMounted] = useState(false);

  // Chat
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Chat history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Summary
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] =
    useState(false);
  const [flashcardsError, setFlashcardsError] =
    useState("");
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Quiz
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [currentQuestion, setCurrentQuestion] =
    useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] =
    useState(false);

  // -----------------------------------------
  // Load PDF
  // -----------------------------------------

  useEffect(() => {
    setMounted(true);

    const storedPDFs = getPDFs();

    const foundPDF = storedPDFs.find(
      (item) => item.id === id
    );

    setPdf(foundPDF || null);
  }, [id]);

  // -----------------------------------------
  // Load chat history
  // -----------------------------------------

  useEffect(() => {
    if (!id) return;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);

        const response = await fetch(
          `/api/chat/history?pdfId=${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Failed to load chat history."
          );
        }

        setMessages(data.messages || []);
      } catch (error) {
        console.error(
          "HISTORY LOAD ERROR:",
          error
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [id]);

  // -----------------------------------------
  // Prevent hydration mismatch
  // -----------------------------------------

  if (!mounted) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">
          Loading PDF...
        </p>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">
          PDF Not Found
        </h1>

        <p className="text-slate-400 mt-3">
          The requested document doesn't exist.
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // Generate PDF Context
  // -----------------------------------------

  const getPDFContext = async (
    query: string
  ) => {
    const searchResponse = await fetch(
      "/api/search",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          query,
          question: query,
          pdfPath: pdf.path,
        }),
      }
    );

    const searchData =
      await searchResponse.json();

    if (
      !searchResponse.ok ||
      !searchData.success
    ) {
      throw new Error(
        searchData.error ||
          "Failed to retrieve PDF content."
      );
    }

    const chunks =
      searchData.chunks || [];

    if (chunks.length === 0) {
      throw new Error(
        "No relevant content was found in this PDF."
      );
    }

    return chunks
      .map(
        (chunk: any, index: number) =>
          `--- PDF CHUNK ${
            index + 1
          } ---\n${
            chunk.content || ""
          }`
      )
      .join("\n\n");
  };

  // -----------------------------------------
  // Generate Summary
  // -----------------------------------------

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError("");

    try {
      const context = await getPDFContext(
        "Find the main topics, important concepts, definitions, formulas, facts and key points from this PDF."
      );

      const response = await fetch(
        "/api/summary",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            context,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to generate summary."
        );
      }

      setSummary(data.summary);
    } catch (error: any) {
      console.error(
        "SUMMARY ERROR:",
        error
      );

      setSummaryError(
        error?.message ||
          "Something went wrong while generating the summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  // -----------------------------------------
  // Generate Flashcards
  // -----------------------------------------

  const generateFlashcards = async () => {
    setFlashcardsLoading(true);
    setFlashcardsError("");

    try {
      const context = await getPDFContext(
        "Find the most important concepts, definitions, formulas, facts and key points from this PDF for creating study flashcards."
      );

      const response = await fetch(
        "/api/flashcards",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            context,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to generate flashcards."
        );
      }

      setFlashcards(
        Array.isArray(data.flashcards)
          ? data.flashcards
          : []
      );

      setCurrentCard(0);
      setShowAnswer(false);
    } catch (error: any) {
      console.error(
        "FLASHCARD ERROR:",
        error
      );

      setFlashcardsError(
        error?.message ||
          "Something went wrong while generating flashcards."
      );
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // -----------------------------------------
  // Flashcard navigation
  // -----------------------------------------

  const nextCard = () => {
    if (
      currentCard <
      flashcards.length - 1
    ) {
      setCurrentCard(
        (previous) => previous + 1
      );
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(
        (previous) => previous - 1
      );
      setShowAnswer(false);
    }
  };

  // -----------------------------------------
  // Generate Quiz
  // -----------------------------------------

  const generateQuiz = async () => {
    setQuizLoading(true);
    setQuizError("");

    try {
      console.log(
        "========== GENERATE QUIZ =========="
      );

      const context = await getPDFContext(
        "Find the most important concepts, definitions, formulas, facts, relationships and key ideas from this PDF that can be used to create a study quiz."
      );

      const response = await fetch(
        "/api/quiz",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            context,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "QUIZ RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to generate quiz."
        );
      }

      if (
        !Array.isArray(data.quiz) ||
        data.quiz.length === 0
      ) {
        throw new Error(
          "No quiz questions were generated."
        );
      }

      setQuiz(data.quiz);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setQuizScore(0);
      setQuizFinished(false);
    } catch (error: any) {
      console.error(
        "QUIZ ERROR:",
        error
      );

      setQuizError(
        error?.message ||
          "Something went wrong while generating the quiz."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // -----------------------------------------
  // Quiz answer
  // -----------------------------------------

  const selectAnswer = (
    optionIndex: number
  ) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);

    if (
      optionIndex ===
      quiz[currentQuestion]
        .correctAnswer
    ) {
      setQuizScore(
        (previous) => previous + 1
      );
    }
  };

  // -----------------------------------------
  // Next quiz question
  // -----------------------------------------

  const nextQuizQuestion = () => {
    if (
      currentQuestion <
      quiz.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      );
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  // -----------------------------------------
  // Restart quiz
  // -----------------------------------------

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // -----------------------------------------
  // Ask Atlas
  // -----------------------------------------

  const askAtlas = async () => {
    if (!question.trim()) return;

    const currentQuestionText =
      question.trim();

    setLoading(true);
    setAnswer("");

    try {
      const context =
        await getPDFContext(
          currentQuestionText
        );

      const chatResponse = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question:
              currentQuestionText,
            context,
            pdfId: pdf.id,
          }),
        }
      );

      const chatData =
        await chatResponse.json();

      if (
        !chatResponse.ok ||
        !chatData.success
      ) {
        throw new Error(
          chatData.error ||
            "Gemini failed to answer."
        );
      }

      const userMessage: ChatMessage = {
        id: Date.now(),
        pdf_id: pdf.id,
        role: "user",
        content:
          currentQuestionText,
        created_at:
          new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        pdf_id: pdf.id,
        role: "assistant",
        content: chatData.answer,
        created_at:
          new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      setAnswer(chatData.answer);
      setQuestion("");
    } catch (error: any) {
      console.error(
        "ASK ATLAS ERROR:",
        error
      );

      setAnswer(
        error?.message ||
          "Something went wrong while asking Atlas."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Current quiz question
  // -----------------------------------------

  const activeQuizQuestion =
    quiz[currentQuestion];

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="space-y-8">

      {/* PDF HEADER */}
      <div>
        <h1 className="text-4xl font-bold">
          📄 {pdf.name}
        </h1>

        <p className="text-slate-400 mt-2">
          Uploaded on {pdf.uploadedAt}
        </p>
      </div>

      {/* PDF VIEWER */}
      <div>
        <PDFViewer path={pdf.path} />
      </div>

      {/* ASK ATLAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold">
          🤖 Ask Atlas
        </h2>

        <p className="text-slate-400 mt-2">
          Ask anything about this PDF.
        </p>

        {/* CHAT HISTORY */}
        <div className="mt-8 space-y-4 max-h-[600px] overflow-y-auto pr-2">

          {historyLoading && (
            <p className="text-slate-500 text-center py-6">
              Loading conversation...
            </p>
          )}

          {!historyLoading &&
            messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">
                  No conversation yet.
                </p>

                <p className="text-slate-600 text-sm mt-2">
                  Ask Atlas something about your PDF.
                </p>
              </div>
            )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.role === "user"
                    ? "bg-yellow-400 text-black"
                    : "bg-slate-950 border border-slate-700 text-slate-300"
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-2 ${
                    message.role === "user"
                      ? "text-black/60"
                      : "text-yellow-400"
                  }`}
                >
                  {message.role === "user"
                    ? "👤 You"
                    : "🤖 Atlas"}
                </p>

                <p className="whitespace-pre-wrap leading-7">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* INPUT */}
        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              askAtlas();
            }
          }}
          placeholder="Ask anything about this PDF..."
          rows={4}
          className="mt-6 w-full bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-yellow-400 resize-none"
        />

        <div className="flex items-center gap-4 mt-4">

          <button
            onClick={askAtlas}
            disabled={
              loading ||
              !question.trim()
            }
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Thinking..."
              : "Ask AI"}
          </button>

          <span className="text-sm text-slate-500">
            Enter to ask · Shift + Enter for new line
          </span>

        </div>

        {answer &&
          messages.length === 0 && (
            <div className="mt-8 bg-slate-950 border border-slate-700 rounded-xl p-6">

              <h3 className="text-lg font-bold">
                🧠 Atlas' Answer
              </h3>

              <p className="mt-4 text-slate-300 whitespace-pre-wrap leading-7">
                {answer}
              </p>

            </div>
          )}

      </div>

      {/* EXTRA FEATURES */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* SUMMARY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-xl font-bold">
              📋 Summary
            </h2>

            <button
              onClick={generateSummary}
              disabled={summaryLoading}
              className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summaryLoading
                ? "Generating..."
                : "Generate"}
            </button>

          </div>

          {summary ? (
            <div className="mt-5 text-slate-300 whitespace-pre-wrap leading-7">
              {summary}
            </div>
          ) : (
            <p className="mt-4 text-slate-400">
              Generate an AI-powered summary of this PDF.
            </p>
          )}

          {summaryError && (
            <p className="mt-4 text-red-400 text-sm">
              {summaryError}
            </p>
          )}

        </div>

        {/* FLASHCARDS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-xl font-bold">
              🧠 Flashcards
            </h2>

            <button
              onClick={generateFlashcards}
              disabled={flashcardsLoading}
              className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {flashcardsLoading
                ? "Generating..."
                : "Generate"}
            </button>

          </div>

          {flashcards.length > 0 ? (
            <div className="mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowAnswer(
                    (previous) =>
                      !previous
                  )
                }
                className="w-full text-left bg-slate-950 border border-slate-700 rounded-2xl p-6 min-h-[220px] hover:border-yellow-400 transition"
              >

                <p className="text-xs uppercase tracking-wider text-yellow-400 font-semibold">
                  {showAnswer
                    ? "Answer"
                    : "Question"}
                </p>

                <p className="mt-6 text-lg font-semibold leading-8 text-slate-200">
                  {showAnswer
                    ? flashcards[
                        currentCard
                      ]?.answer
                    : flashcards[
                        currentCard
                      ]?.question}
                </p>

                <p className="mt-8 text-sm text-slate-500">
                  Click the card to{" "}
                  {showAnswer
                    ? "see the question"
                    : "reveal the answer"}
                  .
                </p>

              </button>

              <div className="flex items-center justify-between mt-4">

                <button
                  onClick={previousCard}
                  disabled={
                    currentCard === 0
                  }
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-yellow-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <span className="text-sm text-slate-500">
                  {currentCard + 1} /{" "}
                  {flashcards.length}
                </span>

                <button
                  onClick={nextCard}
                  disabled={
                    currentCard ===
                    flashcards.length - 1
                  }
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-yellow-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>

              </div>

              <button
                onClick={() => {
                  setCurrentCard(0);
                  setShowAnswer(false);
                }}
                className="mt-4 w-full text-sm text-slate-500 hover:text-yellow-400 transition"
              >
                ↺ Restart flashcards
              </button>

            </div>
          ) : (
            <p className="mt-4 text-slate-400">
              Generate AI-powered flashcards from this PDF.
            </p>
          )}

          {flashcardsError && (
            <p className="mt-4 text-red-400 text-sm">
              {flashcardsError}
            </p>
          )}

        </div>

        {/* QUIZ GENERATOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-bold">
                ❓ Quiz Generator
              </h2>

              <p className="text-slate-400 mt-1">
                Test your understanding of this PDF.
              </p>
            </div>

            {!quiz.length ||
            quizFinished ? (
              <button
                onClick={
                  quizFinished
                    ? restartQuiz
                    : generateQuiz
                }
                disabled={quizLoading}
                className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quizLoading
                  ? "Generating..."
                  : quizFinished
                  ? "Restart Quiz"
                  : "Generate Quiz"}
              </button>
            ) : null}

          </div>

          {quizError && (
            <p className="mt-5 text-red-400 text-sm">
              {quizError}
            </p>
          )}

          {/* QUIZ IN PROGRESS */}
          {quiz.length > 0 &&
            !quizFinished &&
            activeQuizQuestion && (
              <div className="mt-6">

                {/* Progress */}
                <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                  <span>
                    Question{" "}
                    {currentQuestion + 1} of{" "}
                    {quiz.length}
                  </span>

                  <span>
                    Score: {quizScore}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{
                      width: `${
                        ((currentQuestion + 1) /
                          quiz.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                {/* Question */}
                <div className="mt-6 bg-slate-950 border border-slate-700 rounded-2xl p-6">

                  <h3 className="text-lg font-semibold leading-8">
                    {activeQuizQuestion.question}
                  </h3>

                  {/* Options */}
                  <div className="mt-6 space-y-3">

                    {activeQuizQuestion.options.map(
                      (
                        option,
                        index
                      ) => {
                        const isSelected =
                          selectedAnswer ===
                          index;

                        const isCorrect =
                          index ===
                          activeQuizQuestion.correctAnswer;

                        let optionClass =
                          "border-slate-700 hover:border-yellow-400";

                        if (
                          selectedAnswer !==
                          null
                        ) {
                          if (isCorrect) {
                            optionClass =
                              "border-green-500 bg-green-500/10";
                          } else if (
                            isSelected
                          ) {
                            optionClass =
                              "border-red-500 bg-red-500/10";
                          } else {
                            optionClass =
                              "border-slate-800 opacity-60";
                          }
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              selectAnswer(
                                index
                              )
                            }
                            disabled={
                              selectedAnswer !==
                              null
                            }
                            className={`w-full text-left border rounded-xl px-5 py-4 transition ${optionClass}`}
                          >
                            <span className="font-semibold mr-3">
                              {String.fromCharCode(
                                65 + index
                              )}
                              .
                            </span>

                            {option}
                          </button>
                        );
                      }
                    )}

                  </div>

                  {/* Explanation */}
                  {selectedAnswer !==
                    null && (
                    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-5">

                      <p
                        className={`font-semibold ${
                          selectedAnswer ===
                          activeQuizQuestion.correctAnswer
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {selectedAnswer ===
                        activeQuizQuestion.correctAnswer
                          ? "✅ Correct!"
                          : "❌ Not quite."}
                      </p>

                      <p className="mt-3 text-slate-300 leading-7">
                        {
                          activeQuizQuestion.explanation
                        }
                      </p>

                    </div>
                  )}

                  {/* Next */}
                  {selectedAnswer !==
                    null && (
                    <button
                      onClick={
                        nextQuizQuestion
                      }
                      className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
                    >
                      {currentQuestion ===
                      quiz.length - 1
                        ? "Finish Quiz"
                        : "Next Question →"}
                    </button>
                  )}

                </div>

              </div>
            )}

          {/* FINAL SCORE */}
          {quizFinished && (
            <div className="mt-6 bg-slate-950 border border-slate-700 rounded-2xl p-8 text-center">

              <div className="text-5xl">
                {quizScore >=
                quiz.length * 0.8
                  ? "🏆"
                  : quizScore >=
                    quiz.length * 0.5
                  ? "👏"
                  : "📚"}
              </div>

              <h3 className="text-2xl font-bold mt-4">
                Quiz Complete!
              </h3>

              <p className="text-slate-400 mt-2">
                You scored
              </p>

              <p className="text-4xl font-bold text-yellow-400 mt-2">
                {quizScore} /{" "}
                {quiz.length}
              </p>

              <p className="text-slate-400 mt-3">
                {Math.round(
                  (quizScore /
                    quiz.length) *
                    100
                )}
                %
              </p>

              <button
                onClick={restartQuiz}
                className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
              >
                🔄 Try Again
              </button>

            </div>
          )}

          {/* Empty state */}
          {quiz.length === 0 &&
            !quizLoading && (
              <div className="mt-6 border border-dashed border-slate-700 rounded-xl p-8 text-center">

                <p className="text-slate-500">
                  Your generated quiz will appear here.
                </p>

              </div>
            )}

          {quizLoading && (
            <div className="mt-6 border border-slate-700 rounded-xl p-8 text-center">

              <p className="text-yellow-400 font-semibold">
                🤖 Atlas is creating your quiz...
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Analyzing the PDF and preparing questions.
              </p>

            </div>
          )}

        </div>

        {/* MIND MAP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold">
            🗺️ Mind Map
          </h2>

          <p className="mt-4 text-slate-400">
            Mind map will appear here.
          </p>

        </div>

      </div>

    </div>
  );
}