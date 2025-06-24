import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
// Using TouchableOpacity-based progress control (no external dependencies)
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './ui/GlassCard';
import LiveActivity from '@/src/modules/LiveActivity';

export default function LiveActivityDemo() {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('Task Progress');
  const [progress, setProgress] = useState(0.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if Live Activities are supported
    setIsSupported(LiveActivity.isSupported());
    
    // Check if there's an active Live Activity
    checkActivityStatus();
  }, []);

  const checkActivityStatus = async () => {
    try {
      const active = await LiveActivity.isActivityActive();
      setIsActive(active);
    } catch (error) {
      console.error('Failed to check activity status:', error);
    }
  };

  const startActivity = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the activity');
      return;
    }

    setLoading(true);
    try {
      const result = await LiveActivity.startLiveActivity(title, progress);
      setIsActive(true);
      Alert.alert('Success', result.message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Live Activity');
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async () => {
    setLoading(true);
    try {
      const result = await LiveActivity.updateLiveActivity(progress, title);
      Alert.alert('Success', result.message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update Live Activity');
    } finally {
      setLoading(false);
    }
  };

  const endActivity = async () => {
    setLoading(true);
    try {
      const result = await LiveActivity.endLiveActivity();
      setIsActive(false);
      Alert.alert('Success', result.message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to end Live Activity');
    } finally {
      setLoading(false);
    }
  };

  const simulateProgress = () => {
    const interval = setInterval(async () => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 0.1, 1.0);
        
        // Update Live Activity if active
        if (isActive) {
          LiveActivity.updateLiveActivity(newProgress, title, 
            newProgress >= 1.0 ? 'Completed' : 'In Progress'
          ).catch(console.error);
        }

        if (newProgress >= 1.0) {
          clearInterval(interval);
          setTimeout(() => {
            if (isActive) {
              endActivity();
            }
          }, 2000);
        }

        return newProgress;
      });
    }, 1000);
  };

  if (!isSupported) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.unsupportedContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#FF6B35" />
          <Text style={styles.unsupportedTitle}>Live Activities Not Supported</Text>
          <Text style={styles.unsupportedText}>
            Live Activities require iOS 16.1 or later and are only available on physical devices.
          </Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,107,53,0.1)', '#232323', '#181818']}
        style={styles.gradient}
      >
        <GlassCard style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="radio-outline" size={24} color="#FF6B35" />
            <Text style={styles.title}>Live Activity Demo</Text>
            <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.statusText}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Activity Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter activity title..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.label}>Progress: {Math.round(progress * 100)}%</Text>
            <View style={styles.progressControls}>
              <TouchableOpacity
                style={styles.progressButton}
                onPress={() => setProgress(Math.max(0, progress - 0.1))}
              >
                <Text style={styles.progressButtonText}>-10%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.progressButton}
                onPress={() => setProgress(Math.min(1, progress + 0.1))}
              >
                <Text style={styles.progressButtonText}>+10%</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.button, styles.startButton, isActive && styles.disabledButton]}
              onPress={startActivity}
              disabled={loading || isActive}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Start Activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.updateButton, !isActive && styles.disabledButton]}
              onPress={updateActivity}
              disabled={loading || !isActive}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.endButton, !isActive && styles.disabledButton]}
              onPress={endActivity}
              disabled={loading || !isActive}
            >
              <Ionicons name="stop" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>End</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.simulateButton]}
            onPress={simulateProgress}
            disabled={loading || !isActive}
          >
            <Ionicons name="trending-up" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Simulate Progress</Text>
          </TouchableOpacity>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 Live Activities will appear in the Dynamic Island and Lock Screen when active.
            </Text>
            <Text style={styles.infoText}>
              📱 Test on a physical iPhone with iOS 16.1+ for best results.
            </Text>
          </View>
        </GlassCard>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  progressButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.4)',
  },
  progressButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: '#FF6B35',
  },
  endButton: {
    backgroundColor: '#FF4444',
  },
  simulateButton: {
    backgroundColor: '#2196F3',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  unsupportedContainer: {
    alignItems: 'center',
    padding: 32,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
  },
  unsupportedText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 