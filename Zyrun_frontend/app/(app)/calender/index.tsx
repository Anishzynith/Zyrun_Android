import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { getAnswerValue } from '../../../service/questionnaire/questionnaireService';
 
interface RunningDay {
  day: string;
  dayIndex: number;
  selected: boolean;
  isLongRun: boolean;
}
 
const DAYS_OF_WEEK = [
  { day: 'Sunday', index: 0 },
  { day: 'Monday', index: 1 },
  { day: 'Tuesday', index: 2 },
  { day: 'Wednesday', index: 3 },
  { day: 'Thursday', index: 4 },
  { day: 'Friday', index: 5 },
  { day: 'Saturday', index: 6 },
];
 
export default function CalendarScreen() {
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
 
  useEffect(() => {
    const daysValue = getAnswerValue(answers, 'q8');
    if (daysValue) {
      const dayMapping: { [key: string]: number } = {
        '1-2': 2,
        '3-4': 4,
        '5-6': 6,
        '7': 7,
      };
      setUserDays(dayMapping[daysValue] || 3);
    }
  }, [answers]);
 
  const toggleDay = (index: number) => {
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
 
  const generateRunningPlan = () => {
    const selectedCount = getSelectedCount();
   
    if (selectedCount === 0) {
      Alert.alert('Error', 'Please select at least one day to run');
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
        pathname: '/(app)/running-plan',
        params: {
          selectedDays: JSON.stringify(selectedDays),
          userDays: userDays.toString(),
        },
      });
    }, 500);
  };
 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Running Days</Text>
        <Text style={styles.subtitle}>
          You mentioned {userDays} days/week
        </Text>
        <Text style={styles.selectedCount}>
          Selected: {getSelectedCount()} days
        </Text>
      </View>
 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedDays.map((day, index) => (
          <View key={day.day} style={styles.dayContainer}>
            <TouchableOpacity
              style={[
                styles.dayCard,
                day.selected && styles.daySelected,
                day.isLongRun && styles.longRunDay,
              ]}
              onPress={() => toggleDay(index)}
            >
              <View style={styles.dayLeft}>
                <Text style={[styles.dayText, day.selected && styles.dayTextSelected]}>
                  {day.day}
                </Text>
                {day.isLongRun && (
                  <View style={styles.longRunBadge}>
                    <Text style={styles.longRunBadgeText}>🏃 Long Run</Text>
                  </View>
                )}
              </View>
              <View style={styles.dayRight}>
                {day.selected && (
                  <TouchableOpacity
                    style={[
                      styles.longRunButton,
                      day.isLongRun && styles.longRunButtonActive,
                    ]}
                    onPress={() => setLongRun(index)}
                  >
                    <Text style={[
                      styles.longRunButtonText,
                      day.isLongRun && styles.longRunButtonTextActive,
                    ]}>
                      {day.isLongRun ? '⭐ Long Run' : 'Mark Long Run'}
                    </Text>
                  </TouchableOpacity>
                )}
                <View style={[styles.checkbox, day.selected && styles.checkboxChecked]}>
                  {day.selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
 
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            getSelectedCount() === 0 && styles.buttonDisabled,
          ]}
          onPress={generateRunningPlan}
          disabled={getSelectedCount() === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate My Running Plan</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectedCount: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  dayContainer: {
    marginBottom: 12,
  },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  daySelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  longRunDay: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  dayLeft: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#007AFF',
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginLeft: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  longRunBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  longRunBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  longRunButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  longRunButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  longRunButtonText: {
    fontSize: 12,
    color: '#666',
  },
  longRunButtonTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});