import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../service/auth";
import { GradientHeader } from "../../../components/GradientHeader";
import { AppCard } from "../../../components/AppCard";
import { Avatar } from "../../../components/Avatar";
import { PrimaryButton } from "../../../components/common/PrimaryButton";
import { Colors, Spacing, Typography } from "../../../constants/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const getUnitLabel = (unitSystem: string | undefined) => {
    if (unitSystem === "imperial") return "Imperial (lbs, ft)";
    return "Metric (kg, cm)";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="My Profile"
        rightIcon={
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <AppCard variant="elevated" padding={Spacing.xl} style={styles.headerCard}>
          <Avatar
            name={fullName}
            imageUrl={user?.profile?.profile_picture} // ✅ uses unified field
            size={80}
            style={styles.avatar}
          />
          <Text style={styles.name}>{fullName || "User"}</Text>
          <Text style={styles.email}>{user?.email || "No email"}</Text>
        </AppCard>

        {/* Personal Information */}
        <AppCard variant="elevated" padding={Spacing.md} style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>First Name</Text>
            <Text style={styles.value}>{user?.first_name || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Name</Text>
            <Text style={styles.value}>{user?.last_name || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>
              {user?.phone_number || user?.profile?.phone_number || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{formatDate(user?.profile?.date_of_birth)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{user?.profile?.gender || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Blood Group</Text>
            <Text style={styles.value}>{user?.profile?.blood_group || "N/A"}</Text>
          </View>
        </AppCard>

        {/* Body Measurements */}
        <AppCard variant="elevated" padding={Spacing.md} style={styles.card}>
          <Text style={styles.cardTitle}>Body Measurements</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Unit System</Text>
            <Text style={styles.value}>{getUnitLabel(user?.profile?.unit_system)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>
              {user?.profile?.height_cm
                ? `${user.profile.height_cm} ${user?.profile?.unit_system === "imperial" ? "ft/in" : "cm"}`
                : "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>
              {user?.profile?.weight_kg
                ? `${user.profile.weight_kg} ${user?.profile?.unit_system === "imperial" ? "lbs" : "kg"}`
                : "N/A"}
            </Text>
          </View>
        </AppCard>

        <PrimaryButton
          title="Edit Profile"
          onPress={() => router.push("/(app)/profile/edit")}
          style={styles.editButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  headerCard: { alignItems: "center", marginBottom: Spacing.md },
  avatar: { marginBottom: Spacing.md },
  name: { ...Typography.h2, color: Colors.text },
  email: { ...Typography.body, color: Colors.textSecondary },
  logoutText: { color: Colors.primary, ...Typography.button, fontSize: 14 },
  card: { marginBottom: Spacing.md },
  cardTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 0.4 },
  value: { ...Typography.bodySmall, color: Colors.text, fontWeight: "500", flex: 0.6, textAlign: "right" },
  editButton: { marginTop: Spacing.md },
});