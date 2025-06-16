import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button, NeonNumber } from '@/components/ui/Button';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';

// Frosted Glass Card Component
const FrostedGlassCard: React.FC<{
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low' | 'orange' | 'none';
  onPress?: () => void;
}> = ({ children, priority = 'none', onPress }) => {
  const getBorderColor = () => {
    switch (priority) {
      case 'high':
        return 'rgba(255, 68, 68, 0.4)';
      case 'medium':
        return 'rgba(255, 165, 0, 0.4)';
      case 'low':
        return 'rgba(76, 175, 80, 0.4)';
      case 'orange':
        return 'rgba(255, 107, 53, 0.4)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getShadowColor = () => {
    switch (priority) {
      case 'high':
        return '#FF4444';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#4CAF50';
      case 'orange':
        return '#FF6B35';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper 
      style={[styles.frostedCard, { shadowColor: getShadowColor() }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <BlurView 
        intensity={60} 
        tint="dark" 
        style={styles.frostedBlur}
      >
        <View style={[styles.frostedOverlay, { borderColor: getBorderColor() }]}>
          {children}
        </View>
      </BlurView>
    </CardWrapper>
  );
};

export default function Dashboard() {
  const router = useRouter();

  const handleAICoachPress = () => {
    router.push('/(tabs)/ai-assistant');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <AppLayout>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2a2a2a']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Top Navigation */}
          <View style={styles.topNav}>
            <TouchableOpacity 
              style={styles.aiCoachButton}
              onPress={handleAICoachPress}
              activeOpacity={0.8}
            >
              <View style={styles.aiCoachButtonContainer}>
                <Ionicons name="sparkles" size={20} color="#FF6B35" />
              </View>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>Nudgr</Text>
            </View>

            <TouchableOpacity 
              style={styles.profileButton}
              onPress={handleProfilePress}
              activeOpacity={0.8}
            >
              <View style={styles.profileButtonContainer}>
                <Ionicons name="person-circle" size={24} color="#FF6B35" />
              </View>
            </TouchableOpacity>
          </View>

          {/* AI Messages */}
          <View style={styles.messagesSection}>
            {/* High Priority - Personalized AI Message */}
            <FrostedGlassCard priority="high" onPress={() => {}}>
              <View style={styles.taskItem}>
                <View style={styles.aiMessageIcon}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B35" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Don't forget to call Michael about the project proposal</Text>
                  <Text style={styles.taskTime}>He's expecting your call in 2 hours</Text>
                </View>
              </View>
            </FrostedGlassCard>
            
            {/* Medium Priority - Personalized AI Message */}
            <FrostedGlassCard priority="medium" onPress={() => {}}>
              <View style={styles.taskItem}>
                <View style={styles.aiMessageIcon}>
                  <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B35" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>You have that team meeting at 3 PM - prep your notes!</Text>
                  <Text style={styles.taskTime}>I'll remind you 30 minutes before</Text>
                </View>
              </View>
            </FrostedGlassCard>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <NeonNumber value="12" size="large" color="#FF6B35" />
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="8" size="large" color="#4CAF50" />
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="3" size="large" color="#FFFFFF" />
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                title="AI Boost"
                icon="flash"
                onPress={() => router.push('/(tabs)/ai-assistant')}
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Review"
                icon="eye"
                onPress={() => router.push('/(tabs)/tasks')}
                variant="secondary"
                size="small"
                style={styles.actionButton}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <FrostedGlassCard>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.activityText}>Completed "Design review"</Text>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
              <View style={styles.activityDivider} />
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="flag" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.activityText}>New goal: "Learn TypeScript"</Text>
                <Text style={styles.activityTime}>1d ago</Text>
              </View>
            </FrostedGlassCard>
          </View>

          {/* Upcoming */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Up</Text>
            <FrostedGlassCard priority="orange">
              <View style={styles.upcomingItem}>
                <View style={styles.upcomingIcon}>
                  <Ionicons name="calendar" size={20} color="#FF6B35" />
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>Team Standup</Text>
                  <Text style={styles.upcomingTime}>Tomorrow 9:00 AM</Text>
                </View>
              </View>
            </FrostedGlassCard>
          </View>
        </ScrollView>
      </LinearGradient>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 30,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  aiCoachButton: {
    alignItems: 'flex-start',
  },
  aiCoachButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
  },
  messagesSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  aiMessageIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  taskTime: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 6,
    fontFamily: 'Inter',
    fontWeight: '400',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  frostedCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  frostedBlur: {
    borderRadius: 16,
  },
  frostedOverlay: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  activityDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  upcomingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  upcomingTime: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 6,
    fontFamily: 'Inter',
    fontWeight: '400',
    opacity: 0.9,
  },
  profileButton: {
    alignItems: 'flex-end',
  },
  profileButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
});
