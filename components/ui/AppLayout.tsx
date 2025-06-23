import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import KeyboardAvoidingWrapper from './KeyboardAvoidingWrapper';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface AppLayoutProps {
  children: React.ReactNode;
  showChatbox?: boolean;
}

// Enhanced Glass Chat Component
const GlassChat: React.FC<{
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
  onVoicePress: () => void;
  loading?: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
}> = ({
  chatMessage,
  setChatMessage,
  onSendMessage,
  onVoicePress,
  loading = false,
  isRecording = false,
  isTranscribing = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const translateY = useRef(new Animated.Value(0)).current;
    const borderRadius = useRef(new Animated.Value(0)).current;
    const marginHorizontal = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

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
        {/* Glowy border */}
        <Animated.View
          pointerEvents="none"
          style={[
            { ...StyleSheet.absoluteFillObject },
            {
              opacity: glowOpacity,
              borderRadius,
              borderWidth: 2,
              borderColor: 'rgba(255,107,53,0.7)',
              shadowColor: '#FF6B35',
              shadowOpacity: 0.7,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 0 },
              zIndex: 2,
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
                    placeholder="your thoughts go here..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={onSendMessage}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="send"
                    multiline
                    textAlignVertical="center"
                  />
                  {chatMessage.trim() ? (
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
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.voiceButton,
                        (isRecording || isTranscribing) && styles.voiceButtonRecording
                      ]}
                      onPress={onVoicePress}
                      activeOpacity={0.8}
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? (
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={20}
                          color="#FFFFFF"
                        />
                      ) : (
                        <Ionicons
                          name={isRecording ? "stop" : "mic"}
                          size={20}
                          color={(isRecording || isTranscribing) ? "#FFFFFF" : "#FF6B35"}
                        />
                      )}
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
  const router = useRouter();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoiceRecording();

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !loading) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/ai/transform-thought-to-goal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thought: chatMessage
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Goal and tasks created successfully:', data);
          setChatMessage('');

          // Show success message
          Alert.alert(
            'Success! 🎯',
            `Created goal "${data.createdGoal?.title}" with ${data.createdTasks?.length || 0} tasks!`,
            [
              {
                text: 'View in Reflect',
                onPress: () => router.push('/(tabs)/goals'),
                style: 'default'
              },
              {
                text: 'Stay Here',
                style: 'cancel'
              }
            ]
          );
        } else {
          console.error('Error creating goal and tasks:', data.error);
          Alert.alert('Error', data.error || 'Failed to process your thought. Please try again.');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  const handleVoicePress = async () => {
    if (isTranscribing) {
      return; // Don't allow interaction while transcribing
    }

    if (isRecording) {
      // Stop recording and get transcription
      try {
        const transcription = await stopRecording();
        if (transcription) {
          setChatMessage(transcription);
        } else {
          Alert.alert('Error', 'Failed to transcribe your voice. Please try again.');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to process your voice recording. Please try again.');
      }
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (error) {
        console.error('Error starting recording:', error);
        if (error.message.includes('permission')) {
          Alert.alert(
            'Microphone Permission Required',
            'Please enable microphone access in your device settings to use voice recording.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => {
                // On iOS, this would open settings
                // Linking.openSettings() could be used here
              }}
            ]
          );
        } else {
          Alert.alert('Error', 'Failed to start voice recording. Please try again.');
        }
      }
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
              onVoicePress={handleVoicePress}
              loading={loading}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
            />
          )}
        </KeyboardAvoidingWrapper>
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
    // paddingBottom: Platform.OS === 'ios' ? 140 : 120, // Space for chat + tab bar
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
    marginLeft: 8,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 8,
  },
  voiceButtonRecording: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF8A65',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
}); 