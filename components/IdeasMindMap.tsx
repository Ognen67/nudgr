import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ENDPOINTS } from '@/utils/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Idea {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  position: { x: number; y: number };
  color: string;
  expanded: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IdeaNodeProps {
  idea: Idea;
  onPress: (idea: Idea) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

const IdeaNode: React.FC<IdeaNodeProps> = ({ idea, onPress, onPositionChange }) => {
  const pan = useRef(new Animated.ValueXY({ x: idea.position.x, y: idea.position.y })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Scale up animation
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        
        // Scale back animation
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Calculate final position
        const newX = Math.max(0, Math.min(screenWidth - 120, idea.position.x + gestureState.dx));
        const newY = Math.max(50, Math.min(screenHeight - 200, idea.position.y + gestureState.dy));
        
        // Update position
        pan.setOffset({ x: newX, y: newY });
        pan.setValue({ x: 0, y: 0 });
        
        onPositionChange(idea.id, { x: newX, y: newY });
      },
    })
  ).current;

  const handlePress = () => {
    if (!isDragging) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress(idea);
    }
  };

  return (
    <Animated.View
      style={[
        styles.ideaNode,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scaleAnim },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.ideaNodeTouchable}
      >
        <LinearGradient
          colors={[idea.color, `${idea.color}CC`]}
          style={styles.ideaNodeGradient}
        >
          <View style={styles.ideaNodeContent}>
            <Text style={styles.ideaNodeTitle} numberOfLines={2}>
              {idea.title}
            </Text>
            {idea.expanded && (
              <View style={styles.expandedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface IdeaDetailModalProps {
  visible: boolean;
  idea: Idea | null;
  onClose: () => void;
  onExpand: (idea: Idea) => void;
  onForget: (idea: Idea) => void;
}

const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  visible,
  idea,
  onClose,
  onExpand,
  onForget,
}) => {
  if (!idea) return null;

  const handleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onExpand(idea);
    onClose();
  };

  const handleForget = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Forget Idea',
      'Are you sure you want to forget this idea? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Forget', 
          style: 'destructive',
          onPress: () => {
            onForget(idea);
            onClose();
          }
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <BlurView intensity={60} tint="dark" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(255,107,53,0.1)', '#2A2A2A', '#1E1E1E']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={[styles.modalColorDot, { backgroundColor: idea.color }]} />
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {idea.title}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.modalBody}>
                <Text style={styles.modalContentText}>
                  {idea.content}
                </Text>
                
                {idea.description && (
                  <Text style={styles.modalDescriptionText}>
                    {idea.description}
                  </Text>
                )}

                {idea.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {idea.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.expandButton]}
                  onPress={handleExpand}
                  activeOpacity={0.8}
                  disabled={idea.expanded}
                >
                  <LinearGradient
                    colors={idea.expanded ? ['#666666', '#888888'] : ['#FF6B35', '#FF8C42']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons 
                      name={idea.expanded ? "checkmark-circle" : "trending-up"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.actionButtonText}>
                      {idea.expanded ? 'Expanded' : 'Expand'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.forgetButton]}
                  onPress={handleForget}
                  activeOpacity={0.8}
                >
                  <View style={styles.forgetButtonContent}>
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                    <Text style={styles.forgetButtonText}>Forget</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export const IdeasMindMap: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.IDEAS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      
      const ideasData = await response.json();
      setIdeas(ideasData);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      Alert.alert('Error', 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaPress = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowModal(true);
  };

  const handlePositionChange = async (id: string, position: { x: number; y: number }) => {
    try {
      // Optimistically update local state
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === id ? { ...idea, position } : idea
        )
      );

      // Update position in backend
      await fetch(`${ENDPOINTS.IDEAS}/${id}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(position),
      });
    } catch (error) {
      console.error('Error updating idea position:', error);
      // Revert optimistic update on error
      fetchIdeas();
    }
  };

  const handleExpand = async (idea: Idea) => {
    try {
      const response = await fetch(`${ENDPOINTS.IDEAS}/${idea.id}/expand`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to expand idea');
      }

      const result = await response.json();
      
      // Update local state
      setIdeas(prevIdeas =>
        prevIdeas.map(i =>
          i.id === idea.id ? { ...i, expanded: true } : i
        )
      );

      Alert.alert(
        '🎯 Idea Expanded!',
        `Your idea has been expanded into a goal: "${result.goal.title}"`,
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Error expanding idea:', error);
      Alert.alert('Error', 'Failed to expand idea into goal');
    }
  };

  const handleForget = async (idea: Idea) => {
    try {
      const response = await fetch(`${ENDPOINTS.IDEAS}/${idea.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      // Remove from local state
      setIdeas(prevIdeas => prevIdeas.filter(i => i.id !== idea.id));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error deleting idea:', error);
      Alert.alert('Error', 'Failed to forget idea');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your mind...</Text>
      </View>
    );
  }

  if (ideas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bulb-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
        <Text style={styles.emptyTitle}>Your Mind is Clear</Text>
        <Text style={styles.emptySubtitle}>
          Switch the chat to "idea mode" and start capturing your thoughts
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mind Map Background */}
      <View style={styles.mindMapContainer}>
        {ideas.map((idea) => (
          <IdeaNode
            key={idea.id}
            idea={idea}
            onPress={handleIdeaPress}
            onPositionChange={handlePositionChange}
          />
        ))}
      </View>

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        visible={showModal}
        idea={selectedIdea}
        onClose={() => setShowModal(false)}
        onExpand={handleExpand}
        onForget={handleForget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  mindMapContainer: {
    flex: 1,
    position: 'relative',
  },
  ideaNode: {
    position: 'absolute',
    width: 120,
    zIndex: 1,
  },
  ideaNodeTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ideaNodeGradient: {
    padding: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  ideaNodeContent: {
    position: 'relative',
  },
  ideaNodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter',
  },
  expandedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
  },
  modalBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalContentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  modalDescriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  expandButton: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  forgetButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  forgetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  forgetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4444',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
}); 