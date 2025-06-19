import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
}> = ({ 
  chatMessage, 
  setChatMessage, 
  onSendMessage, 
  onVoicePress
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
        toValue: -20,
        useNativeDriver: true,
        tension: 50,
        friction: 20
      }),
      Animated.spring(borderRadius, {
        toValue: 20,
        useNativeDriver: false,
        tension: 50,
        friction: 20
      }),
      Animated.spring(marginHorizontal, {
        toValue: 24,
        useNativeDriver: false,
        tension: 50,
        friction: 20
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
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
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <Animated.View 
      style={[
        styles.chatContainer,
        {
          transform: [{ translateY }],
          borderRadius,
          marginHorizontal,
          backgroundColor: 'transparent',
          overflow: 'hidden',
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
      <BlurView 
        intensity={60} 
        tint="dark" 
        style={[styles.chatBlur, { borderRadius: isFocused ? 20 : 0, backgroundColor: 'transparent', overflow: 'hidden' }]}
      >
        <View 
          style={[
            styles.chatOverlay,
            { borderRadius: isFocused ? 20 : 0, backgroundColor: 'transparent', overflow: 'hidden' }
          ]}
        >
          <View style={[styles.chatContent, { borderRadius: isFocused ? 20 : 0, overflow: 'hidden' }]}>
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
                  style={styles.sendButton}
                  onPress={onSendMessage}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#FF8A65']}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons name="send" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={onVoicePress}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mic" size={20} color="#FF6B35" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showChatbox = true }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !loading) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/ai/transform-thought', {
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
          console.log('Tasks created successfully:', data);
          setChatMessage('');
        } else {
          console.error('Error creating tasks:', data.error);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
      setLoading(false);
    }
  };

  const handleVoicePress = () => {
    // TODO: Handle voice input
    console.log('Voice input pressed');
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Glass Chat Component - Only show if showChatbox is true */}
      {showChatbox && (
        <GlassChat
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          onSendMessage={handleSendMessage}
          onVoicePress={handleVoicePress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'none',
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
    position: 'relative',
    backgroundColor: 'transparent',
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
}); 