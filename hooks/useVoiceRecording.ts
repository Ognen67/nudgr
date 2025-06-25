import Voice from '@react-native-voice/voice';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  requestPermissions: () => Promise<boolean>;
  recognizedText: string;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  useEffect(() => {
    // Set up voice recognition event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      // Clean up listeners
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech recognition started');
    setIsRecording(true);
    setIsTranscribing(true);
  };

  const onSpeechRecognized = () => {
    console.log('Speech recognized');
  };

  const onSpeechEnd = () => {
    console.log('Speech recognition ended');
    setIsRecording(false);
  };

  const onSpeechError = (error: any) => {
    console.log('Speech recognition error:', error);
    setIsRecording(false);
    setIsTranscribing(false);
  };

  const onSpeechResults = (result: any) => {
    console.log('Speech results:', result);
    if (result.value && result.value.length > 0) {
      setRecognizedText(result.value[0]);
    }
    setIsTranscribing(false);
  };

  const onSpeechPartialResults = (result: any) => {
    console.log('Partial results:', result);
    // You can use this for live transcription if desired
    if (result.value && result.value.length > 0) {
      setRecognizedText(result.value[0]);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        console.log('Speech recognition not available');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to check speech recognition availability:', error);
      return false;
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Speech recognition not available');
      }

      // Clear previous results
      setRecognizedText('');
      setIsTranscribing(true);
      
      // Start speech recognition
      await Voice.start('en-US'); // You can change language as needed
      
      // Haptic feedback on start
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      console.log('Speech recognition started');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsRecording(false);
      setIsTranscribing(false);
      throw error;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      // Stop speech recognition
      await Voice.stop();
      
      // Haptic feedback on stop
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      console.log('Speech recognition stopped');

      // Wait a moment for the results to come in
      await new Promise(resolve => setTimeout(resolve, 500));

      return recognizedText || null;
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      setIsRecording(false);
      setIsTranscribing(false);
      return null;
    }
  };

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    requestPermissions,
    recognizedText,
  };
}; 