import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, NeonNumber } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Load VT323 font for the title
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error.' }]);
    }
    setLoading(false);
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

          {/* AI Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <NeonNumber value="24" size="large" color="#FF6B35" />
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="89%" size="large" color="#4CAF50" />
              <Text style={styles.statLabel}>Success</Text>
            </View>
            <View style={styles.statCard}>
              <NeonNumber value="156" size="large" color="#FFFFFF" />
              <Text style={styles.statLabel}>Tips</Text>
            </View>
          </View>

          {/* AI Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Insights</Text>
            
            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIconContainer}>
                  <View style={styles.suggestionIcon}>
                    <Ionicons name="bulb" size={24} color="#FF6B35" />
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>Productivity Boost</Text>
                    <Text style={styles.suggestionText}>
                      You're most productive between 9-11 AM. Consider scheduling your most important tasks during this window.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Apply" size="small" onPress={() => {}} />
                <Button title="Learn More" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>Goal Optimization</Text>
                  <Text style={styles.suggestionText}>
                    Break down your "Launch New Product" goal into smaller weekly milestones for better tracking.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Auto-Break" size="small" onPress={() => {}} />
                <Button title="Skip" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>

            <GlassCard onPress={() => {}}>
              <View style={styles.suggestionHeader}>
                <View style={styles.suggestionIcon}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>Time Management</Text>
                  <Text style={styles.suggestionText}>
                    You have 3 high-priority tasks due today. Consider using the Pomodoro technique to stay focused.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionActions}>
                <Button title="Start Timer" size="small" onPress={() => {}} />
                <Button title="Reschedule" variant="secondary" size="small" onPress={() => {}} />
              </View>
            </GlassCard>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Tools</Text>
            
            <View style={styles.toolsGrid}>
              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="analytics" size={28} color="#FF6B35" />
                </View>
                <Text style={styles.toolTitle}>Analyze</Text>
                <Text style={styles.toolDescription}>Get insights on your productivity patterns</Text>
              </GlassCard>

              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="rocket" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.toolTitle}>Optimize</Text>
                <Text style={styles.toolDescription}>AI-powered task prioritization</Text>
              </GlassCard>
            </View>

            <View style={styles.toolsGrid}>
              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.toolTitle}>Chat</Text>
                <Text style={styles.toolDescription}>Ask me anything about productivity</Text>
              </GlassCard>

              <GlassCard style={styles.toolCard} onPress={() => {}}>
                <View style={styles.toolIcon}>
                  <Ionicons name="calendar" size={28} color="#FF6B35" />
                </View>
                <Text style={styles.toolTitle}>Plan</Text>
                <Text style={styles.toolDescription}>Smart schedule optimization</Text>
              </GlassCard>
            </View>
          </View>

          {/* Recent Conversations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            
            <GlassCard>
              <View style={styles.chatItem}>
                <View style={styles.chatIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FF6B35" />
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatTitle}>How to stay motivated?</Text>
                  <Text style={styles.chatPreview}>We discussed setting micro-goals and celebrating small wins...</Text>
                  <Text style={styles.chatTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.chatDivider} />
              <View style={styles.chatItem}>
                <View style={styles.chatIcon}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
                </View>
                <View style={styles.chatContent}>
                  <Text style={styles.chatTitle}>Task prioritization help</Text>
                  <Text style={styles.chatPreview}>I helped you organize tasks using the Eisenhower Matrix...</Text>
                  <Text style={styles.chatTime}>Yesterday</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        </ScrollView>
        
        {/* Chatbox UI */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.messagesContainer}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, idx) => (
                <View
                  key={idx}
                  style={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}
                >
                  <Text style={styles.msgText}>{msg.content}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#aaa"
                editable={!loading}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <Button
                title={loading ? '...' : 'Send'}
                onPress={sendMessage}
                disabled={loading || !input.trim()}
                size="small"
                style={styles.sendBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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