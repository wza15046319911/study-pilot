import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Question, QuestionOption } from "@/types/database";

// Register fonts (optional, using default Helvetica for now to ensure compatibility)
// ideally we would register a custom font for unicode support if needed

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  metadata: {
    fontSize: 10,
    color: "#333",
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  questionContainer: {
    marginBottom: 20,
    breakInside: "avoid",
  },
  questionHeader: {
    flexDirection: "row",
    marginBottom: 5,
  },
  questionNumber: {
    fontWeight: "bold",
    marginRight: 5,
    width: 20,
  },
  questionText: {
    flex: 1,
    lineHeight: 1.5,
  },
  codeBlock: {
    fontFamily: "Courier",
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
  },
  optionsContainer: {
    marginLeft: 25,
    marginTop: 5,
  },
  option: {
    flexDirection: "row",
    marginBottom: 5,
  },
  optionLabel: {
    width: 20,
    fontWeight: "bold",
  },
  optionText: {
    flex: 1,
  },
  answerLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    height: 20,
    marginTop: 10,
    marginLeft: 25,
  },
  answerBox: {
    borderWidth: 1,
    borderColor: "#999",
    height: 100,
    marginTop: 10,
    marginLeft: 25,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
});

interface ExamPdfProps {
  title: string;
  examType: string;
  durationMinutes: number;
  questions: Question[];
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const ExamPdfDocument: React.FC<ExamPdfProps> = ({
  title,
  examType,
  durationMinutes,
  questions,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metadata}>
          <Text>Type: {examType?.toUpperCase()}</Text>
          <Text>Duration: {formatTime(durationMinutes)}</Text>
          <Text>Questions: {questions.length}</Text>
        </View>
      </View>

      {/* Questions */}
      {questions.map((q, index) => {
        const options = q.options as unknown as QuestionOption[] | null;

        return (
          <View key={q.id} style={styles.questionContainer} wrap={false}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <Text style={styles.questionText}>{q.content}</Text>
            </View>

            {q.code_snippet && (
              <View style={styles.codeBlock}>
                <Text>{q.code_snippet}</Text>
              </View>
            )}

            {/* Options */}
            {options && Array.isArray(options) && options.length > 0 ? (
              <View style={styles.optionsContainer}>
                {options.map((opt, i) => (
                  <View key={i} style={styles.option}>
                    <Text style={styles.optionLabel}>
                      {String.fromCharCode(97 + i)}.
                    </Text>
                    <Text style={styles.optionText}>{opt.content}</Text>
                  </View>
                ))}
              </View>
            ) : // Answer spaces
            q.type === "fill_blank" || q.type === "code_output" ? (
              <View style={styles.answerLine} />
            ) : (
              <View style={styles.answerBox} />
            )}
          </View>
        );
      })}

      {/* Footer */}
      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages} - StudyPilot Mock Exam`
        }
        fixed
      />
    </Page>
  </Document>
);
