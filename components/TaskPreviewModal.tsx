import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { ENDPOINTS } from '@/utils/api';

const { width: screenWidth } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime?: number;
  category?: string;
}

interface TaskPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskDecision: (taskId: string, keep: boolean, taskData?: any, goalData?: Goal) => Promise<void>;
  onAllTasksProcessed: (keptTasks: Task[], goal?: Goal) => void;
  thought: string;
}

const TaskCard: React.FC<{
  task: Task;
  onSwipe: (keep: boolean) => void;
  isActive: boolean;
}> = ({ task, onSwipe, isActive }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: isActive ? 1 : 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.3;
      
      if (Math.abs(translationX) > threshold || Math.abs(velocityX) > 500) {
        const direction = translationX > 0 ? 'right' : 'left';
        const keep = direction === 'right';
        
        // Haptic feedback
        Haptics.impactAsync(keep ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
        
        // Animate off screen
        Animated.timing(translateX, {
          toValue: keep ? screenWidth : -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onSwipe(keep);
          translateX.setValue(0);
        });
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
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

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.taskCard,
          {
            transform: [
              { translateX },
              { scale }
            ],
            opacity,
          }
        ]}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
        
        <Text style={styles.taskDescription}>{task.description}</Text>
        
        <View style={styles.taskFooter}>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={12} color="#FF6B35" />
            <Text style={styles.estimatedTime}>{task.estimatedTime || 30} min</Text>
          </View>
          {task.category && (
            <Text style={styles.category}>{task.category}</Text>
          )}
        </View>
        
        {/* Swipe indicators */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.swipeLeft,
            {
              opacity: translateX.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Ionicons name="close" size={30} color="#FF4444" />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.swipeRight,
            {
              opacity: translateX.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Ionicons name="checkmark" size={30} color="#4CAF50" />
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({
  visible,
  onClose,
  onTaskDecision,
  onAllTasksProcessed,
  thought,
}) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [keptTasks, setKeptTasks] = useState<Task[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setGoal(null);
      setTasks([]);
      setCurrentTaskIndex(0);
      setKeptTasks([]);
      setIsGenerating(true);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      generateTasksFromChatGPT();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const generateTasksFromChatGPT = async () => {
    try {
      console.log('Generating goal and tasks for thought:', thought);
      setIsGenerating(true);
      
      // Use the transform-thought-to-goal endpoint that creates both goal and tasks in database
      console.log('Step 1: Creating goal and tasks in database...');
      const response = await fetch(ENDPOINTS.TRANSFORM_THOUGHT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thought }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Goal and tasks created in database:', data);

      if (!data.createdGoal || !data.createdTasks) {
        throw new Error('Failed to create goal and tasks in database');
      }

      // Set the goal first (already created in database)
      const goalWithId = {
        id: data.createdGoal.id,
        title: data.createdGoal.title,
        description: data.createdGoal.description,
        priority: data.createdGoal.priority,
        category: data.createdGoal.category
      };
      setGoal(goalWithId);

      // Small delay to show goal creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Display tasks one by one with proper stacking animation (newest on top)
      console.log('Step 2: Displaying', data.createdTasks.length, 'tasks');
             const dbTasks = data.createdTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedTime: task.estimatedTime,
        category: task.goal?.category || 'general',
        goalId: task.goalId
      }));

      // Add tasks one by one, with newest tasks added to the front of the array
      for (let i = 0; i < dbTasks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        
        // Add new task to the BEGINNING of the array so it appears on top
        setTasks(prev => [dbTasks[i], ...prev]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log(`Displayed task ${i + 1} on top:`, dbTasks[i].title);
      }
      
      setIsGenerating(false);
      console.log('All tasks processed successfully and saved to database');
      
    } catch (error) {
      console.error('Goal and task generation failed:', error);
      setIsGenerating(false);
      
      // Fallback to mock data for demo purposes
      console.log('Using fallback mock data');
      const mockGoal = {
        id: `goal_${Date.now()}`,
        title: 'Improve Productivity',
        description: 'Focus on better task management and goal achievement',
        priority: 'HIGH' as const,
        category: 'productivity'
      };

      const mockTasks = [
        {
          id: `task_${Date.now()}_1`,
          title: 'Set daily priorities',
          description: 'Start each day by identifying top 3 priorities',
          priority: 'HIGH' as const,
          estimatedTime: 15,
          category: 'planning',
          goalId: mockGoal.id
        },
        {
          id: `task_${Date.now()}_2`,
          title: 'Use time blocking',
          description: 'Block specific time slots for focused work sessions',
          priority: 'MEDIUM' as const,
          estimatedTime: 30,
          category: 'time-management',
          goalId: mockGoal.id
        },
        {
          id: `task_${Date.now()}_3`,
          title: 'Review weekly progress',
          description: 'Weekly reflection on goals and task completion',
          priority: 'MEDIUM' as const,
          estimatedTime: 20,
          category: 'reflection',
          goalId: mockGoal.id
        }
      ];

      // Set goal first
      setGoal(mockGoal);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Add tasks one by one, with newest tasks added to the front
      for (let i = 0; i < mockTasks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 700));
        setTasks(prev => [mockTasks[i], ...prev]); // Add to front for top stacking
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      setIsGenerating(false);
    }
  };

  const handleTaskSwipe = async (keep: boolean) => {
    // Find the current task (top of stack is index 0)
    const currentTask = tasks[0]; // Always use the top task
    if (currentTask && goal) {
      console.log(`Task "${currentTask.title}" ${keep ? 'accepted' : 'rejected'} for goal "${goal.title}"`);
      
      try {
        if (keep) {
          // Task is already created in database - just mark it as kept/active
          console.log('Task kept - already saved in database with ID:', currentTask.id);
          setKeptTasks(prev => [...prev, currentTask]);
          
          // Call the decision handler with proper goal association
          await onTaskDecision(currentTask.id, true, currentTask, goal);
        } else {
          // Task is skipped - delete it from database
          console.log('Task skipped - deleting from database...');
          
          const deleteResponse = await fetch(`${ENDPOINTS.TASKS}/${currentTask.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete task: ${deleteResponse.status}`);
          }

          console.log('Task successfully deleted from database');
          
          // Call the decision handler
          await onTaskDecision(currentTask.id, false, currentTask, goal);
        }
      } catch (error) {
        console.error('Error processing task decision:', error);
        
        // Show error to user but continue with UI flow
        Alert.alert(
          'Error',
          `Failed to ${keep ? 'save' : 'delete'} task. Please try again.`,
          [{ text: 'OK' }]
        );
      }
      
      // Remove the current task from the stack (shift from front)
      setTasks(prev => prev.slice(1));
      
      // Check if we have more tasks
      if (tasks.length > 1) {
        // More tasks remaining, continue with next task
        console.log(`${tasks.length - 1} tasks remaining`);
      } else {
        // All tasks processed - finalize with the pre-created goal
        const finalKeptTasks = keep ? [...keptTasks, currentTask] : keptTasks;
        console.log(`Finalizing: ${finalKeptTasks.length} tasks kept for goal "${goal.title}"`);
        
        setTimeout(() => {
          onAllTasksProcessed(finalKeptTasks, goal);
          onClose();
        }, 500);
      }
    }
  };

  const handleAcceptTask = async () => {
    await handleTaskSwipe(true);
  };

  const handleRejectTask = async () => {
    await handleTaskSwipe(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <GestureHandlerRootView style={styles.modalContainer}>
        {/* Glass Effect Background */}
        <BlurView intensity={80} tint="dark" style={styles.backgroundBlur}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Ionicons name="sparkles" size={24} color="#FF6B35" />
                <Text style={styles.headerTitle}>AI Goal & Tasks</Text>
              </View>
              
              {goal ? (
                <View style={styles.goalSection}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                </View>
              ) : (
                <Text style={styles.thoughtText}>
                  "{thought.substring(0, 45)}..."
                </Text>
              )}
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressSection}>
              {isGenerating ? (
                <View style={styles.generatingState}>
                  <Ionicons name="time" size={16} color="#FF6B35" />
                  <Text style={styles.progressText}>
                    Creating {tasks.length > 0 ? `(${tasks.length} ready)` : '...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.reviewingState}>
                  <Text style={styles.taskCounter}>
                    {currentTaskIndex + 1} of {tasks.length}
                  </Text>
                  <View style={styles.progressDots}>
                    {Array.from({ length: tasks.length }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.progressDot,
                          i <= currentTaskIndex && styles.progressDotActive
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Task Display Area - Improved stacking with new tasks on top */}
            <View style={styles.taskArea}>
              {tasks.length === 0 && isGenerating ? (
                <View style={styles.loadingState}>
                  {goal ? (
                    <>
                      <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                      <Text style={styles.goalCreatedText}>Goal Created in Database!</Text>
                      <Text style={styles.loadingText}>Generating tasks...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="bulb" size={48} color="#FF6B35" />
                      <Text style={styles.loadingText}>Creating your goal...</Text>
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.taskStack}>
                  {tasks.map((task, index) => {
                    // Index 0 is the top/active task, others are stacked behind
                    const isActive = index === 0;
                    const stackDepth = index; // How deep in the stack
                    const isVisible = stackDepth <= 2; // Show top 3 tasks
                    
                    if (!isVisible) return null;
                    
                    return (
                      <View
                        key={task.id}
                        style={[
                          styles.taskCardContainer,
                          {
                            zIndex: tasks.length - index, // Higher zIndex for top tasks
                            transform: [
                              { translateY: stackDepth * 8 }, // Stack behind (positive offset)
                              { scale: 1 - stackDepth * 0.03 }, // Slight scale reduction for depth
                            ],
                            opacity: isActive ? 1 : 0.7 - stackDepth * 0.15,
                          }
                        ]}
                      >
                        <TaskCard
                          task={task}
                          onSwipe={handleTaskSwipe}
                          isActive={isActive}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Action Section - Show current task count */}
            {tasks.length > 0 && !isGenerating && (
              <View style={styles.actionSection}>
                <TouchableOpacity style={styles.rejectButton} onPress={handleRejectTask}>
                  <Ionicons name="close" size={20} color="#FF6666" />
                </TouchableOpacity>
                
                <View style={styles.swipeHint}>
                  <Text style={styles.hintText}>
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} remaining
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTask}>
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            )}
            
          </Animated.View>
        </BlurView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E1E1E',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.4)',
    padding: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  thoughtText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  goalSection: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    fontFamily: 'Inter',
    marginBottom: 6,
    textAlign: 'center',
  },
  goalDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 18,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  generatingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 15,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  reviewingState: {
    alignItems: 'center',
    gap: 12,
  },
  taskCounter: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
  },
  taskArea: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  loadingState: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rejectButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 102, 102, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 102, 102, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    flex: 1,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
  },
  taskStack: {
    position: 'relative',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCardContainer: {
    position: 'absolute',
    width: screenWidth - 100,
    height: 180,
  },
  taskCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter',
    marginLeft: 4,
    fontWeight: '500',
  },
  category: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  swipeLeft: {
    left: -25,
    borderColor: '#FF6666',
  },
  swipeRight: {
    right: -25,
    borderColor: '#4CAF50',
  },
  goalCreatedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 8,
  },
}); 