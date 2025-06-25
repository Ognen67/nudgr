import { ENDPOINTS, API_BASE_URL } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoidingWrapper from './KeyboardAvoidingWrapper';
// import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { TaskPreviewModal } from '@/components/TaskPreviewModal';

interface AppLayoutProps {
  children: React.ReactNode;
  showChatbox?: boolean;
}

// Enhanced Glass Chat Component
const GlassChat: React.FC<{
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
  loading?: boolean;
}> = ({
  chatMessage,
  setChatMessage,
  onSendMessage,
  loading = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const translateY = useRef(new Animated.Value(0)).current;
    const borderRadius = useRef(new Animated.Value(0)).current;
    const marginHorizontal = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;
    const pulseGlow = useRef(new Animated.Value(0)).current;
    
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
                  <TextInput
                    style={[
                      styles.chatInput,
                      isFocused && styles.chatInputFocused,
                    ]}
                    placeholder={isRecording ? "Listening..." : "your thoughts go here..."}
                    placeholderTextColor={isRecording ? "#FF6B35" : "rgba(255, 255, 255, 0.4)"}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={onSendMessage}
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
                      onPress={loading ? undefined : onSendMessage}
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
  const router = useRouter();

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !loading) {
      // Reset goal ID for new thought
      setCurrentGoalId(null);
      setCurrentThought(chatMessage);
      setShowTaskPreview(true);
      setChatMessage('');
    }
  };

  const handleTaskDecision = async (taskId: string, keep: boolean, taskData?: any, goalData?: any) => {
    console.log(`Task ${taskId} ${keep ? 'kept' : 'rejected'} - Demo mode, no database operations`);
    
    // For demo purposes - just log and continue smoothly
    if (keep && taskData && goalData) {
      console.log('Demo: Would create goal:', goalData.title);
      console.log('Demo: Would save task:', taskData.title);
    } else {
      console.log('Demo: Task skipped');
    }
  };

  const handleAllTasksProcessed = async (finalKeptTasks: any[], goal?: any) => {
    setKeptTasks(finalKeptTasks);
    
    // Demo mode - just show completion message without database operations
    if (finalKeptTasks.length === 0) {
      Alert.alert(
        'Demo Complete',
        'No tasks were selected in this demo.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } else {
      const goalTitle = goal ? goal.title : 'your goal';
      Alert.alert(
        'Demo Complete! 🎯',
        `You selected ${finalKeptTasks.length} tasks for "${goalTitle}". In the real app, these would be saved to your goals!`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
          animated={true}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {children}
        </View>
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
});