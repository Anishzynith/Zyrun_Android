// app/(app)/_layout.tsx
import { Tabs, router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Tab icons (replace with Lucide or other icons if you prefer)
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? Colors.primary : Colors.textMuted }}>🏠</Text>
);
const PlanIcon = ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? Colors.primary : Colors.textMuted }}>📋</Text>
);
const SocialIcon = ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? Colors.primary : Colors.textMuted }}>👥</Text>
);
const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? Colors.primary : Colors.textMuted }}>👤</Text>
);

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
          position: 'relative',
        },
        tabBarItemStyle: { flex: 1, alignItems: 'center' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />

      {/* Tab 2: Plan */}
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ focused }) => <PlanIcon focused={focused} />,
        }}
      />

      {/* Center button – not a tab, but a separate TouchableOpacity */}
      <Tabs.Screen
        name="run"
        options={{
          title: '',
          tabBarItemStyle: { width: 70 },
          tabBarButton: (props) => (
            <TouchableOpacity
              style={styles.centerButton}
              onPress={() => {
                // Navigate to your Run screen
                router.push('/(app)/run');
              }}
            >
              <View style={styles.centerButtonInner}>
                <Text style={styles.centerButtonIcon}>▶️</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab 4: Community */}
      <Tabs.Screen
        name="social"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => <SocialIcon focused={focused} />,
        }}
      />

      {/* Tab 5: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />

      {/* Hidden routes: keep them reachable but remove from tab bar */}
      <Tabs.Screen
        name="questionnaire"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="screens/notifications"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="screens/change-password"
        options={{ tabBarButton: () => null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  centerButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonIcon: {
    fontSize: 30,
    color: Colors.background,
    fontWeight: 'bold',
  },
});