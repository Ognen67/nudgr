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
import { GlassCard } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';



export default function Dashboard() {
  const router = useRouter();

  // Load VT323 font for the Nudgr title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });
  if (!fontsLoaded) return null;

  const handleAICoachPress = () => {
    router.push('/(tabs)/ai-assistant');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <AppLayout>
      <LinearGradient
        colors={['rgba(255,107,53,0.08)', '#232323', '#181818']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
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
              <Text style={styles.nudgrTitle}>Nudgr</Text>
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

          {/* AI-to-User Conversation */}
          <View style={styles.messagesSection}>
            {/* AI Coach Chat Bubble */}
            <GlassCard style={styles.aiChatBubble}>
              <Text style={styles.aiBubbleText}>
                you should call martin tomorrow to discuss the project proposal.
              </Text>
            </GlassCard>
          </View>

          {/* Drop a Thought Prompt */}
          <View style={styles.thoughtPromptContainer}>
            <Text style={styles.thoughtPromptTitle}>drop a thought...</Text>
            <Text style={styles.thoughtPromptSubtitle}>
              capture anything on your mind. your ai coach is always listening.
            </Text>
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
  nudgrTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'VT323',
    letterSpacing: 2,
    textTransform: 'lowercase',
    textShadowColor: 'rgba(255, 107, 53, 0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  messagesSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
    width: "100%"
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
  // Priority Icon Styles
  priorityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // AI Message Styles
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiMessageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiMessageContent: {
    flex: 1,
  },
  aiMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  aiMessageTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
  },
  // Activity Content
  activityContent: {
    flex: 1,
  },
  // Urgent Message Card Styles
  highUrgencyCard: {
    backgroundColor: 'rgba(255, 68, 68, 0.04)',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    marginBottom: 16,
  },
  mediumUrgencyCard: {
    backgroundColor: 'rgba(255, 165, 0, 0.04)',
    shadowColor: '#FFA500',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
    marginBottom: 16,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiBubbleContent: {
    flex: 1,
  },
  aiBubbleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'Inter',
    textTransform: 'lowercase',
    width: '100%',
    flexWrap: 'wrap',
  },
  thoughtPromptContainer: {
    padding: 24,
    alignItems: 'center',
  },
  thoughtPromptTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  thoughtPromptSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.32)',
    fontFamily: 'Inter',
    textTransform: 'lowercase',
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  aiChatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiChatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiChatBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
});
