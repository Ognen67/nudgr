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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

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



// Timeline node component
const TimelineNode: React.FC<{
  item: TimelineItem;
  index: number;
  isLeft: boolean;
  onPress: () => void;
  timelineItems: TimelineItem[];
}> = ({ item, index, isLeft, onPress, timelineItems }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(isLeft ? -50 : 50)).current;

  useEffect(() => {
    const delay = index * 200;
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [index]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    onPress();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <Animated.View
      style={[
        styles.timelineNodeContainer,
        isLeft ? styles.timelineNodeLeft : styles.timelineNodeRight,
        {
          transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.timelineItemWrapper}>
          {/* Task card */}
          <GlassCard style={styles.goalCard}>
            <View style={styles.goalCardContent}>
              <View style={styles.taskRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.goalTitle}>{item.title}</Text>
              </View>
              
              {/* Date */}
              <Text style={styles.dateText}>
                {formatDate(item.date)}
              </Text>
            </View>
          </GlassCard>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Timeline() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Load VT323 font for the title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  // Fetch goals and transform into timeline items
  useEffect(() => {
    fetchGoalsAndTasks();
  }, []);

  const fetchGoalsAndTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch goals using the centralized endpoint
      const goalsResponse = await fetch(ENDPOINTS.GOALS);
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
              type: 'goal', // Keep as 'goal' to maintain existing component structure
              title: task.title,
              date: task.createdAt || new Date().toISOString(),
              priority: task.priority,
              icon: 'checkmark-circle',
              color: '#4CAF50',
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
      case 'work': return 'briefcase';
      case 'personal': return 'person';
      case 'health': return 'fitness';
      case 'learning': return 'school';
      case 'finance': return 'card';
      case 'creative': return 'color-palette';
      default: return 'target';
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleTaskPress = (item: TimelineItem) => {
    // Could add task detail view here in the future
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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


        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
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
              <Text style={styles.nudgrTitle}>timeline</Text>
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

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Timeline */}
              <View style={styles.timelineContainer}>
                {/* Central timeline line */}
                <View style={styles.timelineLine} />
                
                {timelineItems.length > 0 ? (
                  timelineItems.map((item, index) => (
                    <TimelineNode
                      key={item.id}
                      item={item}
                      index={index}
                      isLeft={false}
                      onPress={() => handleTaskPress(item)}
                      timelineItems={timelineItems}
                    />
                  ))
                ) : (
                  <View style={styles.emptyTimeline}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons name="checkmark-circle-outline" size={48} color="rgba(255, 107, 53, 0.6)" />
                    </View>
                    <Text style={styles.emptyTitle}>No completed tasks</Text>
                    <Text style={styles.emptySubtitle}>
                      Complete some tasks to see them here
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
    paddingTop: 30,
  },
  // Top Navigation - matching home page
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
  suggestionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionIcon: {
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
  suggestionContent: {
    flex: 1,
  },
  // Timeline specific styles
  timelineHeader: {
    paddingHorizontal: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: 1,
  },
  timelineTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  timelineSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timelineContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  timelineLine: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.4)',
    zIndex: 0,
  },
  timelineNodeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  timelineNodeLeft: {
    alignItems: 'flex-start',
  },
  timelineNodeRight: {
    alignItems: 'flex-end',
  },
  timelineItemWrapper: {
    flex: 1,
    marginLeft: 32,
    maxWidth: "100%"
  },
  itemLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  itemRight: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  stepCircle: {
    position: 'absolute',
    left: 14,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  goalCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
    maxWidth: screenWidth - 100,
  },
  goalCardContent: {
    padding: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: 8,
    flex: 1,
  },
  goalDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    lineHeight: 16,
    marginBottom: 10,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    minWidth: 24,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
  },
  dateText: {
    fontSize: 10,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
  },
  // Original timeline styles (kept for backward compatibility)
  connectionLine: {
    position: 'absolute',
    top: 20,
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
    zIndex: 1,
  },
  connectionLineLeft: {
    right: -22,
  },
  connectionLineRight: {
    left: -22,
  },
  timelineDot: {
    position: 'absolute',
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    left: '50%',
    marginLeft: -20,
  },
  timelineDotInner: {
    flex: 1,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    borderLeftWidth: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardBlur: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    marginRight: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: '#FF6B35',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 24,
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