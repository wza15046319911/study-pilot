"use client";

import dynamic from "next/dynamic";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Question, Mistake } from "@/types/database";

// Register a Chinese-compatible font (using system fonts for now)
// For production, you'd want to add actual font files

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #135bec",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#135bec",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#135bec",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
  },
  questionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#135bec",
  },
  errorBadge: {
    fontSize: 10,
    color: "#ef4444",
    backgroundColor: "#fee2e2",
    padding: "2px 8px",
    borderRadius: 4,
  },
  questionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e293b",
  },
  questionContent: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 10,
  },
  codeBlock: {
    fontFamily: "Courier",
    fontSize: 9,
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  option: {
    fontSize: 10,
    marginBottom: 4,
    color: "#475569",
  },
  correctOption: {
    color: "#16a34a",
    fontWeight: "bold",
  },
  answerSection: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
    marginTop: 10,
  },
  answerLabel: {
    fontSize: 10,
    color: "#666",
  },
  correctAnswer: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#16a34a",
  },
  wrongAnswer: {
    fontSize: 11,
    color: "#ef4444",
  },
  explanation: {
    fontSize: 10,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
});

interface MistakeWithQuestion extends Mistake {
  questions: Question;
}

interface MistakesPDFProps {
  mistakes: MistakeWithQuestion[];
  username?: string;
}

export function MistakesPDF({ mistakes, username }: MistakesPDFProps) {
  const totalErrors = mistakes.reduce((acc, m) => acc + m.error_count, 0);
  const generatedDate = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mistake Book / 错题本</Text>
          <Text style={styles.subtitle}>
            Generated for {username || "User"} on {generatedDate}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mistakes.length}</Text>
            <Text style={styles.statLabel}>Total Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalErrors}</Text>
            <Text style={styles.statLabel}>Total Errors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {(totalErrors / mistakes.length).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Avg Errors/Question</Text>
          </View>
        </View>

        {/* Questions */}
        {mistakes.map((mistake, index) => {
          const question = mistake.questions;
          const options = question.options as
            | { label: string; content: string }[]
            | null;

          return (
            <View
              key={mistake.id}
              style={styles.questionContainer}
              wrap={false}
            >
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>#{index + 1}</Text>
                <Text style={styles.errorBadge}>
                  {mistake.error_count} error(s)
                </Text>
              </View>

              <Text style={styles.questionTitle}>{question.title}</Text>
              <Text style={styles.questionContent}>{question.content}</Text>

              {question.code_snippet && (
                <View style={styles.codeBlock}>
                  <Text>{question.code_snippet}</Text>
                </View>
              )}

              {options && options.length > 0 && (
                <View style={styles.optionsContainer}>
                  {options.map((opt) => {
                    const isCorrect = opt.label === question.answer;
                    return (
                      <Text
                        key={opt.label}
                        style={
                          isCorrect
                            ? [styles.option, styles.correctOption]
                            : styles.option
                        }
                      >
                        {opt.label}. {opt.content}
                        {isCorrect && " ✓"}
                      </Text>
                    );
                  })}
                </View>
              )}

              <View style={styles.answerSection}>
                <Text style={styles.answerLabel}>Correct Answer:</Text>
                <Text style={styles.correctAnswer}>{question.answer}</Text>
                {question.explanation && (
                  <Text style={styles.explanation}>{question.explanation}</Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          QuizMaster - Your Smart Practice Partner
        </Text>
      </Page>
    </Document>
  );
}
