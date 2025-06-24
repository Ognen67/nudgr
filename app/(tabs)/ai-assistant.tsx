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
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Button, NeonNumber } from '@/components/ui/Button';
import { API } from '@/config/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedTime?: number;
  aiGenerated: boolean;
  goalId?: string | null;
  createdAt?: string;
  dueDate?: string; // Add due date property
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  createdAt: string;
  deadline?: string;
}

interface TimelineItem {
  id: string;
  type: 'goal' | 'milestone';
  title: string;
  subtitle?: string;
  description?: string;
  date: string;
  progress?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  icon: string;
  color: string;
  goal?: Goal;
  completed?: boolean;
}

// Enhanced Timeline node component with better animations and responsiveness
const TimelineNode: React.FC<{
  item: TimelineItem;
  index: number;
  isLeft: boolean;
  onPress: () => void;
  timelineItems: TimelineItem[];
}> = ({ item, index, isLeft, onPress, timelineItems }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(isLeft ? -100 : 100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const delay = index * 150;
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    // Start continuous pulse animation
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startPulse, delay + 800);
  }, [index]);

  const handlePressIn = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    
    onPress();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getRandomRotation = () => {
    return Math.random() * 6 - 3; // Random rotation between -3 and 3 degrees
  };

  const getPriorityGlow = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#FF4444';
      case 'MEDIUM': return '#FF6B35';
      case 'LOW': return '#4CAF50';
      default: return '#FF6B35';
    }
  };

  return (
    <Animated.View
      style={[
        styles.timelineNodeContainer,
        isLeft ? styles.timelineNodeLeft : styles.timelineNodeRight,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { translateX: translateXAnim },
            { 
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['5deg', `${getRandomRotation()}deg`]
              })
            }
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchableArea}
      >
        <Animated.View
          style={[
            styles.cardGlowContainer,
            {
              shadowColor: getPriorityGlow(item.priority),
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.6]
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 20]
              }),
              elevation: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 15]
              }),
            }
          ]}
        >
          <View style={styles.timelineItemWrapper}>
            {/* Enhanced Task card with gradient overlay */}
            <GlassCard style={[styles.goalCard, isTablet && styles.goalCardTablet]}>
              <LinearGradient
                colors={[
                  'rgba(255, 107, 53, 0.1)',
                  'rgba(0, 0, 0, 0.3)',
                  'rgba(255, 107, 53, 0.05)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientOverlay}
              >
                <View style={styles.goalCardContent}>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskRow}>
                      <Animated.View
                        style={[
                          styles.completionIcon,
                          {
                            transform: [{
                              scale: pulseAnim.interpolate({
                                inputRange: [1, 1.05],
                                outputRange: [1, 1.2]
                              })
                            }]
                          }
                        ]}
                      >
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      </Animated.View>
                      <View style={styles.taskTitleContainer}>
                        <Text style={[styles.goalTitle, isTablet && styles.goalTitleTablet]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text style={styles.taskDescription} numberOfLines={1}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {/* Priority indicator */}
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityGlow(item.priority) }]}>
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardMeta}>
                    {/* Date with enhanced styling */}
                    <View style={styles.dateContainer}>
                      <Ionicons name="time-outline" size={14} color="#FF6B35" />
                      <Text style={styles.dateText}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    
                    {/* Category tag if available */}
                    {item.category && (
                      <View style={styles.categoryTag}>
                        <Ionicons 
                          name={getCategoryIcon(item.category)} 
                          size={12} 
                          color="rgba(255, 255, 255, 0.8)" 
                        />
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                    )}
                  </View>

                  {/* Sparkle effect overlay */}
                  <Animated.View 
                    style={[
                      styles.sparkleOverlay,
                      {
                        opacity: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.3]
                        })
                      }
                    ]}
                  >
                    <Ionicons name="sparkles" size={16} color="#FF6B35" style={styles.sparkle1} />
                    <Ionicons name="sparkles" size={12} color="#4CAF50" style={styles.sparkle2} />
                    <Ionicons name="sparkles" size={10} color="#FF6B35" style={styles.sparkle3} />
                  </Animated.View>
                </View>
              </LinearGradient>
            </GlassCard>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Connection line to timeline */}
      <Animated.View 
        style={[
          styles.connectionLine,
          isLeft ? styles.connectionLineLeft : styles.connectionLineRight,
          {
            backgroundColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 107, 53, 0.4)', getPriorityGlow(item.priority)]
            })
          }
        ]} 
      />
    </Animated.View>
  );

  function getCategoryIcon(category: string): any {
    switch (category?.toLowerCase()) {
      case 'work': return 'briefcase-outline';
      case 'personal': return 'person-outline';
      case 'health': return 'fitness-outline';
      case 'learning': return 'school-outline';
      case 'finance': return 'card-outline';
      case 'creative': return 'color-palette-outline';
      default: return 'flag-outline';
    }
  }
};

