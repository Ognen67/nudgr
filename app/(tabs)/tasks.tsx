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

export default function Tasks() {
  return (
    <AppLayout>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2a2a2a']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Tasks</Text>
            <Text style={styles.subtitle}>Stay focused, stay winning</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <NeonNumber value="15" size="large" color="#4CAF50" />
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="8" size="large" color="#FF6B35" />
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="3" size="large" color="#FFFFFF" />
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Active Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Tasks</Text>
            
            <GlassCard onPress={() => {}}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Complete project proposal</Text>
                  <Text style={styles.taskDescription}>Final review and submission</Text>
                </View>
                <View style={[styles.priorityBadge, styles.highPriority]}>
                  <Text style={styles.priorityText}>HIGH</Text>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.taskTime}>Due in 2 hours</Text>
                <View style={styles.taskActions}>
                  <Button title="Complete" size="small" onPress={() => {}} />
                  <Button title="Pause" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Team meeting preparation</Text>
                  <Text style={styles.taskDescription}>Prepare agenda and materials</Text>
                </View>
                <View style={[styles.priorityBadge, styles.mediumPriority]}>
                  <Text style={styles.priorityText}>MED</Text>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.taskTime}>Today 3:00 PM</Text>
                <View style={styles.taskActions}>
                  <Button title="Complete" size="small" onPress={() => {}} />
                  <Button title="Pause" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>Code review</Text>
                  <Text style={styles.taskDescription}>Review PR #234 and #235</Text>
                </View>
                <View style={[styles.priorityBadge, styles.lowPriority]}>
                  <Text style={styles.priorityText}>LOW</Text>
                </View>
              </View>
              <View style={styles.taskFooter}>
                <Text style={styles.taskTime}>Tomorrow</Text>
                <View style={styles.taskActions}>
                  <Button title="Start" variant="secondary" size="small" onPress={() => {}} />
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Completed Today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Today</Text>
            
            <GlassCard>
              <View style={styles.completedTask}>
                <View style={styles.completedIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.completedInfo}>
                  <Text style={styles.completedTitle}>Design system update</Text>
                  <Text style={styles.completedTime}>Completed 2 hours ago</Text>
                </View>
              </View>
              <View style={styles.taskDivider} />
              <View style={styles.completedTask}>
                <View style={styles.completedIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
                <View style={styles.completedInfo}>
                  <Text style={styles.completedTitle}>Client call follow-up</Text>
                  <Text style={styles.completedTime}>Completed 4 hours ago</Text>
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
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  taskDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  highPriority: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.4)',
  },
  mediumPriority: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.4)',
  },
  lowPriority: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: 0.5,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTime: {
    fontSize: 15,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completedTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.2,
  },
  completedTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  taskDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
}); 