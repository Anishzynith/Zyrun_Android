import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { getAnswerValue } from '../../../service/questionnaire/questionnaireService';
import { Feather, Ionicons } from '@expo/vector-icons';

interface RunningDay {
  day: string;
  dayIndex: number;
  selected: boolean;
  isLongRun: boolean;
}

const DAYS_OF_WEEK = [
  { day: 'Sun', index: 0 },
  { day: 'Mon', index: 1 },
  { day: 'Tue', index: 2 },
  { day: 'Wed', index: 3 },
  { day: 'Thu', index: 4 },
  { day: 'Fri', index: 5 },
  { day: 'Sat', index: 6 },
];

// Workout type configurations
const WORKOUT_TYPES = {
  easy: { label: 'Easy Run', intensity: 'Easy', color: '#34C759', icon: '😊' },
  intervals: { label: 'Intervals', intensity: 'Hard', color: '#FF3B30', icon: '⚡' },
  recovery: { label: 'Recovery', intensity: 'Easy', color: '#8E8E93', icon: '🔄' },
  tempo: { label: 'Tempo Run', intensity: 'Medium', color: '#FF9500', icon: '🏃' },
  long: { label: 'Long Run', intensity: 'Medium', color: '#34C759', icon: '⭐' },
};

// 5K Training Plan - Full 4 Week Program
const FIVE_K_PLAN = {
  week1: [
    { day: 'Mon', workout: 'Easy Run', distance: '3 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Tue', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Wed', workout: 'Easy Run', distance: '3 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Thu', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Fri', workout: 'Easy Run', distance: '3 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Sat', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Sun', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
  ],
  week2: [
    { day: 'Mon', workout: 'Easy Run', distance: '4 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Tue', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Wed', workout: 'Easy Run', distance: '4 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Thu', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Fri', workout: 'Easy Run', distance: '4 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Sat', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Sun', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
  ],
  week3: [
    { day: 'Mon', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Tue', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Wed', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Thu', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Fri', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Sat', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Sun', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
  ],
  week4: [
    { day: 'Mon', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Tue', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Wed', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Thu', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Fri', workout: 'Easy Run', distance: '5 km', intensity: 'Easy' as const, icon: '😊', color: '#34C759' },
    { day: 'Sat', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
    { day: 'Sun', workout: 'Rest', distance: 'Rest', intensity: 'Easy' as const, icon: '🧘', color: '#8E8E93' },
  ],
};

export default function CalendarScreen() {
  const params = useLocalSearchParams();
  const { answers } = useQuestionnaire();
  const [loading, setLoading] = useState(false);
  const [userDays, setUserDays] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<RunningDay[]>(
    DAYS_OF_WEEK.map(d => ({
      day: d.day,
      dayIndex: d.index,
      selected: false,
      isLongRun: false,
    }))
  );
  const [isFiveKPlan, setIsFiveKPlan] = useState<boolean>(false);
  const [isBeginner, setIsBeginner] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // ✅ FIX: Use useRef to prevent infinite loop
  const hasInitialized = useRef(false);

  // ✅ FIX: Properly handle initialization with ref
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log("===== Calendar Initialization =====");
    console.log("Params:", params);
    console.log("Answers:", answers.map(a => ({ id: a.questionId, value: a.value })));

    // Check if user is a beginner (came from q1 = "no")
    const beginnerParam = params.isBeginner === 'true';
    setIsBeginner(beginnerParam);

    const q1Answer = getAnswerValue(answers, 'q1');
    const daysValue = getAnswerValue(answers, 'q8');

    console.log("q1Answer:", q1Answer);
    console.log("daysValue:", daysValue);
    console.log("beginnerParam:", beginnerParam);

    // If user is beginner OR q1 is "no", force 5K plan
    if (beginnerParam || q1Answer === 'no') {
      setIsFiveKPlan(true);
      setUserDays(3);
      // Pre-select default days for beginners (Mon, Wed, Fri)
      const defaultDays = [1, 3, 5];
      const updated = DAYS_OF_WEEK.map((d, index) => ({
        day: d.day,
        dayIndex: d.index,
        selected: defaultDays.includes(index),
        isLongRun: index === 5,
      }));
      setSelectedDays(updated);
      setIsInitialized(true);
      return;
    }

    // For non-beginners, use q8 value
    if (daysValue) {
      const dayMapping: { [key: string]: number } = {
        '1-2': 2,
        '3-4': 4,
        '5-6': 6,
        '7': 7,
      };
      const days = dayMapping[daysValue] || 3;
      setUserDays(days);
      setIsFiveKPlan(days <= 2);
    }

    setIsInitialized(true);
  }, []); // ✅ Empty dependency array - runs only once

  const toggleDay = (index: number) => {
    const currentSelected = getSelectedCount();
    const day = selectedDays[index];
    
    if (!day.selected) {
      if (currentSelected >= userDays) {
        Alert.alert(
          'Select the appropriate days for a weekly run',
          `You can select up to ${userDays} days. Please choose exactly ${userDays} days.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    const updated = [...selectedDays];
    updated[index].selected = !updated[index].selected;
    if (!updated[index].selected) {
      updated[index].isLongRun = false;
    }
    setSelectedDays(updated);
  };

  const setLongRun = (index: number) => {
    const updated = selectedDays.map((day, i) => ({
      ...day,
      isLongRun: i === index && day.selected,
    }));
    setSelectedDays(updated);
  };

  const getSelectedCount = () => {
    return selectedDays.filter(d => d.selected).length;
  };

  const getWorkoutForDay = (dayIndex: number) => {
    const day = selectedDays[dayIndex];
    if (!day.selected) return null;
    
    const workoutTypes = ['easy', 'intervals', 'recovery', 'tempo', 'easy', 'recovery', 'long'];
    const type = workoutTypes[dayIndex % workoutTypes.length] as keyof typeof WORKOUT_TYPES;
    return WORKOUT_TYPES[type];
  };

  const generateRunningPlan = () => {
    const selectedCount = getSelectedCount();
   
    if (selectedCount === 0) {
      Alert.alert('Error', 'Please select at least one day to run');
      return;
    }

    if (selectedCount !== userDays) {
      Alert.alert(
        'Select the appropriate days for a weekly run',
        `You specified ${userDays} days per week. Please select exactly ${userDays} days.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const hasLongRun = selectedDays.some(d => d.isLongRun);
    if (!hasLongRun) {
      Alert.alert('Error', 'Please select a day for your long run');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: './training-plan',
        params: {
          selectedDays: JSON.stringify(selectedDays),
          userDays: userDays.toString(),
          isFiveKPlan: isFiveKPlan.toString(),
          isBeginner: isBeginner.toString(),
        },
      });
    }, 500);
  };

  const renderDayCard = (day: RunningDay, index: number) => {
    const workout = getWorkoutForDay(index);
    const isSelected = day.selected;
    const isLongRunDay = day.isLongRun;

    return (
      <TouchableOpacity
        key={day.day}
        style={[
          styles.dayCard,
          isSelected && styles.dayCardSelected,
          isLongRunDay && styles.dayCardLongRun,
        ]}
        onPress={() => toggleDay(index)}
        activeOpacity={0.7}
      >
        <View style={styles.dayCardContent}>
          <View style={styles.dayLeft}>
            <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
              {day.day}
            </Text>
            {isSelected && workout && (
              <View style={[styles.workoutBadge, { backgroundColor: workout.color }]}>
                <Text style={styles.workoutBadgeText}>
                  {workout.icon} {workout.label}
                </Text>
              </View>
            )}
            {isLongRunDay && (
              <View style={styles.longRunBadge}>
                <Text style={styles.longRunBadgeText}>⭐ Long Run</Text>
              </View>
            )}
          </View>

          <View style={styles.dayRight}>
            {isSelected && (
              <View style={styles.intensityContainer}>
                <Text style={[styles.intensityText, { color: workout?.color }]}>
                  {workout?.intensity || 'Easy'}
                </Text>
              </View>
            )}
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <Feather name="check" size={14} color="#1A1A1A" />}
            </View>
          </View>
        </View>

        {isSelected && (
          <TouchableOpacity
            style={[styles.longRunToggle, isLongRunDay && styles.longRunToggleActive]}
            onPress={() => setLongRun(index)}
          >
            <Text style={[styles.longRunToggleText, isLongRunDay && styles.longRunToggleTextActive]}>
              {isLongRunDay ? '⭐ Long Run' : 'Set as Long Run'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Loading state
  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>🏃 Your Running Plan</Text>
              <Text style={styles.headerTitle}>Select Your Running Days</Text>
            </View>
            <TouchableOpacity style={styles.aiBadge}>
              <Ionicons name="sparkles" size={16} color="#1A1A1A" />
              <Text style={styles.aiBadgeText}>AI Coach</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{userDays}</Text>
              <Text style={styles.headerStatLabel}>Days/Week</Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{getSelectedCount()}</Text>
              <Text style={styles.headerStatLabel}>Selected</Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatValue, { color: isFiveKPlan ? '#FF9500' : '#34C759' }]}>
                {isFiveKPlan ? '5K Plan' : 'Custom'}
              </Text>
              <Text style={styles.headerStatLabel}>Plan Type</Text>
            </View>
          </View>

          {isBeginner && (
            <View style={styles.beginnerBanner}>
              <Text style={styles.beginnerBannerText}>
                🎯 Welcome! You're starting with a beginner 5K plan. Build up gradually!
              </Text>
            </View>
          )}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {selectedDays.map((day, index) => renderDayCard(day, index))}
        </View>

        {/* Summary Footer */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerDays}>
              {getSelectedCount()} of {userDays} days selected
            </Text>
            {selectedDays.some(d => d.isLongRun) && (
              <Text style={styles.footerLongRun}>⭐ Long Run set</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              (getSelectedCount() !== userDays || !selectedDays.some(d => d.isLongRun)) && styles.buttonDisabled,
            ]}
            onPress={generateRunningPlan}
            disabled={getSelectedCount() !== userDays || loading || !selectedDays.some(d => d.isLongRun)}
          >
            {loading ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  aiBadgeText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '600',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  headerDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  beginnerBanner: {
    marginTop: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  beginnerBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  daysGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dayCardSelected: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF0',
  },
  dayCardLongRun: {
    borderColor: '#34C759',
    backgroundColor: '#E8F5E9',
  },
  dayCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dayNameSelected: {
    color: '#34C759',
  },
  workoutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  workoutBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  longRunBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: '#34C759',
    alignSelf: 'flex-start',
  },
  longRunBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intensityContainer: {
    alignItems: 'center',
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  longRunToggle: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F1F6',
    alignSelf: 'flex-start',
  },
  longRunToggleActive: {
    backgroundColor: '#34C759',
  },
  longRunToggleText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  longRunToggleTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerDays: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  footerLongRun: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});