export default function Timeline() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const scrollViewRef = useRef<ScrollView>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Load VT323 font for the title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  // Fetch goals and transform into timeline items
  useEffect(() => {
    fetchGoalsAndTasks();
  }, []);

  useEffect(() => {
    // Animate header on mount
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchGoalsAndTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch goals
      const goalsResponse = await fetch(API.goals);
      const goalsData = await goalsResponse.json();
      

      console.log("Fetched goals:", goalsData);
      if (goalsResponse.ok) {
        console.log("Goals fetched successfully:", goalsData);
        setGoals(goalsData);
        
        // Transform goals into timeline items
        const timeline = createTimelineFromGoals(goalsData);
        setTimelineItems(timeline);
      } else {
        console.error("Failed to fetch goals:", goalsResponse.status);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTimelineFromGoals = (goalsData: any[]): TimelineItem[] => {
    const items: TimelineItem[] = [];
    
    // Collect all completed tasks from all goals
    goalsData.forEach((goal) => {
      if (goal.tasks) {
        goal.tasks.forEach((task: Task) => {
          if (task.completed) {
            items.push({
              id: task.id,
              type: 'goal',
              title: task.title,
              description: task.description,
              date: task.createdAt || new Date().toISOString(),
              priority: task.priority,
              category: goal.category,
              icon: 'checkmark-circle',
              color: getPriorityColor(task.priority),
              completed: true,
            });
          }
        });
      }
    });
    
    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCategoryIcon = (category?: string): string => {
    switch (category?.toLowerCase()) {
      case 'work': return 'briefcase-outline';
      case 'personal': return 'person-outline';
      case 'health': return 'fitness-outline';
      case 'learning': return 'school-outline';
      case 'finance': return 'card-outline';
      case 'creative': return 'color-palette-outline';
      default: return 'flag-outline';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'HIGH': return '#FF4444';
      case 'MEDIUM': return '#FF6B35';
      case 'LOW': return '#4CAF50';
      default: return '#FF6B35';
    }
  };

  const getFilteredItems = () => {
    if (filterPriority === 'ALL') return timelineItems;
    return timelineItems.filter(item => item.priority === filterPriority);
  };

  const handleTaskPress = (item: TimelineItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Could add task detail view here in the future
  };

  const handleAICoachPress = () => {
    router.push('/(tabs)/ai-assistant');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  if (!fontsLoaded) return null;

  const filteredItems = getFilteredItems();

  return (
    <AppLayout showChatbox={false}>
      <LinearGradient
        colors={['rgba(255,107,53,0.12)', '#232323', '#181818', 'rgba(76,175,80,0.08)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Enhanced Top Navigation */}
          <Animated.View 
            style={[
              styles.topNav,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.aiCoachButton}
              onPress={handleAICoachPress}
              activeOpacity={0.7}
            >
              <View style={styles.aiCoachButtonContainer}>
                <Ionicons name="sparkles" size={20} color="#FF6B35" />
              </View>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Animated.Text 
                style={[
                  styles.nudgrTitle,
                  {
                    transform: [{
                      scale: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }]
                  }
                ]}
              >
                timeline
              </Animated.Text>
              <Text style={styles.subtitle}>your journey of achievement</Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <View style={styles.profileButtonContainer}>
                <Ionicons name="person-circle" size={24} color="#FF6B35" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Enhanced Filter Section */}
          <Animated.View 
            style={[
              styles.filterSection,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.filterTitle}>Filter by Priority</Text>
            <View style={styles.filterContainer}>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterButton,
                    filterPriority === priority && styles.filterButtonActive,
                    { backgroundColor: priority !== 'ALL' ? getPriorityColor(priority) + '20' : 'rgba(255, 107, 53, 0.1)' }
                  ]}
                  onPress={() => setFilterPriority(priority)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText,
                    filterPriority === priority && styles.filterTextActive
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View 
            style={[
              styles.statsSection,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statNumber}>{timelineItems.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {timelineItems.filter(item => item.priority === 'HIGH').length}
                </Text>
                <Text style={styles.statLabel}>High Priority</Text>
              </GlassCard>
              <GlassCard style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {new Set(timelineItems.map(item => item.category)).size}
                </Text>
                <Text style={styles.statLabel}>Categories</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading your achievements...</Text>
            </View>
          ) : (
            <>
              {/* Enhanced Timeline */}
              <View style={styles.timelineContainer}>
                {/* Enhanced timeline line with gradient */}
                <LinearGradient
                  colors={['#FF6B35', 'rgba(255, 107, 53, 0.6)', '#4CAF50', 'rgba(76, 175, 80, 0.3)']}
                  style={styles.timelineLine}
                />
                
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <TimelineNode
                      key={item.id}
                      item={item}
                      index={index}
                      isLeft={index % 2 === 0}
                      onPress={() => handleTaskPress(item)}
                      timelineItems={filteredItems}
                    />
                  ))
                ) : (
                  <View style={styles.emptyTimeline}>
                    <Animated.View 
                      style={[
                        styles.emptyIconContainer,
                        {
                          transform: [{
                            scale: headerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1]
                            })
                          }]
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={['rgba(255, 107, 53, 0.3)', 'rgba(76, 175, 80, 0.3)']}
                        style={styles.emptyIconGradient}
                      >
                        <Ionicons name="checkmark-circle-outline" size={64} color="rgba(255, 255, 255, 0.8)" />
                      </LinearGradient>
                    </Animated.View>
                    <Text style={styles.emptyTitle}>No completed tasks yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Complete some tasks to see your timeline flourish
                    </Text>
                  </View>
                )}
              </View>
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
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 100,
  },
  // Enhanced Top Navigation
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  aiCoachButton: {
    alignItems: 'flex-start',
  },
  aiCoachButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nudgrTitle: {
    fontSize: isTablet ? 40 : 32,
    fontWeight: '400',
    color: '#fff',
    fontFamily: 'VT323',
    letterSpacing: 2,
    textTransform: 'lowercase',
    textShadowColor: 'rgba(255, 107, 53, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  profileButton: {
    alignItems: 'flex-end',
  },
  profileButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Enhanced Filter Section
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: isTablet ? 'center' : 'flex-start',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: isTablet ? 100 : 80,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  statNumber: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Inter',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Enhanced Timeline
  timelineContainer: {
    paddingHorizontal: isTablet ? 48 : 24,
    paddingBottom: 100,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: isTablet ? 72 : 48,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    zIndex: 0,
  },
  
  // Enhanced Timeline Nodes
  timelineNodeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    alignItems: 'flex-start',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  timelineNodeLeft: {
    alignItems: 'flex-start',
  },
  timelineNodeRight: {
    alignItems: 'flex-end',
  },
  touchableArea: {
    width: '100%',
  },
  cardGlowContainer: {
    shadowOffset: { width: 0, height: 4 },
  },
  timelineItemWrapper: {
    flex: 1,
    marginLeft: isTablet ? 56 : 40,
    maxWidth: isTablet ? screenWidth * 0.4 : screenWidth - 120,
  },
  goalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  goalCardTablet: {
    borderRadius: 20,
  },
  cardGradientOverlay: {
    borderRadius: 16,
  },
  goalCardContent: {
    padding: isTablet ? 20 : 16,
    position: 'relative',
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionIcon: {
    marginRight: 12,
  },
  taskTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    lineHeight: isTablet ? 24 : 22,
  },
  goalTitleTablet: {
    fontSize: 20,
  },
  taskDescription: {
    fontSize: isTablet ? 14 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    marginTop: 4,
    lineHeight: 16,
  },
  priorityBadge: {
    position: 'absolute',
    top: isTablet ? 20 : 16,
    right: isTablet ? 20 : 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: isTablet ? 14 : 12,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    textTransform: 'capitalize',
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle1: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  sparkle3: {
    position: 'absolute',
    top: '50%',
    left: 8,
  },
  connectionLine: {
    position: 'absolute',
    top: 24,
    width: isTablet ? 32 : 24,
    height: 3,
    borderRadius: 1.5,
    zIndex: 1,
  },
  connectionLineLeft: {
    right: -isTablet ? 56 : 40,
  },
  connectionLineRight: {
    left: -isTablet ? 56 : 40,
  },
  
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: '#FF6B35',
    fontSize: isTablet ? 18 : 16,
    marginTop: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 32,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  // Original styles (keeping for backward compatibility)
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
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  chatContainer: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messagesContainer: {
    maxHeight: 200,
    marginBottom: 8,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginVertical: 2,
    padding: 8,
    maxWidth: '80%',
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
    borderRadius: 12,
    marginVertical: 2,
    padding: 8,
    maxWidth: '80%',
  },
  msgText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#181818',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter',
    marginRight: 8,
  },
  sendBtn: {
    minWidth: 60,
  },

});
