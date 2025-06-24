import { AppLayout } from '@/components/ui/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { ENDPOINTS } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime?: number;
  aiGenerated: boolean;
  goalId?: string | null;
  dueDate?: string; // Add due date property
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

// Separate component for task items to manage animation state properly
const TaskItem: React.FC<{
  task: Task;
  isUnassigned: boolean;
  onToggle: () => void;
  getPriorityColor: (priority: string) => string;
}> = ({ task, isUnassigned, onToggle, getPriorityColor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleTaskPress = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate scale down and up for visual feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle the task
    onToggle();
  };

  return (
    <Animated.View
      style={[
        styles.taskItem,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.taskContent}
        onPress={handleTaskPress}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
          {task.completed ? (
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={22} color="rgba(255, 255, 255, 0.4)" />
          )}
        </View>
        <View style={styles.taskDetails}>
          <Text style={[
            styles.taskTitle,
            task.completed && styles.taskCompleted
          ]}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
            {(task.aiGenerated || isUnassigned) && (
              <Text style={styles.aiTag}>AI</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Goals() {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
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

  // Add a refresh when the screen is focused
  // useEffect(() => {
  //   if (isFocused) {
  //     fetchGoalsAndTasks();
  //   }
  // }, [isFocused]);

  const fetchGoalsAndTasks = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching tasks from API...");
      console.log("Tasks endpoint:", ENDPOINTS.TASKS); // Log the actual endpoint URL
      
      // Fetch all tasks (including standalone AI-generated ones)
      try {
        const tasksResponse = await fetch(ENDPOINTS.TASKS);
        console.log("Tasks response status:", tasksResponse.status);
        
        if (!tasksResponse.ok) {
          // If server returns an error response (e.g. 404, 500)
          console.error(`Tasks API error: ${tasksResponse.status} - ${tasksResponse.statusText}`);
          throw new Error(`Server responded with ${tasksResponse.status}: ${tasksResponse.statusText}`);
        }
        
        const tasksData = await tasksResponse.json();
        console.log("Tasks fetched:", tasksData);
        
        // Separate standalone tasks (no goalId) from goal-related tasks
        const standaloneTasksList = tasksData.filter((task: Task) => !task.goalId);
        const goalTasks = tasksData.filter((task: Task) => task.goalId);
        
        setStandaloneTasks(standaloneTasksList);
        
        // If you have goals, fetch them too
        try {
          console.log("Fetching goals from API...");
          console.log("Goals endpoint:", ENDPOINTS.GOALS); // Log the actual endpoint URL
          
          const goalsResponse = await fetch(ENDPOINTS.GOALS);
          console.log("Goals response status:", goalsResponse.status);
          
          if (!goalsResponse.ok) {
            console.error(`Goals API error: ${goalsResponse.status} - ${goalsResponse.statusText}`);
            throw new Error(`Server responded with ${goalsResponse.status}: ${goalsResponse.statusText}`);
          }
          
          const goalsData = await goalsResponse.json();
          console.log("Goals fetched:", goalsData);
          
          // Add debug logs to see what's being compared
          console.log("First goal ID:", goalsData[0]?.id, "Type:", typeof goalsData[0]?.id);
          console.log("Sample task goalId:", goalTasks[0]?.goalId, "Type:", typeof goalTasks[0]?.goalId);
          
          // Map goals with their tasks - ensure string comparison for IDs
          const goalsWithTasks = goalsData.map((goal: any) => {
            // Filter tasks that belong to this goal (convert IDs to strings for comparison)
            const goalTasksList = goalTasks.filter((task: Task) => 
              String(task.goalId) === String(goal.id)
            );
            
            console.log(`Goal ${goal.id} has ${goalTasksList.length} tasks`);
            
            return {
              ...goal,
              icon: goal.icon || 'briefcase', // Default icon
              tasks: goalTasksList,
              completedTasks: goalTasksList.filter((task: Task) => task.completed).length,
              totalTasks: goalTasksList.length
            };
          });
          
          // Create an "Unassigned Tasks" goal if there are standalone tasks
          const allGoals = [...goalsWithTasks];
          if (standaloneTasksList.length > 0) {
            allGoals.push({
              id: 'unassigned',
              title: 'Unassigned Tasks',
              icon: 'sparkles',
              tasks: standaloneTasksList,
              completedTasks: standaloneTasksList.filter((task: Task) => task.completed).length,
              totalTasks: standaloneTasksList.length
            });
          }
          
          setGoals(allGoals);
        } catch (goalError) {
          console.error('Error fetching goals:', goalError);
          // Create only the unassigned tasks goal
          if (standaloneTasksList.length > 0) {
            setGoals([{
              id: 'unassigned',
              title: 'Unassigned Tasks',
              icon: 'sparkles',
              tasks: standaloneTasksList,
              completedTasks: standaloneTasksList.filter((task: Task) => task.completed).length,
              totalTasks: standaloneTasksList.length
            }]);
          } else {
            setGoals([]);
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        Alert.alert('Error', 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load tasks and goals');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    const newExpandedGoals = new Set(expandedGoals);
    if (newExpandedGoals.has(goalId)) {
      newExpandedGoals.delete(goalId);
    } else {
      newExpandedGoals.add(goalId);
    }
    setExpandedGoals(newExpandedGoals);
  };

  const toggleTask = async (taskId: string, isGoalTask: boolean = false) => {
    // Find the task in the current state
    let targetTask: Task | null = null;
    let targetGoal: Goal | null = null;
    
    // Search in goals and standalone tasks
    for (const goal of goals) {
      const task = goal.tasks.find(t => t.id === taskId);
      if (task) {
        targetTask = task;
        targetGoal = goal;
        break;
      }
    }
    
    if (!targetTask) {
      console.error('Task not found');
      return;
    }

    // Optimistic update: immediately update the UI
    const newCompletedStatus = !targetTask.completed;
    
    // Update goals state optimistically
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id === targetGoal?.id) {
          const updatedTasks = goal.tasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: newCompletedStatus }
              : task
          );
          
          const newCompletedCount = updatedTasks.filter(task => task.completed).length;
          
          return {
            ...goal,
            tasks: updatedTasks,
            completedTasks: newCompletedCount
          };
        }
        return goal;
      })
    );

    // Make API call in the background
    try {
      const response = await fetch(`${ENDPOINTS.TASKS}/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: newCompletedStatus
        }),
      });

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        setGoals(prevGoals => 
          prevGoals.map(goal => {
            if (goal.id === targetGoal?.id) {
              const revertedTasks = goal.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, completed: !newCompletedStatus } // Revert
                  : task
              );
              
              const revertedCompletedCount = revertedTasks.filter(task => task.completed).length;
              
              return {
                ...goal,
                tasks: revertedTasks,
                completedTasks: revertedCompletedCount
              };
            }
            return goal;
          })
        );
        
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Revert optimistic update on network error
      setGoals(prevGoals => 
        prevGoals.map(goal => {
          if (goal.id === targetGoal?.id) {
            const revertedTasks = goal.tasks.map(task => 
              task.id === taskId 
                ? { ...task, completed: !newCompletedStatus } // Revert
                : task
            );
            
            const revertedCompletedCount = revertedTasks.filter(task => task.completed).length;
            
            return {
              ...goal,
              tasks: revertedTasks,
              completedTasks: revertedCompletedCount
            };
          }
          return goal;
        })
      );
      
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
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

  const renderTask = (task: Task, isUnassigned: boolean = false) => (
    <TaskItem
      key={task.id}
      task={task}
      isUnassigned={isUnassigned}
      onToggle={() => toggleTask(task.id)}
      getPriorityColor={getPriorityColor}
    />
  );

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
          {/* Top Navigation with added Refresh button */}
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

            <View style={styles.rightButtonsContainer}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchGoalsAndTasks}
                activeOpacity={0.8}
              >
                <View style={styles.refreshButtonContainer}>
                  <Ionicons name="refresh" size={20} color="#FF6B35" />
                </View>
              </TouchableOpacity>
              
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
          </View>

          {/* Content Area */}
          {loading ? (
            <View style={styles.contentLoadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Goals with Tasks Accordion */}
              {goals.length > 0 && (
                <View style={styles.sectionContainer}>
                  
                  {goals.map((goal) => (
                    <View key={goal.id} style={styles.goalContainer}>
                                             <GlassCard 
                         style={expandedGoals.has(goal.id) ? {...styles.goalCard, ...styles.goalCardExpanded} : styles.goalCard}
                       >
                        <TouchableOpacity 
                          onPress={() => toggleGoal(goal.id)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.goalHeader}>
                            <View style={styles.goalInfo}>
                              <View style={[
                                styles.goalIcon,
                                goal.id === 'unassigned' && styles.unassignedGoalIcon
                              ]}>
                                <Ionicons 
                                  name={goal.icon as any} 
                                  size={24} 
                                  color={goal.id === 'unassigned' ? '#FF6B35' : '#FF6B35'} 
                                />
                              </View>
                              <View style={styles.goalDetails}>
                                <Text style={styles.goalTitle}>{goal.title}</Text>
                                <Text style={styles.goalProgress}>
                                  {goal.completedTasks}/{goal.totalTasks} tasks
                                </Text>
                              </View>
                            </View>
                            <View style={styles.expandIcon}>
                              <Ionicons 
                                name={expandedGoals.has(goal.id) ? 'chevron-up' : 'chevron-down'} 
                                size={24} 
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
                        </TouchableOpacity>

                        {/* Tasks List - Expanded */}
                        {expandedGoals.has(goal.id) && (
                          <View style={styles.tasksContainer}>

                            {goal.tasks.map((task) => renderTask(task, goal.id === 'unassigned'))}
                            
                            {goal.tasks.length === 0 && (
                              <View style={styles.emptyTasksContainer}>
                                <Text style={styles.emptyTasksText}>
                                  No tasks
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </GlassCard>
                    </View>
                  ))}
                </View>
              )}

              {/* Empty State */}
              {goals.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="flag-outline" size={48} color="rgb(255, 107, 53)" />
                  </View>
                  <Text style={styles.emptyTitle}>no goals yet</Text>
                  <Text style={styles.emptySubtitle}>
                    drop a thought to get started
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
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    alignItems: 'center',
  },
  refreshButtonContainer: {
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
  },
  goalCard: {
    marginBottom: 12,
  },
  goalCardExpanded: {
    marginBottom: 24,
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
  unassignedGoalIcon: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
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
  goalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
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
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tasksHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
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
  checkboxCompleted: {
    opacity: 0.8,
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
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
    opacity: 0.7,
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
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
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
  },
  emptyTasksContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'italic',
  },
});