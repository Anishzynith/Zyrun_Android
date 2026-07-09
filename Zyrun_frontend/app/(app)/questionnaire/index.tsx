import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import { useQuestionnaire } from "../../../contexts/QuestionnaireContext";
import { router } from "expo-router";
import SingleChoice from "./QuestionTypes/SingleChoice";
 
export default function QuestionnaireScreen() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    isLoading,
    error,
    isComplete,
    answerQuestion,
    goToNext,
    goToPrevious,
    submitAnswers,
    progress,
    loadQuestions,
    setCurrentQuestionIndex,
  } = useQuestionnaire();
 
  const [calculatedPace, setCalculatedPace] = useState("");
 
  useEffect(() => {
    console.log("===== DEBUG: Current State =====");
    console.log("Current Question ID:", questions[currentQuestionIndex]?.id);
    console.log("Current Question Index:", currentQuestionIndex);
    console.log("All Questions:", questions.map(q => q.id));
    console.log("Answers:", answers.map(a => ({ id: a.questionId, value: a.value })));
    console.log("================================");
   
    // Check if q1 is answered with "no" and auto-submit
    const q1Answer = answers.find((a) => a.questionId === "q1");
    if (q1Answer?.value === "no") {
      console.log("User selected 'No' to running before. Auto-submitting...");
      handleAutoSubmit();
    }
  }, [answers, currentQuestionIndex]);
 
  // Calculate pace when q2 and q3 are answered
  useEffect(() => {
    const distanceAnswer = answers.find((a) => a.questionId === "q2");
    const timeAnswer = answers.find((a) => a.questionId === "q3");
   
    console.log("Pace Calculation - Distance:", distanceAnswer?.value, "Time:", timeAnswer?.value);
   
    if (distanceAnswer?.value && timeAnswer?.value) {
      const dist = parseFloat(distanceAnswer.value);
      const timeInMinutes = parseFloat(timeAnswer.value);
     
      if (dist > 0 && timeInMinutes > 0) {
        const pace = timeInMinutes / dist;
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        const paceString = `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
        setCalculatedPace(paceString);
        console.log("Pace calculated:", paceString);
      } else {
        setCalculatedPace("");
      }
    } else {
      setCalculatedPace("");
    }
  }, [answers]);
 
  const currentQuestion = questions[currentQuestionIndex];
 
  const getVisibleQuestionIds = () => {
    const q1Answer = answers.find((a) => a.questionId === "q1")?.value;
 
    if (q1Answer !== "yes") {
      return ["q1"];
    }
 
    const q4Answer = answers.find((a) => a.questionId === "q4")?.value;
    const baseFlow = ["q1", "q2", "q3", "q4"];
 
    if (q4Answer === "yes") {
      return [...baseFlow, "q5", "q6", "q7", "q8"];
    }
 
    return [...baseFlow, "q8"];
  };
 
  const getVisibleQuestions = () => {
    const visibleQuestionIds = getVisibleQuestionIds();
    return questions.filter((q) => visibleQuestionIds.includes(q.id));
  };
 
  const moveToQuestionById = (questionId: string) => {
    const targetIndex = questions.findIndex((q) => q.id === questionId);
    if (targetIndex >= 0) {
      setCurrentQuestionIndex(targetIndex);
    }
  };
 
  const moveToNextVisibleQuestion = () => {
    const visibleQuestionIds = getVisibleQuestionIds();
    const currentVisibleIndex = visibleQuestionIds.indexOf(currentQuestion?.id || "");
 
    if (currentVisibleIndex >= 0 && currentVisibleIndex < visibleQuestionIds.length - 1) {
      moveToQuestionById(visibleQuestionIds[currentVisibleIndex + 1]);
      return true;
    }
 
    return false;
  };
 
  const moveToPreviousVisibleQuestion = () => {
    const visibleQuestionIds = getVisibleQuestionIds();
    const currentVisibleIndex = visibleQuestionIds.indexOf(currentQuestion?.id || "");
 
    if (currentVisibleIndex > 0) {
      moveToQuestionById(visibleQuestionIds[currentVisibleIndex - 1]);
      return true;
    }
 
    return false;
  };
 
  const hasMeaningfulAnswer = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };
 
  const getStoredAnswer = (questionId?: string) => {
    if (!questionId) return undefined;
    return answers.find((a) => a.questionId === questionId)?.value;
  };
 
  const hasAnsweredQuestion = (questionId?: string) => {
    return hasMeaningfulAnswer(getStoredAnswer(questionId));
  };
 
  // Auto-submit when "No" is selected for q1
  const handleAutoSubmit = async () => {
    try {
      Alert.alert(
        "Thank You!",
        "You've selected that you haven't run before. We've submitted your response.",
        [
          {
            text: "Continue",
            onPress: async () => {
              try {
                await submitAnswers();
                router.replace("/(app)/calender");
              } catch (error) {
                Alert.alert("Error", "Failed to submit. Please try again.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Auto-submit error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
 
  // Check if we're on the running stats page (Step 1)
  const isRunningStatsPage = () => {
    const currentId = currentQuestion?.id;
    return currentId === "q2" || currentId === "q3";
  };
 
  // Check if we're on the event registration page (Step 2 - q4 only)
  const isEventRegistrationPage = () => {
    return currentQuestion?.id === "q4";
  };
 
  // Check if we're on the event details page (Step 2 - q5, q6, q7)
  const isEventDetailsPage = () => {
    return currentQuestion?.id === "q5" || currentQuestion?.id === "q6" || currentQuestion?.id === "q7";
  };
 
  // Check if we're on the final page (q8)
  const isFinalPage = () => {
    return currentQuestion?.id === "q8";
  };
 
  // Check if running stats are complete (both q2 and q3 answered)
  const areRunningStatsComplete = () => {
    const q2Answer = answers.find((a) => a.questionId === "q2");
    const q3Answer = answers.find((a) => a.questionId === "q3");
    return q2Answer?.value && q3Answer?.value && calculatedPace;
  };
 
  const handleNext = () => {
    console.log("===== HANDLE NEXT CALLED =====");
    console.log("Current Question ID:", currentQuestion?.id);
    console.log("Current Answers:", answers.map(a => ({ id: a.questionId, value: a.value })));
   
    // Check if q1 is answered
    const q1Answer = answers.find((a) => a.questionId === "q1");
   
    // If q1 is "no", auto-submit should handle it
    if (q1Answer?.value === "no") {
      console.log("q1 is 'no', returning");
      return;
    }
 
    if (isEventRegistrationPage()) {
      const q4Answer = answers.find((a) => a.questionId === "q4");
 
      if (!q4Answer?.value) {
        Alert.alert(
          "Incomplete",
          "Please answer if you have registered for any event.",
          [{ text: "OK" }]
        );
        return;
      }
 
      if (q4Answer.value === "no") {
        moveToQuestionById("q8");
        return;
      }
 
      moveToQuestionById("q5");
      return;
    }
 
    if (isFinalPage()) {
      handleSubmit();
      return;
    }
 
    if (currentQuestion?.isRequired && !hasAnsweredQuestion(currentQuestion?.id)) {
      Alert.alert(
        "Incomplete",
        "Please answer this question before proceeding.",
        [{ text: "OK" }]
      );
      return;
    }
 
    if (!moveToNextVisibleQuestion()) {
      handleSubmit();
    }
  };
 
  const handleSubmit = async () => {
    const visibleQuestions = getVisibleQuestions();
    const unansweredRequired = visibleQuestions.filter(
      (q) => q.isRequired && !hasAnsweredQuestion(q.id)
    );
 
    console.log("Visible Questions:", visibleQuestions.map((q) => q.id));
    console.log("Unanswered Required:", unansweredRequired.map((q) => q.id));
 
    if (unansweredRequired.length > 0) {
      Alert.alert(
        "Incomplete",
        `Please answer all required questions. (${unansweredRequired.length} remaining)`,
        [{ text: "OK" }]
      );
      return;
    }
 
    Alert.alert(
      "Submit Answers",
      "Are you sure you want to submit your answers?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              await submitAnswers();
              Alert.alert(
                "Success",
                "Your answers have been submitted successfully!",
                // ✅ FIX: Navigate to calendar instead of dashboard
                [{ text: "OK", onPress: () => router.replace("/(app)/calender") }]
              );
            } catch (error) {
              Alert.alert("Error", "Failed to submit answers. Please try again.");
            }
          },
        },
      ]
    );
  };
 
  // Render running stats page (q2 and q3 together)
  const renderRunningStatsPage = () => {
    const q2Answer = answers.find((a) => a.questionId === "q2");
    const q3Answer = answers.find((a) => a.questionId === "q3");
    const isComplete = q2Answer?.value && q3Answer?.value && calculatedPace;
 
    return (
      <View style={styles.singleQuestionContainer}>
        <View style={styles.header}>
          <Text style={styles.questionNumber}>
            Step 1 of 3: Running Activity
          </Text>
          <Text style={styles.required}>* Required</Text>
        </View>
 
        <Text style={styles.pageTitle}>Recent Running Activity (Last 3 Months)</Text>
 
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recent long run distance (in km)</Text>
          <RNTextInput
            style={styles.input}
            value={q2Answer?.value || ""}
            onChangeText={(value: string) => answerQuestion("q2", value)}
            placeholder="Enter distance in km (e.g., 5, 10, 21)"
            keyboardType="numeric"
          />
        </View>
 
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recent long run time (in minutes)</Text>
          <RNTextInput
            style={styles.input}
            value={q3Answer?.value || ""}
            onChangeText={(value: string) => answerQuestion("q3", value)}
            placeholder="Enter time in minutes (e.g., 30, 45, 60)"
            keyboardType="numeric"
          />
        </View>
 
        {calculatedPace ? (
          <View style={styles.paceContainer}>
            <Text style={styles.paceLabel}>Your Calculated Pace:</Text>
            <View style={styles.paceDisplay}>
              <Text style={styles.paceText}>{calculatedPace}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.paceContainerEmpty}>
            <Text style={styles.paceEmptyText}>
              Enter distance and time to calculate your pace
            </Text>
          </View>
        )}
 
        {isComplete && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Running data complete! Click Next to continue.</Text>
          </View>
        )}
      </View>
    );
  };
 
  // Render event registration page (q4, q5, q6, q7 together)
  const renderEventRegistrationPage = () => {
    const q4Answer = answers.find((a) => a.questionId === "q4");
    const q5Answer = answers.find((a) => a.questionId === "q5");
    const q6Answer = answers.find((a) => a.questionId === "q6");
    const q7Answer = answers.find((a) => a.questionId === "q7");
    const isEventRegistered = q4Answer?.value === "yes";
 
    return (
      <View style={styles.singleQuestionContainer}>
        <View style={styles.header}>
          <Text style={styles.questionNumber}>
            Step 2 of 3: Event Registration
          </Text>
          <Text style={styles.required}>* Required</Text>
        </View>
 
        <Text style={styles.pageTitle}>Event Registration Details</Text>
 
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Have you registered for any event?</Text>
          <SingleChoice
            options={[
              { id: "opt1", label: "Yes", value: "yes" },
              { id: "opt2", label: "No", value: "no" }
            ]}
            selectedValue={q4Answer?.value}
            onSelect={(value: string) => {
              console.log("q4 selected:", value);
              answerQuestion("q4", value);
              // If "No", clear event details and navigate to q8
              if (value === "no") {
                answerQuestion("q5", "");
                answerQuestion("q6", "");
                answerQuestion("q7", "");
               
                setTimeout(() => {
                  const q8Index = questions.findIndex((q) => q.id === "q8");
                  if (q8Index >= 0) {
                    console.log("Skipping to q8 after selecting No");
                    setCurrentQuestionIndex(q8Index);
                  }
                }, 300);
              } else {
                // If "Yes", navigate to q5
                const q5Index = questions.findIndex((q) => q.id === "q5");
                if (q5Index >= 0) {
                  setTimeout(() => {
                    console.log("Moving to q5 after selecting Yes");
                    setCurrentQuestionIndex(q5Index);
                  }, 300);
                }
              }
            }}
          />
        </View>
 
        {isEventRegistered && (
          <>
            <View style={styles.divider} />
 
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Name</Text>
              <RNTextInput
                style={styles.input}
                value={q5Answer?.value || ""}
                onChangeText={(value: string) => answerQuestion("q5", value)}
                placeholder="Enter the event name (e.g., City Marathon)"
              />
            </View>
 
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Distance (in km)</Text>
              <RNTextInput
                style={styles.input}
                value={q6Answer?.value || ""}
                onChangeText={(value: string) => answerQuestion("q6", value)}
                placeholder="Enter event distance in km"
                keyboardType="numeric"
              />
            </View>
 
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Time (in minutes)</Text>
              <RNTextInput
                style={styles.input}
                value={q7Answer?.value || ""}
                onChangeText={(value: string) => answerQuestion("q7", value)}
                placeholder="Enter target time in minutes"
                keyboardType="numeric"
              />
            </View>
          </>
        )}
 
        {!isEventRegistered && q4Answer?.value === "no" && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              You haven't registered for any event. Click Next to continue.
            </Text>
          </View>
        )}
      </View>
    );
  };
 
  // Render final page (q8)
  const renderFinalPage = () => {
    const q8Answer = answers.find((a) => a.questionId === "q8");
 
    return (
      <View style={styles.singleQuestionContainer}>
        <View style={styles.header}>
          <Text style={styles.questionNumber}>
            Step 3 of 3: Running Schedule
          </Text>
          <Text style={styles.required}>* Required</Text>
        </View>
 
        <Text style={styles.pageTitle}>How many days per week do you plan to run?</Text>
 
        <View style={styles.inputGroup}>
          <SingleChoice
            options={[
              { id: "opt1", label: "1-2 days", value: "1-2" },
              { id: "opt2", label: "3-4 days", value: "3-4" },
              { id: "opt3", label: "5-6 days", value: "5-6" },
              { id: "opt4", label: "7 days", value: "7" }
            ]}
            selectedValue={q8Answer?.value}
            onSelect={(value: string) => answerQuestion("q8", value)}
          />
        </View>
      </View>
    );
  };
 
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }
 
  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadQuestions}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  // Complete state
  if (isComplete) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.completeText}>✓ Questionnaire Complete!</Text>
        <Text style={styles.completeSubtext}>
          Thank you for completing the questionnaire.
        </Text>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.replace("/(app)/calender")}
        >
          <Text style={styles.dashboardButtonText}>Go to Calendar</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  // No questions state
  if (!questions.length || !currentQuestion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No questions available</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadQuestions}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  // Determine which page to render
  const renderPage = () => {
    if (isRunningStatsPage()) {
      return renderRunningStatsPage();
    } else if (isEventRegistrationPage() || isEventDetailsPage()) {
      return renderEventRegistrationPage();
    } else if (isFinalPage()) {
      return renderFinalPage();
    } else {
      return (
        <View style={styles.singleQuestionContainer}>
          <View style={styles.header}>
            <Text style={styles.questionNumber}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            {currentQuestion.isRequired && (
              <Text style={styles.required}>* Required</Text>
            )}
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
         
          {currentQuestion.type === "single" && (
            <SingleChoice
              options={currentQuestion.options || []}
              selectedValue={answers.find((a) => a.questionId === currentQuestion.id)?.value}
              onSelect={(value: string) => answerQuestion(currentQuestion.id, value)}
            />
          )}
        </View>
      );
    }
  };
 
  // Get page info for progress
  const getPageInfo = () => {
    if (isRunningStatsPage()) return { current: 1, total: 3, label: "Running Activity" };
    if (isEventRegistrationPage() || isEventDetailsPage()) return { current: 2, total: 3, label: "Event Registration" };
    if (isFinalPage()) return { current: 3, total: 3, label: "Running Schedule" };
    return { current: 1, total: 3, label: "Questionnaire" };
  };
 
  const pageInfo = getPageInfo();
 
  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressHeaderText}>
          Step {pageInfo.current} of {pageInfo.total}: {pageInfo.label}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(pageInfo.current / pageInfo.total) * 100}%` }]} />
        </View>
      </View>
 
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderPage()}
      </ScrollView>
 
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.prevButton]}
          onPress={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text
            style={[
              styles.buttonText,
              currentQuestionIndex === 0 && styles.disabledText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
 
        {isFinalPage() ? (
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  completeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  dashboardButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#007AFF",
    borderRadius: 10,
  },
  dashboardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  progressHeaderText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: "#f0f0f0",
  },
  nextButton: {
    backgroundColor: "#007AFF",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  disabledText: {
    color: "#999",
  },
  singleQuestionContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: "#666",
  },
  required: {
    fontSize: 14,
    color: "#ff4444",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  paceContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4A90D9",
  },
  paceContainerEmpty: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paceLabel: {
    fontSize: 14,
    color: "#4A90D9",
    fontWeight: "500",
    marginBottom: 4,
  },
  paceDisplay: {
    padding: 8,
    backgroundColor: "#e6f3ff",
    borderRadius: 4,
  },
  paceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  paceEmptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  hintContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  hintText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
  },
  successContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#d4edda",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#28a745",
  },
  successText: {
    fontSize: 14,
    color: "#155724",
    textAlign: "center",
    fontWeight: "500",
  },
});
 