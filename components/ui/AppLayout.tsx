import { ENDPOINTS } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoidingWrapper from './KeyboardAvoidingWrapper';
// import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { TaskPreviewModal } from '@/components/TaskPreviewModal';
import { useRefresh } from '@/contexts/RefreshContext';
import { TaskPreviewProvider } from '@/contexts/TaskPreviewContext';
import { registerTaskPreviewTrigger, unregisterTaskPreviewTrigger } from '@/utils/taskPreviewService';
import * as Haptics from 'expo-haptics';

interface AppLayoutProps {
  children: React.ReactNode;
  showChatbox?: boolean;
}

// Chat mode type
type ChatMode = 'idea'; // Changed from 'goal' | 'idea' to just 'idea'

// Enhanced Glass Chat Component
const GlassChat: React.FC<{
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
  onIdeaSubmit: (ideaText: string) => void;
  loading?: boolean;
}> = ({
  chatMessage,
  setChatMessage,
  onSendMessage,
  onIdeaSubmit,
  loading = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const mode: ChatMode = 'idea'; // Locked to idea mode
    const translateY = useRef(new Animated.Value(0)).current;
    const borderRadius = useRef(new Animated.Value(0)).current;
    const marginHorizontal = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;
    const pulseGlow = useRef(new Animated.Value(0)).current;
    // Removed modeColorAnim as it's no longer needed
    
    // Voice recording hook - commented out for Expo Go compatibility
    // const {
    //   isRecording,
    //   isTranscribing,
    //   startRecording,
    //   stopRecording,
    //   recognizedText
    // } = useVoiceRecording();
    
    // Temporary fallback values for Expo Go
    const isRecording = false;
    const isTranscribing = false;
    const startRecording = async () => {};
    const stopRecording = async () => null;
    const recognizedText = '';

    const handleFocus = () => {
      setIsFocused(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20,
          delay: 0
        }),
        Animated.spring(borderRadius, {
          toValue: 20,
          useNativeDriver: false,
          tension: 50,
          friction: 20,
          delay: 0
        }),
        Animated.spring(marginHorizontal, {
          toValue: 24,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
          delay: 0
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 350,
          delay: 0,
          useNativeDriver: false
        })
      ]).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.spring(borderRadius, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.spring(marginHorizontal, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        })
      ]).start();
    };

    const handleVoicePress = async () => {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      try {
        if (isRecording) {
          // Stop recording
          const transcribedText = await stopRecording();
          if (transcribedText) {
            const newMessage = chatMessage ? `${chatMessage} ${transcribedText}` : transcribedText;
            setChatMessage(newMessage);
          }
        } else {
          // Start recording
          await startRecording();
        }
      } catch (error) {
        console.error('Voice recording error:', error);
        Alert.alert(
          'Voice Recording Error',
          'Failed to use voice recording. Please check your microphone permissions.',
          [{ text: 'OK' }]
        );
      }
    };

    // Removed toggleMode function as it's no longer needed

    const handleSubmit = () => {
      if (loading || !chatMessage.trim()) return; // Prevent submission if loading or empty
      
      // Always submit as idea since mode is locked to 'idea'
      const currentMessage = chatMessage;
      setChatMessage(''); // Clear input immediately
      onIdeaSubmit(currentMessage);
    };

    const getPlaceholderText = () => {
      if (isRecording) return "Listening...";
      return "capture your ideas..."; // Always show idea placeholder
    };

    // Removed getModeColor function as it's no longer needed

    return (
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [{ translateY }],
            marginHorizontal,
            backgroundColor: 'transparent',
          }
        ]}
      >
        {/* Outer Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            { ...StyleSheet.absoluteFillObject },
            {
              opacity: glowOpacity,
              borderRadius,
              shadowColor: '#FF6B35',
              shadowOpacity: 0.4,
              shadowRadius: 35,
              shadowOffset: { width: 0, height: 0 },
              zIndex: 1,
            },
          ]}
        />
        
        {/* Middle Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            { ...StyleSheet.absoluteFillObject },
            {
              opacity: glowOpacity,
              borderRadius,
              shadowColor: '#FF6B35',
              shadowOpacity: 0.8,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              zIndex: 2,
            },
          ]}
        />
        
        {/* Orange Border with Inner Glow */}
        <Animated.View
          pointerEvents="none"
          style={[
            { ...StyleSheet.absoluteFillObject },
            {
              opacity: glowOpacity,
              borderRadius,
              borderWidth: 2,
              borderColor: '#FF6B35',
              shadowColor: '#FF6B35',
              shadowOpacity: 1.0,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
              zIndex: 3,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.chatBlur,
            {
              borderRadius,
              overflow: 'hidden',
            }
          ]}
        >
          <BlurView
            intensity={60}
            tint="dark"
            style={styles.blurViewStyle}
          >
            <View style={styles.chatOverlay}>
              <View style={styles.chatContent}>
                <View style={styles.chatInputRow}>
                  {/* Removed Mode Toggle Button */}

                  <TextInput
                    style={[
                      styles.chatInput,
                      isFocused && styles.chatInputFocused,
                      { flex: 1 }, // Removed marginLeft since no toggle button
                    ]}
                    placeholder={getPlaceholderText()}
                    placeholderTextColor={isRecording ? "#FF6B35" : "rgba(255, 255, 255, 0.4)"}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={handleSubmit}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="send"
                    multiline
                    textAlignVertical="center"
                    editable={!isRecording}
                  />
                  
                  {/* Voice Recording Button - Only show when text field is empty */}
                  {chatMessage.trim().length === 0 && (
                    <TouchableOpacity
                      style={[
                        styles.voiceButton, 
                        isRecording && styles.voiceButtonRecording,
                        isTranscribing && styles.voiceButtonTranscribing
                      ]}
                      onPress={handleVoicePress}
                      activeOpacity={0.7}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={
                          isRecording 
                            ? ['#FF4444', '#FF6666'] 
                            : isTranscribing 
                              ? ['#FFA500', '#FFB347']
                              : ['rgba(255, 107, 53, 0.2)', 'rgba(255, 107, 53, 0.3)']
                        }
                        style={styles.voiceButtonGradient}
                      >
                        {isTranscribing ? (
                          <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
                        ) : isRecording ? (
                          <Ionicons name="stop" size={18} color="#FFFFFF" />
                        ) : (
                          <Ionicons name="mic" size={18} color="#FF6B35" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  
                  {/* Send Button - Only show when there's text */}
                  {chatMessage.trim().length > 0 && (
                    <TouchableOpacity
                      style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                      onPress={loading ? undefined : handleSubmit}
                      activeOpacity={loading ? 1 : 0.7}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={loading ? ['#666666', '#888888'] : ['#FF6B35', '#FF8A65']}
                        style={styles.sendButtonGradient}
                      >
                        {loading ? (
                          <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
                        ) : (
                          <Ionicons name="send" size={18} color="#FFFFFF" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    );
  };

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showChatbox = true }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTaskPreview, setShowTaskPreview] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [keptTasks, setKeptTasks] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    goalTitle: string;
    taskCount: number;
    hasNoTasks: boolean;
  } | null>(null);
  const [showIdeaSuccessModal, setShowIdeaSuccessModal] = useState(false);
  const [ideaSuccessData, setIdeaSuccessData] = useState<{
    ideaTitle: string;
    ideaDescription: string;
  } | null>(null);
  const router = useRouter();
  const { triggerIdeasRefresh, triggerGoalsRefresh } = useRefresh();

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !loading) {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Reset goal ID for new thought
      setCurrentGoalId(null);
      setCurrentThought(chatMessage);
      setShowTaskPreview(true);
      setChatMessage('');
    }
  };

  const handleIdeaSubmit = async (ideaText: string) => {
    if (ideaText.trim() && !loading) {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      try {
        setLoading(true);
        
        // Create the idea via API
        const response = await fetch(ENDPOINTS.IDEAS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: ideaText.slice(0, 50), // Use first 50 chars as title
            content: ideaText,
            description: ideaText.length > 50 ? ideaText.slice(51, 200) : null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save idea');
        }

        const idea = await response.json();
        console.log('Idea saved:', idea);
        
        // Show styled success popup
        setIdeaSuccessData({
          ideaTitle: idea.title,
          ideaDescription: idea.description || idea.content || 'Your idea has been captured!'
        });
        setShowIdeaSuccessModal(true);
        
        // Trigger ideas refresh in any open Ideas3DMindMap components
        triggerIdeasRefresh();
        
      } catch (error) {
        console.error('Error saving idea:', error);
        Alert.alert('Error', 'Failed to save idea. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTaskDecision = async (taskId: string, keep: boolean, taskData?: any, goalData?: any) => {
    console.log(`Task ${taskId} ${keep ? 'kept' : 'rejected'} - Task already saved to database`);
    
    // Tasks are already saved to database when goal was created
    // This is just for tracking user decisions
    if (keep && taskData && goalData) {
      console.log('Task kept for goal:', goalData.title, '- Task:', taskData.title);
      console.log('Task ID in database:', taskId);
    } else {
      console.log('Task rejected - can be marked as declined in database if needed');
    }
  };

  const handleAllTasksProcessed = async (finalKeptTasks: any[], goal?: any) => {
    setKeptTasks(finalKeptTasks);
    
    // Prepare success modal data
    const goalTitle = goal ? goal.title : 'your goal';
    setSuccessData({
      goalTitle,
      taskCount: finalKeptTasks.length,
      hasNoTasks: finalKeptTasks.length === 0
    });
    
    setShowSuccessModal(true);
    
    // Trigger goals refresh after successful goal creation
    if (goal) {
      triggerGoalsRefresh();
    }
  };

  const handleGoToReflect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSuccessModal(false);
    setShowTaskPreview(false);
    router.push('/(tabs)/goals');
  };

  const handleCloseSuccess = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSuccessModal(false);
    setShowTaskPreview(false);
  };

  const handleCloseIdeaSuccess = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowIdeaSuccessModal(false);
    setIdeaSuccessData(null);
  };

  const handleViewIdeas = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowIdeaSuccessModal(false);
    setIdeaSuccessData(null);
    // Navigate to ideas tab
    router.push('/(tabs)/ideas-3d');
  };

  const triggerTaskPreview = (thought: string) => {
    console.log('AppLayout triggerTaskPreview called with thought:', thought);
    setCurrentThought(thought);
    setShowTaskPreview(true);
    console.log('TaskPreviewModal should now be visible');
  };

  // Register the trigger function globally when component mounts
  React.useEffect(() => {
    console.log('AppLayout: Registering task preview trigger');
    registerTaskPreviewTrigger(triggerTaskPreview);
    return () => {
      console.log('AppLayout: Unregistering task preview trigger');
      unregisterTaskPreviewTrigger();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#272727"
          translucent={false}
          animated={true}
        />

        {/* Main Content */}
        <TaskPreviewProvider triggerTaskPreview={triggerTaskPreview}>
          <View style={styles.content}>
            {children}
          </View>
        </TaskPreviewProvider>
        <KeyboardAvoidingWrapper
          style={styles.keyboardWrapper}
          innerStyle={styles.keyboardInner}
        >
          {/* Glass Chat Component - Only show if showChatbox is true */}
                  {showChatbox && (
          <GlassChat
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onSendMessage={handleSendMessage}
            onIdeaSubmit={handleIdeaSubmit}
            loading={loading}
          />
        )}
        </KeyboardAvoidingWrapper>
        
        {/* Task Preview Modal */}
        <TaskPreviewModal
          visible={showTaskPreview}
          onClose={() => setShowTaskPreview(false)}
          onTaskDecision={handleTaskDecision}
          onAllTasksProcessed={handleAllTasksProcessed}
          thought={currentThought}
        />

        {/* Success Modal */}
        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.successModalContainer}>
            <BlurView intensity={80} tint="dark" style={styles.successModalBlur}>
              <View style={styles.successModalContent}>
                <LinearGradient
                  colors={['rgba(255,107,53,0.15)', '#2A2A2A', '#1E1E1E']}
                  style={styles.successModalGradient}
                >
                  {/* Success Icon */}
                  <View style={styles.successIconContainer}>
                    <LinearGradient
                      colors={['#FF6B35', '#FF8C42']}
                      style={styles.successIconGradient}
                    >
                      <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  </View>

                  {/* Success Content */}
                  <Text style={styles.successTitle}>
                    {successData?.hasNoTasks ? 'Goal Created! 🎯' : 'Success! 🎯'}
                  </Text>
                  
                  <Text style={styles.successMessage}>
                    {successData?.hasNoTasks 
                      ? 'Your goal has been saved to the database. You can review and add tasks later.'
                      : `Your goal "${successData?.goalTitle}" with ${successData?.taskCount} selected tasks has been saved!`
                    }
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.successButtonContainer}>
                    <TouchableOpacity 
                      style={styles.viewGoalButton}
                      onPress={handleGoToReflect}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#FF6B35', '#FF8C42']}
                        style={styles.viewGoalButtonGradient}
                      >
                        <Ionicons name="eye" size={20} color="#FFFFFF" />
                        <Text style={styles.viewGoalButtonText}>View in Reflect</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={handleCloseSuccess}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </BlurView>
          </View>
        </Modal>

        {/* Idea Success Modal */}
        <Modal visible={showIdeaSuccessModal} transparent animationType="fade">
          <View style={styles.successModalContainer}>
            <BlurView intensity={80} tint="dark" style={styles.successModalBlur}>
              <View style={styles.successModalContent}>
                <LinearGradient
                  colors={['rgba(255,107,53,0.15)', '#2A2A2A', '#1E1E1E']}
                  style={styles.successModalGradient}
                >
                  {/* Success Icon */}
                  <View style={styles.successIconContainer}>
                    <LinearGradient
                      colors={['#FF6B35', '#FF8C42']}
                      style={styles.successIconGradient}
                    >
                      <Ionicons name="bulb" size={32} color="#FFFFFF" />
                    </LinearGradient>
                  </View>

                  {/* Success Content */}
                  <Text style={styles.successTitle}>
                    Idea Created! 💡
                  </Text>
                  
                  <Text style={styles.successMessage}>
                    Your idea "{ideaSuccessData?.ideaTitle}" has been successfully added to your collection!
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.successButtonContainer}>
                    <TouchableOpacity 
                      style={styles.viewGoalButton}
                      onPress={handleViewIdeas}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#FF6B35', '#FF8C42']}
                        style={styles.viewGoalButtonGradient}
                      >
                        <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.viewGoalButtonText}>Explore Ideas</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={handleCloseIdeaSuccess}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </BlurView>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  keyboardInner: {
    padding: 0,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70, // Directly above tab bar
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  chatBlur: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  blurViewStyle: {
    flex: 1,
  },
  chatOverlay: {
    backgroundColor: 'transparent',
    borderWidth: 0,

  },
  chatContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '400',
    paddingVertical: 10,
    paddingRight: 12,
    height: 40,
    overflowY: 'hidden',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  chatInputFocused: {
    fontSize: 17,
    fontWeight: '500',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sendButton: {
    marginLeft: 0,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  voiceButton: {
    marginLeft: 0,
  },
  voiceButtonRecording: {
    opacity: 1,
  },
  voiceButtonTranscribing: {
    opacity: 0.8,
  },
  voiceButtonGradient: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  successModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
  },
  successModalBlur: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 350,
  },
  successModalContent: {
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.4)',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  successModalGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontFamily: 'Inter',
  },
  successButtonContainer: {
    width: '100%',
    gap: 12,
  },
  viewGoalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  viewGoalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  viewGoalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});