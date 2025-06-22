import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button, NeonNumber } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

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
            <Text style={styles.thoughtPromptTitle}>drop a thought</Text>
            <Text style={styles.thoughtPromptSubtitle}>
              capture anything on your mind.
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
  aiChatBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    maxWidth: '88%',
    alignSelf: 'flex-start',
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
});
