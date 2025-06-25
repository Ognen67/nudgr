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
      console.log('Generating tasks for thought:', thought);
      
      // React Native doesn't support SSE streaming well, so we'll use polling approach
      const response = await fetch(ENDPOINTS.TRANSFORM_THOUGHT_STREAMING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thought }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to read the full response as text for SSE parsing
      const responseText = await response.text();
      console.log('Full response received:', responseText.length, 'characters');

      // Parse the SSE response manually
      const lines = responseText.split('\n');
      let accumulatedTasks = [];
      let generatedGoal = null;

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            switch (data.type) {
              case 'status':
                console.log('Status:', data.message);
                break;
                
              case 'progress':
                console.log('Progress chunk:', data.content);
                break;
                
              case 'goal':
                console.log('Goal received:', data.goal.title);
                generatedGoal = data.goal;
                setGoal(data.goal);
                break;
                
              case 'task':
                console.log('New task received:', data.task.title);
                accumulatedTasks.push(data.task);
                break;
                
              case 'complete':
                console.log('Generation complete:', data.goalCreated, 'goal created,', data.totalTasks, 'tasks');
                break;
                
              case 'error':
                console.error('Streaming error:', data.message);
                throw new Error(data.message);
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', parseError);
          }
        }
      }

      // Now simulate streaming by adding tasks one by one with delays
      console.log('Simulating streaming for', accumulatedTasks.length, 'tasks');
      for (let i = 0; i < accumulatedTasks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
        setTasks(prev => [...prev, accumulatedTasks[i]]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log(`Added task ${i + 1}:`, accumulatedTasks[i].title);
      }
      
      setIsGenerating(false);
      console.log('All tasks processed successfully');
      
    } catch (error) {
      console.error('Task generation failed:', error);
      setIsGenerating(false);
      
      // Show error state - no fallback to mock data
      Alert.alert(
        'Connection Error',
        'Failed to generate tasks. Please check your internet connection and try again.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const handleTaskSwipe = async (keep: boolean) => {
    const currentTask = tasks[currentTaskIndex];
    if (currentTask && goal) {
      // For demo purposes - no database operations, just smooth UI
      if (keep) {
        setKeptTasks(prev => [...prev, currentTask]);
      }
      
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      } else {
        // All tasks processed
        setTimeout(() => {
          onAllTasksProcessed(keep ? [...keptTasks, currentTask] : keptTasks, goal);
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

            {/* Task Display Area */}
            <View style={styles.taskArea}>
              {tasks.length === 0 && isGenerating ? (
                <View style={styles.loadingState}>
                  <Ionicons name="bulb" size={48} color="#FF6B35" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              ) : (
                tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSwipe={handleTaskSwipe}
                    isActive={index === currentTaskIndex}
                  />
                ))
              )}
            </View>

            {/* Action Section */}
            {tasks.length > 0 && currentTaskIndex < tasks.length && !isGenerating && (
              <View style={styles.actionSection}>
                <TouchableOpacity style={styles.rejectButton} onPress={handleRejectTask}>
                  <Ionicons name="close" size={20} color="#FF6666" />
                </TouchableOpacity>
                
                <View style={styles.swipeHint}>
                  <Text style={styles.hintText}>Swipe or tap</Text>
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
  taskCard: {
    width: screenWidth - 100,
    position: 'absolute',
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
}); 