import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime?: number;
  aiGenerated: boolean;
  goalId?: string | null;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  icon: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
}

export default function Goals() {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [standaloneTasks, setStandaloneTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load VT323 font for the title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  // Fetch goals and tasks from the backend
  useEffect(() => {
    fetchGoalsAndTasks();
  }, []);

  const fetchGoalsAndTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch all tasks (including standalone AI-generated ones)
      const tasksResponse = await fetch('http://localhost:3000/api/tasks');
      const tasksData = await tasksResponse.json();
      
      if (tasksResponse.ok) {
        // Separate standalone tasks (no goalId) from goal-related tasks
        const standaloneTasksList = tasksData.filter((task: Task) => !task.goalId);
        const goalTasks = tasksData.filter((task: Task) => task.goalId);
        
        setStandaloneTasks(standaloneTasksList);
        
        // If you have goals, fetch them too
        try {
          const goalsResponse = await fetch('http://localhost:3000/api/goals');
          const goalsData = await goalsResponse.json();
          
          if (goalsResponse.ok) {
            // Map goals with their tasks
            const goalsWithTasks = goalsData.map((goal: any) => ({
              ...goal,
              icon: 'briefcase', // Default icon
              tasks: goalTasks.filter((task: Task) => task.goalId === goal.id),
              completedTasks: goalTasks.filter((task: Task) => task.goalId === goal.id && task.completed).length,
              totalTasks: goalTasks.filter((task: Task) => task.goalId === goal.id).length
            }));
            setGoals(goalsWithTasks);
          }
        } catch (goalError) {
          console.log('No goals endpoint or goals available');
          setGoals([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load tasks and goals');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  const toggleTask = async (taskId: string, isGoalTask: boolean = false) => {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true // Toggle completion
        }),
      });

      if (response.ok) {
        // Refresh the data after updating
        fetchGoalsAndTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#FF4444';
      case 'MEDIUM': return '#FF6B35';
      case 'LOW': return '#4CAF50';
      default: return '#FF6B35';
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    return goal.totalTasks > 0 ? Math.round((goal.completedTasks / goal.totalTasks) * 100) : 0;
  };

  const handleAICoachPress = () => {
    router.push('/(tabs)/ai-assistant');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  if (!fontsLoaded) return null;

  return (
    <AppLayout showChatbox={false}>
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
              <Text style={styles.nudgrTitle}>reflect</Text>
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

          {/* Content Area */}
          {loading ? (
            <View style={styles.contentLoadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : (
            <>
              {/* AI-Generated Standalone Tasks */}
              {standaloneTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>✨ AI-Generated Tasks</Text>
                  {standaloneTasks.map((task) => (
                    <GlassCard key={task.id} style={styles.taskCard}>
                      <TouchableOpacity 
                        style={styles.taskContent}
                        onPress={() => toggleTask(task.id)}
                      >
                        <View style={styles.checkbox}>
                          {task.completed ? (
                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color="rgba(255, 255, 255, 0.4)" />
                          )}
                        </View>
                        <View style={styles.taskDetails}>
                          <Text style={[
                            styles.taskTitle,
                            task.completed && styles.taskCompleted
                          ]}>
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text style={styles.taskDescription}>
                              {task.description}
                            </Text>
                          )}
                          <View style={styles.taskMeta}>
                            <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                              <Text style={styles.priorityText}>{task.priority}</Text>
                            </View>
                            {task.estimatedTime && (
                              <Text style={styles.timeEstimate}>
                                {task.estimatedTime}min
                              </Text>
                            )}
                            <Text style={styles.aiTag}>AI</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </GlassCard>
                  ))}
                </View>
              )}

              {/* Goals List */}
              {goals.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>🎯 Goals</Text>
                  {goals.map((goal) => (
                    <View key={goal.id} style={styles.goalContainer}>
                      <GlassCard onPress={() => toggleGoal(goal.id)}>
                        <View style={styles.goalHeader}>
                          <View style={styles.goalInfo}>
                            <View style={styles.goalIcon}>
                              <Ionicons name={goal.icon as any} size={24} color="#FF6B35" />
                            </View>
                            <View style={styles.goalDetails}>
                              <Text style={styles.goalTitle}>{goal.title}</Text>
                              <Text style={styles.goalProgress}>
                                {goal.completedTasks}/{goal.totalTasks} tasks • {getProgressPercentage(goal)}%
                              </Text>
                            </View>
                          </View>
                          <View style={styles.expandIcon}>
                            <Ionicons 
                              name={expandedGoal === goal.id ? 'chevron-up' : 'chevron-down'} 
                              size={20} 
                              color="rgba(255, 255, 255, 0.6)" 
                            />
                          </View>
                        </View>
                        
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { width: `${getProgressPercentage(goal)}%` }
                              ]} 
                            />
                          </View>
                        </View>
                      </GlassCard>

                      {/* Tasks List - Expanded */}
                      {expandedGoal === goal.id && (
                        <View style={styles.tasksContainer}>
                          {goal.tasks.map((task) => (
                            <TouchableOpacity 
                              key={task.id} 
                              style={styles.taskItem}
                              onPress={() => toggleTask(task.id)}
                            >
                              <View style={styles.taskContent}>
                                <View style={styles.checkbox}>
                                  {task.completed ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                  ) : (
                                    <Ionicons name="ellipse-outline" size={24} color="rgba(255, 255, 255, 0.4)" />
                                  )}
                                </View>
                                <Text style={[
                                  styles.taskTitle,
                                  task.completed && styles.taskCompleted
                                ]}>
                                  {task.title}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {goals.length === 0 && standaloneTasks.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="clipboard-outline" size={48} color="rgb(255, 107, 53)" />
                  <Text style={styles.emptyTitle}>no tasks yet</Text>
                  <Text style={styles.emptySubtitle}>
                    drop a thought to get started!
                  </Text>
                </View>
              )}
            </>
          )}
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
  goalContainer: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  goalDetails: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
  },
  expandIcon: {
    marginLeft: 12,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  tasksContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    flex: 1,
  },
  taskCompleted: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: '#FF6B35',
    fontSize: 18,
    marginTop: 16,
    fontFamily: 'VT323',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  taskCard: {
    marginBottom: 12,
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeEstimate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
  },
  aiTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 24,
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.32)',
    fontFamily: 'Inter',
    textTransform: 'lowercase',
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    marginTop: 16,
  },
}); 