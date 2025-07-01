import { getColorForIndex } from '@/config/ideaColors';
import { Idea } from '@/utils/webglMindMapContent';

// Mock data for testing - fallback when API fails
export const MOCK_IDEAS: Idea[] = [
    {
        id: '1',
        title: 'AI-Powered Task Prioritization',
        description: 'Use machine learning to automatically prioritize tasks based on user behavior and preferences.',
        color: getColorForIndex(0), // Vibrant orange
        size: 3.0
    },
    {
        id: '2',
        title: 'Social Goal Sharing',
        description: 'Share goals and progress with friends for accountability.',
        color: getColorForIndex(1), // Bright teal
        size: 2.0
    },
    {
        id: '3',
        title: 'Habit Formation Analytics',
        description: 'Track and analyze habit formation patterns.',
        color: getColorForIndex(2), // Sky blue
        size: 2.0
    },
    {
        id: '4',
        title: 'Time Block Visualization',
        description: 'Visual representation of time blocks.',
        color: getColorForIndex(3), // Mint green
        size: 1.5
    },
    {
        id: '5',
        title: 'Smart Notifications',
        description: 'Context-aware notifications that adapt to your schedule.',
        color: getColorForIndex(4), // Warm yellow
        size: 1.5
    },
    {
        id: '6',
        title: 'Focus Mode 2.0',
        description: 'Enhanced focus mode with ambient sounds.',
        color: getColorForIndex(5), // Plum
        size: 1.2
    }
]; 