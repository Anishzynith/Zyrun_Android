import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { QuestionOption } from "../../../../service/questionnaire/questionnaireService";

interface SingleChoiceProps {
  options: QuestionOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

const SingleChoice: React.FC<SingleChoiceProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            selectedValue === option.value && styles.selectedOption,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <View style={styles.radioCircle}>
            {selectedValue === option.value && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text
            style={[
              styles.optionText,
              selectedValue === option.value && styles.selectedText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#e8e6ff",
    borderColor: "#6C63FF",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6C63FF",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedText: {
    color: "#6C63FF",
    fontWeight: "600",
  },
});

export default SingleChoice;