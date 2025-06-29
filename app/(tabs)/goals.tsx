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
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API } from '@/config/api';
import { useFocusEffect } from '@react-navigation/native';
import { useRefresh } from '@/contexts/RefreshContext';

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
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handleTaskPress = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Subtle scale animation only
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
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
        activeOpacity={0.95}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
          {task.completed ? (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={20} color="rgba(255, 255, 255, 0.4)" />
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
            
            {task.estimatedTime && (
              <Text style={styles.timeText}>{task.estimatedTime}m</Text>
            )}
            
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
  const progressAnimations = useRef<{[key: string]: Animated.Value}>({}).current;
  const { goalsRefreshTrigger } = useRefresh();

  // Load VT323 font for the title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  // Removed auto-refresh when switching to ideas tab - will only refresh after new idea creation

  // Refresh goals when refresh trigger changes (only when new goals are created)
  useEffect(() => {
    if (goalsRefreshTrigger > 0) {
      fetchGoalsAndTasks();
    }
  }, [goalsRefreshTrigger]);

  // Initial load when screen first loads or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchGoalsAndTasks();
      setExpandedGoals(new Set()); // Reset expanded goals for clean view
    }, [])
  );

  // Add a refresh when the screen is focused
  // useEffect(() => {
  //   if (isFocused) {
  //     fetchGoalsAndTasks();
  //   }
  // }, [isFocused]);

  const fetchGoalsAndTasks = async () => {
    try {
      setLoading(true);
      
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
          const goalsResponse = await fetch(ENDPOINTS.GOALS);
          
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
            
            // Initialize progress animation for this goal if not exists
            if (!progressAnimations[goal.id]) {
              const completedTasks = goalTasksList.filter((task: Task) => task.completed).length;
              const totalTasks = goalTasksList.length;
              const initialProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              progressAnimations[goal.id] = new Animated.Value(initialProgress);
            }
            
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          
          const newCompletedCount = updatedTasks.filter((task: Task) => task.completed).length;
          
          // Animate progress bar smoothly with wall-crushing effect
          if (progressAnimations[goal.id]) {
            const newProgress = updatedTasks.length > 0 ? (newCompletedCount / updatedTasks.length) * 100 : 0;
            
            if (newCompletedStatus) {
              // Task completed - trigger wall-crushing effect
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              
              // Progress animation with ease-in timing
              Animated.timing(progressAnimations[goal.id], {
                toValue: newProgress,
                duration: 800,
                easing: Easing.poly(0.4),
                useNativeDriver: false,
              }).start();
            } else {
              // Task uncompleted - gentle haptic
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              
              // Smooth progress animation with ease-in
              Animated.timing(progressAnimations[goal.id], {
                toValue: newProgress,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
              }).start();
            }
          }
          
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

  const getInterestingIcon = (goal: Goal) => {
    // Return a more interesting icon based on goal content or default to a diverse set
    const title = goal.title.toLowerCase();
    const description = goal.description?.toLowerCase() || '';
    const content = `${title} ${description}`;
    
    // Work & Career
    if (content.includes('work') || content.includes('job') || content.includes('career') || content.includes('project') || content.includes('meeting')) {
      return 'briefcase';
    }
    if (content.includes('code') || content.includes('programming') || content.includes('development') || content.includes('app')) {
      return 'code-slash';
    }
    if (content.includes('presentation') || content.includes('pitch') || content.includes('speak')) {
      return 'megaphone';
    }
    
    // Health & Fitness
    if (content.includes('health') || content.includes('fitness') || content.includes('exercise') || content.includes('workout') || content.includes('gym')) {
      return 'heart';
    }
    if (content.includes('run') || content.includes('walk') || content.includes('jog')) {
      return 'walk';
    }
    if (content.includes('diet') || content.includes('nutrition') || content.includes('eat') || content.includes('food')) {
      return 'nutrition';
    }
    
    // Learning & Education
    if (content.includes('learn') || content.includes('study') || content.includes('course') || content.includes('book') || content.includes('read')) {
      return 'book';
    }
    if (content.includes('language') || content.includes('skill') || content.includes('practice')) {
      return 'library';
    }
    
    // Creative & Arts
    if (content.includes('design') || content.includes('creative') || content.includes('art') || content.includes('draw')) {
      return 'color-palette';
    }
    if (content.includes('music') || content.includes('song') || content.includes('instrument')) {
      return 'musical-notes';
    }
    if (content.includes('write') || content.includes('blog') || content.includes('article')) {
      return 'create';
    }
    
    // Finance & Money
    if (content.includes('money') || content.includes('budget') || content.includes('save') || content.includes('invest') || content.includes('financial')) {
      return 'wallet';
    }
    
    // Travel & Adventure
    if (content.includes('travel') || content.includes('trip') || content.includes('vacation') || content.includes('visit')) {
      return 'airplane';
    }
    
    // Home & Personal
    if (content.includes('home') || content.includes('house') || content.includes('clean') || content.includes('organize')) {
      return 'home';
    }
    if (content.includes('family') || content.includes('relationship') || content.includes('friend')) {
      return 'people';
    }
    
    // Hobbies & Fun
    if (content.includes('game') || content.includes('play') || content.includes('fun')) {
      return 'game-controller';
    }
    if (content.includes('garden') || content.includes('plant') || content.includes('grow')) {
      return 'leaf';
    }
    
    // Goals with specific actions
    if (content.includes('call') || content.includes('phone') || content.includes('contact')) {
      return 'call';
    }
    if (content.includes('email') || content.includes('message') || content.includes('communicate')) {
      return 'mail';
    }
    if (content.includes('shopping') || content.includes('buy') || content.includes('purchase')) {
      return 'basket';
    }
    
    // Fallback to diverse icons based on goal ID hash for consistency
    const goalIdHash = goal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const iconOptions = [
      'rocket', 'star', 'diamond', 'flash', 'trophy', 'medal', 'flag', 
      'compass', 'map', 'telescope', 'bulb', 'magnet', 'prism', 'eye',
      'camera', 'film', 'headset', 'tv', 'radio', 'newspaper', 'journal',
      'calculator', 'timer', 'stopwatch', 'calendar', 'clipboard', 'folder'
    ];
    
    return iconOptions[goalIdHash % iconOptions.length];
  };

  const handleAICoachPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/ai-assistant');
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                  name={getInterestingIcon(goal) as any} 
                                  size={24} 
                                  color="#FF6B35" 
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
                          
                          {/* Enhanced Progress Bar with Wall-Crushing Effect */}
                          <View style={styles.progressContainer}>
                            {/* Wall Texture Background */}
                            <View style={styles.wallBackground}>
                              <View style={styles.wallPattern}>
                                {Array.from({ length: 8 }, (_, i) => (
                                  <View key={i} style={styles.wallBrick} />
                                ))}
                              </View>
                            </View>
                            
                            {/* Progress Bar */}
                            <View style={styles.progressBar}>
                              <Animated.View 
                                style={[
                                  styles.progressFill, 
                                  { 
                                    width: progressAnimations[goal.id] 
                                      ? progressAnimations[goal.id].interpolate({
                                          inputRange: [0, 100],
                                          outputRange: ['0%', '100%'],
                                          extrapolate: 'clamp',
                                        })
                                      : `${getProgressPercentage(goal)}%`
                                  }
                                ]} 
                              >
                                {/* Crushing Effect Overlay */}
                                <LinearGradient
                                  colors={['#FF6B35', '#FF8A65', '#FFAB91']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.crushingGradient}
                                />
                                
                                {/* Impact Line at the progress edge */}
                                <View style={styles.impactLine} />
                                
                                {/* Debris particles */}
                                <View style={styles.debrisContainer}>
                                  <View style={[styles.debris, styles.debris1]} />
                                  <View style={[styles.debris, styles.debris2]} />
                                  <View style={[styles.debris, styles.debris3]} />
                                </View>
                              </Animated.View>
                              
                              {/* Crack lines extending from progress */}
                              {progressAnimations[goal.id] && (
                                <Animated.View
                                  style={[
                                    styles.crackOverlay,
                                    {
                                      opacity: progressAnimations[goal.id].interpolate({
                                        inputRange: [0, 30, 100],
                                        outputRange: [0, 0.8, 0.4],
                                        extrapolate: 'clamp',
                                      }),
                                    },
                                  ]}
                                >
                                  <View style={styles.crack1} />
                                  <View style={styles.crack2} />
                                  <View style={styles.crack3} />
                                </Animated.View>
                              )}
                            </View>
                            
                                                                                      {/* Progress Percentage Text */}
                             <View style={styles.progressTextContainer}>
                               <Text style={styles.progressText}>
                                 {Math.round(getProgressPercentage(goal))}% CRUSHED
                               </Text>
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
    marginBottom: 30, // Match the horizontal padding of sectionContainer
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
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Wall-crushing animation styles
  wallBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  wallPattern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
    opacity: 0.3,
  },
  wallBrick: {
    width: '12.5%',
    height: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(139, 69, 19, 0.2)', // Brown brick color
  },
  crushingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  impactLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFAB91',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    zIndex: 2,
  },
  debrisContainer: {
    position: 'absolute',
    right: -8,
    top: -4,
    width: 16,
    height: 14,
    zIndex: 3,
  },
  debris: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFAB91',
    borderRadius: 1,
  },
  debris1: {
    top: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  debris2: {
    top: 6,
    right: 4,
    width: 1.5,
    height: 1.5,
    transform: [{ rotate: '15deg' }],
  },
  debris3: {
    top: 1,
    right: 6,
    width: 1,
    height: 1,
    transform: [{ rotate: '75deg' }],
  },
  crackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  crack1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 1,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '15deg' }],
  },
  crack2: {
    position: 'absolute',
    top: '25%',
    right: 10,
    width: 0.5,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '-10deg' }],
  },
  crack3: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 0.5,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '25deg' }],
  },
  progressTextContainer: {
    position: 'absolute',
    top: -20,
    right: 0,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tasksContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    marginTop: 6,
    gap: 8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
  },
  aiTag: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF6B35',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Legacy styles to maintain compatibility
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timeEstimate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
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
  },
  emptyTasksText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'italic',
  },
  checkbox: {
    marginRight: 12,
  },

});