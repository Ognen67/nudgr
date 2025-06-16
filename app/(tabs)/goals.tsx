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

export default function Goals() {
  return (
    <AppLayout>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2a2a2a']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Goals</Text>
            <Text style={styles.subtitle}>Dream big, achieve bigger</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <NeonNumber value="5" size="large" color="#FF6B35" />
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="12" size="large" color="#4CAF50" />
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="78%" size="large" color="#FFFFFF" />
              <Text style={styles.statLabel}>Avg</Text>
            </View>
          </View>

          {/* Active Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            
            <GlassCard onPress={() => {}}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name="briefcase" size={20} color="#FF6B35" />
                  </View>
                  <View style={styles.goalDetails}>
                    <Text style={styles.goalTitle}>Launch New Product</Text>
                    <Text style={styles.goalDescription}>Complete MVP and go to market</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <Text style={styles.progressText}>75%</Text>
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalDeadline}>Due: March 15</Text>
                <View style={styles.goalActions}>
                  <Button title="Update" size="small" onPress={() => {}} />
                  <Button title="Details" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name="fitness" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.goalDetails}>
                    <Text style={styles.goalTitle}>Fitness Challenge</Text>
                    <Text style={styles.goalDescription}>Run 100km this month</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
                <Text style={styles.progressText}>60%</Text>
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalDeadline}>Due: End of month</Text>
                <View style={styles.goalActions}>
                  <Button title="Log Run" size="small" onPress={() => {}} />
                  <Button title="Stats" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name="school" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.goalDetails}>
                    <Text style={styles.goalTitle}>Learn React Native</Text>
                    <Text style={styles.goalDescription}>Master mobile development</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '40%' }]} />
                </View>
                <Text style={styles.progressText}>40%</Text>
              </View>
              <View style={styles.goalFooter}>
                <Text style={styles.goalDeadline}>Due: April 30</Text>
                <View style={styles.goalActions}>
                  <Button title="Study" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Recent Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Wins</Text>
            
            <GlassCard>
              <View style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={24} color="#FFD700" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Portfolio Website</Text>
                  <Text style={styles.achievementDescription}>Completed personal portfolio redesign</Text>
                  <Text style={styles.achievementTime}>Completed 3 days ago</Text>
                </View>
              </View>
              <View style={styles.achievementDivider} />
              <View style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="medal" size={24} color="#FF6B35" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Client Presentation</Text>
                  <Text style={styles.achievementDescription}>Successfully pitched new project concept</Text>
                  <Text style={styles.achievementTime}>Completed 1 week ago</Text>
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
  goalHeader: {
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  goalDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    fontFamily: 'Inter',
    minWidth: 40,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalDeadline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  achievementTime: {
    fontSize: 13,
    color: '#FF6B35',
    marginTop: 4,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  achievementDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
}); 