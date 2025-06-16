import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, NeonNumber } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/ui/AppLayout';

export default function AIAssistant() {
  return (
    <AppLayout>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2a2a2a']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>AI Coach</Text>
            <Text style={styles.subtitle}>Your personal productivity mentor</Text>
          </View>

          {/* AI Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <NeonNumber value="24" size="large" color="#FF6B35" />
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="89%" size="large" color="#4CAF50" />
              <Text style={styles.statLabel}>Success</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="156" size="large" color="#FFFFFF" />
              <Text style={styles.statLabel}>Tips</Text>
            </View>
          </View>

          {/* AI Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Insights</Text>
            
            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name="bulb" size={24} color="#FF6B35" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>Productivity Boost</Text>
                  <Text style={styles.suggestionText}>
                    You're most productive between 9-11 AM. Consider scheduling your most important tasks during this window.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Apply" size="small" onPress={() => {}} />
                <Button title="Learn More" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>Goal Optimization</Text>
                  <Text style={styles.suggestionText}>
                    Break down your "Launch New Product" goal into smaller weekly milestones for better tracking.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Auto-Break" size="small" onPress={() => {}} />
                <Button title="Skip" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>Time Management</Text>
                  <Text style={styles.suggestionText}>
                    You have 3 high-priority tasks due today. Consider using the Pomodoro technique to stay focused.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Start Timer" size="small" onPress={() => {}} />
                <Button title="Reschedule" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Tools</Text>
            
            <View style={styles.toolsGrid}>
              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="analytics" size={28} color="#FF6B35" />
                </View>
                <Text style={styles.toolTitle}>Analyze</Text>
                <Text style={styles.toolDescription}>Get insights on your productivity patterns</Text>
              </GlassCard>

              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="rocket" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.toolTitle}>Optimize</Text>
                <Text style={styles.toolDescription}>AI-powered task prioritization</Text>
              </GlassCard>
            </View>

            <View style={styles.toolsGrid}>
              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.toolTitle}>Chat</Text>
                <Text style={styles.toolDescription}>Ask me anything about productivity</Text>
              </GlassCard>

              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="calendar" size={28} color="#FF6B35" />
                </View>
                <Text style={styles.toolTitle}>Plan</Text>
                <Text style={styles.toolDescription}>Smart schedule optimization</Text>
              </GlassCard>
            </View>
          </View>

          {/* Recent Conversations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            
            <GlassCard>
              <View style={styles.chatItem}>
                <View style={styles.chatIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B35" />
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatTitle}>How to stay motivated?</Text>
                  <Text style={styles.chatPreview}>We discussed setting micro-goals and celebrating small wins...</Text>
                  <Text style={styles.chatTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.chatDivider} />
              <View style={styles.chatItem}>
                <View style={styles.chatIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatTitle}>Task prioritization help</Text>
                  <Text style={styles.chatPreview}>I helped you organize tasks using the Eisenhower Matrix...</Text>
                  <Text style={styles.chatTime}>Yesterday</Text>
                </View>
              </View>
            </GlassCard>
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
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#FF6B35',
    marginTop: 4,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    fontWeight: '300',
    lineHeight: 22,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  toolCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 18,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  chatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  chatPreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    fontWeight: '300',
    marginTop: 4,
    lineHeight: 20,
  },
  chatTime: {
    fontSize: 13,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
    marginTop: 6,
  },
  chatDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
}); 