import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Reusable Glass Chat Component
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
  return (
    <View style={styles.chatContainer}>
      <BlurView 
        intensity={80} 
        tint="dark" 
        style={styles.chatBlur}
      >
        <View style={styles.chatOverlay}>
          <View style={styles.chatContent}>
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask a question..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={onSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={onVoicePress}
                activeOpacity={0.8}
              >
                <Ionicons name="mic" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [chatMessage, setChatMessage] = useState('');
  const router = useRouter();

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Handle chat message
      console.log('Chat message:', chatMessage);
      setChatMessage('');
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

      {/* Glass Chat Component */}
      <GlassChat
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        onSendMessage={handleSendMessage}
        onVoicePress={handleVoicePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 140 : 120, // Space for chat + tab bar
  },
  chatContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70, // Directly above tab bar
    left: 0,
    right: 0,
    zIndex: 999,
  },
  chatBlur: {
    position: 'relative',
  },
  chatOverlay: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  chatContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '400',
    paddingVertical: 8,
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
  },
}); 