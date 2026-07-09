// app/(app)/dashboard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../service/auth';
import { GradientHeader } from '../../components/GradientHeader';
import { AppCard } from '../../components/AppCard';
import { StatCard } from '../../components/StatCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import NotificationBell from '../../components/NotificationBell';
import SettingsMenu from '../../components/SettingsMenu';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Replace these with real data from your API
  const stats = {
    totalEmployees: 156,
    presentToday: 132,
    onLeave: 12,
    pendingRequests: 8,
  };

  const quickActions = [
    { label: 'Start Run', icon: '▶️', route: '/(app)/run' },
    { label: 'Training Plan', icon: '📋', route: '/(app)/plan' },
    { label: 'History', icon: '📊', route: '/(app)/history' },
    { label: 'Achievements', icon: '🏆', route: '/(app)/achievements' },
  ];

  const recentActivity = [
    { text: 'John Doe applied for annual leave', time: '2 hours ago' },
    { text: 'Jane Smith checked in at 9:00 AM', time: '4 hours ago' },
    { text: 'Payroll for March processed', time: 'Yesterday' },
  ];

  const handleSettingsOption = (option: string) => {
    setSettingsVisible(false);
    switch (option) {
      case 'Edit Profile':
        router.push('/(app)/profile/edit');
        break;
      case 'Change Password':
        router.push('/(app)/screens/change-password');
        break;
      case 'Notifications':
        router.push('/(app)/screens/notifications');
        break;
      case 'Logout':
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/(auth)/login');
            },
          },
        ]);
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Dashboard"
        subtitle={`${getGreeting()}, ${fullName || 'User'}`}
        rightIcon={
          <View style={styles.headerIcons}>
            <NotificationBell onPress={() => router.push('/(app)/notifications')} />
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Distance Today"
            value={stats.totalEmployees}
            icon={<Text>👥</Text>}
          />
          <StatCard
            title="This Week"
            value={stats.presentToday}
            icon={<Text>✅</Text>}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Phase Progress"
            value={stats.onLeave}
            icon={<Text>🏖️</Text>}
          />
          <StatCard
            title="Timing"
            value={stats.pendingRequests}
            icon={<Text>📋</Text>}
          />
        </View>

        {/* Quick Actions */}
        <AppCard variant="elevated" padding={Spacing.md} style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.circularAction}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route as any);
                  } else {
                    Alert.alert('Coming Soon', 'This feature is being developed.');
                  }
                }}
              >
                <View style={styles.circularIcon}>
                  <Text style={styles.circularIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.circularLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AppCard>

        {/* Recent Activity */}
        <AppCard variant="elevated" padding={Spacing.md}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((item, index) => (
            <View key={index} style={styles.activityItem}>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </AppCard>

        <View style={styles.profileLink}>
          <PrimaryButton
            title="View Full Profile"
            onPress={() => router.push('/(app)/profile')}
            variant="outline"
          />
        </View>
      </ScrollView>

      <SettingsMenu
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSelect={handleSettingsOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingsButton: { padding: Spacing.xs },
  settingsIcon: { fontSize: 22, color: Colors.text },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  quickActionsCard: { marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.md },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  circularAction: { alignItems: 'center', gap: Spacing.xs, width: 70 },
  circularIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  circularIconText: { fontSize: 24 },
  circularLabel: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
  activityItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityText: { ...Typography.bodySmall, color: Colors.text },
  activityTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  profileLink: { marginTop: Spacing.md, marginBottom: Spacing.xl },
});