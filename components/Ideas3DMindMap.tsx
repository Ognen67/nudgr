import { FloatingIdeaPopup } from '@/components/FloatingIdeaPopup';
import { getColorForIndex } from '@/config/ideaColors';
import { useRefresh } from '@/contexts/RefreshContext';
import { MOCK_IDEAS } from '@/mocks/ideas';
import { ENDPOINTS } from '@/utils/api';
import { triggerTaskPreview as globalTriggerTaskPreview } from '@/utils/taskPreviewService';
import { generateWebGLContent, Idea } from '@/utils/webglMindMapContent';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Ideas3DMindMapProps {
    onBackgroundClick?: () => void;
    isMenuVisible?: boolean;
    isFocusMode?: boolean;
    onHideMenu?: () => void;
    onIdeaCreated?: (ideaTitle: string, ideaDescription: string) => void;
}

interface IdeaSuccessData {
    ideaTitle: string;
    ideaDescription: string;
}

interface SelectedIdeaData {
    id: string;
    title: string;
    description: string;
    color: string;
    screenX: number;
    screenY: number;
}

// Function to transform API response to visualization format
const transformIdeasForVisualization = (apiIdeas: any[]): Idea[] => {
    return apiIdeas.map((idea, index) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description || idea.content || '',
        color: getColorForIndex(index),
        size: index === 0 ? 3.0 : Math.random() * 1.5 + 1.2 // First idea is largest
    }));
};

export const Ideas3DMindMap: React.FC<Ideas3DMindMapProps> = ({ 
    onBackgroundClick, 
    isMenuVisible = false, 
    isFocusMode = false, 
    onHideMenu,
    onIdeaCreated
}) => {
    const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showIdeaSuccessModal, setShowIdeaSuccessModal] = useState(false);
    const [ideaSuccessData, setIdeaSuccessData] = useState<IdeaSuccessData | null>(null);
    const [showIdeaPopup, setShowIdeaPopup] = useState(false);
    const [selectedIdeaData, setSelectedIdeaData] = useState<SelectedIdeaData | null>(null);
    const { ideasRefreshTrigger } = useRefresh();
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        fetchIdeas();
    }, []);

    // Refresh ideas when refresh trigger changes (only when new ideas are created)
    useEffect(() => {
        if (ideasRefreshTrigger > 0) {
            fetchIdeas();
        }
    }, [ideasRefreshTrigger]);

    // Show loading or error state if needed
    if (loading && ideas.length === 0) {
        console.log('Loading ideas...');
    }

    if (error && ideas.length === 0) {
        console.warn('Error loading ideas, using fallback data:', error);
    }

    // Memoize WebGL content to prevent reloads when other props change
    const webGLContent = useMemo(() => {
        return generateWebGLContent(ideas, {
            isMenuVisible: false, // Default state, will be updated via messaging
            isFocusMode: false    // Default state, will be updated via messaging
        });
    }, [ideas]); // Only regenerate when ideas change, not menu visibility

    // Send menu state updates to WebView when they change
    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'UPDATE_MENU_STATE',
                data: {
                    isMenuVisible,
                    isFocusMode
                }
            }));
        }
    }, [isMenuVisible, isFocusMode]);

    const showIdeaCreatedPopup = (ideaTitle: string, ideaDescription: string) => {
        setIdeaSuccessData({
            ideaTitle,
            ideaDescription
        });
        setShowIdeaSuccessModal(true);
        
        // Add haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Call parent callback if provided
        if (onIdeaCreated) {
            onIdeaCreated(ideaTitle, ideaDescription);
        }
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
        // Could navigate to ideas list or refresh the current view
        // For now, just refresh the ideas
        fetchIdeas();
    };

    const handleForgetIdea = async () => {
        if (!selectedIdeaData) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            const response = await fetch(`${ENDPOINTS.IDEAS}/${selectedIdeaData.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Idea deleted successfully');
            
            // Remove the idea from local state (seamless removal without position changes)
            setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== selectedIdeaData.id));
            
            // Close popup
            setShowIdeaPopup(false);
            setSelectedIdeaData(null);
            
            // Reset WebView state
            if (webViewRef.current) {
                webViewRef.current.postMessage(JSON.stringify({
                    type: 'RESET_SELECTION_STATE'
                }));
            }
            
            // Show haptic feedback for successful deletion
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
        } catch (error) {
            console.error('Error deleting idea:', error);
            // Could show an error alert here
        }
    };

    const handleExpandIdea = async () => {
        if (!selectedIdeaData) return;
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Close popup first
        setShowIdeaPopup(false);
        setSelectedIdeaData(null);
        
        // Reset WebView state
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'RESET_SELECTION_STATE'
            }));
        }
        
        // Try to use global TaskPreview function from AppLayout
        const thoughtContent = `${selectedIdeaData.title}: ${selectedIdeaData.description}`;
        
        console.log('Attempting to trigger task preview with thought:', thoughtContent);
        globalTriggerTaskPreview(thoughtContent);
        
        // The global trigger function should handle the modal display
        // No need for fallback since we're on the ideas screen with AppLayout
    };

    const handleCloseIdeaPopup = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowIdeaPopup(false);
        setSelectedIdeaData(null);
        
        // Send message to WebView to reset its internal state
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'RESET_SELECTION_STATE'
            }));
        }
    };

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(ENDPOINTS.IDEAS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiIdeas = await response.json();
            console.log('Fetched ideas from API:', apiIdeas);

            if (Array.isArray(apiIdeas) && apiIdeas.length > 0) {
                const transformedIdeas = transformIdeasForVisualization(apiIdeas);
                setIdeas(transformedIdeas);
            } else {
                console.log('No ideas found, using mock data');
                setIdeas(MOCK_IDEAS);
            }
        } catch (error) {
            console.error('Error fetching ideas:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            // Fallback to mock data if fetch fails
            setIdeas(MOCK_IDEAS);
        } finally {
            setLoading(false);
        }
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'BACKGROUND_CLICK' && onBackgroundClick) {
                onBackgroundClick();
            } else if (message.type === 'HIDE_MENU' && onHideMenu) {
                onHideMenu();
            } else if (message.type === 'IDEA_CREATED') {
                // Show the idea creation success popup
                showIdeaCreatedPopup(
                    message.data?.title || 'New Idea',
                    message.data?.description || 'Your idea has been created successfully!'
                );
            } else if (message.type === 'SHOW_IDEA_POPUP') {
                // Show the idea popup modal
                setSelectedIdeaData({
                    id: message.data.id,
                    title: message.data.title,
                    description: message.data.description,
                    color: message.data.color,
                    screenX: message.data.screenX,
                    screenY: message.data.screenY
                });
                setShowIdeaPopup(true);
            } else if (message.type === 'HIDE_IDEA_POPUP') {
                // Hide the idea popup modal
                setShowIdeaPopup(false);
                setSelectedIdeaData(null);
                // Note: No need to reset WebView state here as this message came FROM the WebView
            }
        } catch (error) {
            console.warn('Failed to parse WebView message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: webGLContent }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo={false}
                bounces={false}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                scalesPageToFit={false}
                onMessage={handleWebViewMessage}
                onLoadEnd={() => {
                    // Send initial menu state once WebView is loaded
                    if (webViewRef.current) {
                        webViewRef.current.postMessage(JSON.stringify({
                            type: 'UPDATE_MENU_STATE',
                            data: {
                                isMenuVisible,
                                isFocusMode
                            }
                        }));
                    }
                }}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
            />

            {/* Idea Success Modal */}
            <Modal visible={showIdeaSuccessModal} transparent animationType="fade">
                <View style={styles.ideaSuccessModalContainer}>
                    <BlurView intensity={80} tint="dark" style={styles.ideaSuccessModalBlur}>
                        <View style={styles.ideaSuccessModalContent}>
                            <LinearGradient
                                colors={['rgba(255,107,53,0.15)', '#2A2A2A', '#1E1E1E']}
                                style={styles.ideaSuccessModalGradient}
                            >
                                {/* Success Icon */}
                                <View style={styles.ideaSuccessIconContainer}>
                                    <LinearGradient
                                        colors={['#FF6B35', '#FF8C42']}
                                        style={styles.ideaSuccessIconGradient}
                                    >
                                        <Ionicons name="bulb" size={32} color="#FFFFFF" />
                                    </LinearGradient>
                                </View>

                                {/* Success Content */}
                                <Text style={styles.ideaSuccessTitle}>
                                    Idea Created! 💡
                                </Text>
                                
                                <Text style={styles.ideaSuccessMessage}>
                                    Your idea "{ideaSuccessData?.ideaTitle}" has been successfully added to your collection!
                                </Text>

                                {/* Action Buttons */}
                                <View style={styles.ideaSuccessButtonContainer}>
                                    <TouchableOpacity 
                                        style={styles.viewIdeasButton}
                                        onPress={handleViewIdeas}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#FF6B35', '#FF8C42']}
                                            style={styles.viewIdeasButtonGradient}
                                        >
                                            <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
                                            <Text style={styles.viewIdeasButtonText}>Explore Ideas</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.ideaContinueButton}
                                        onPress={handleCloseIdeaSuccess}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.ideaContinueButtonText}>Continue</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </View>
                    </BlurView>
                </View>
            </Modal>

            {/* Floating Idea Popup with Smart Positioning */}
            {showIdeaPopup && selectedIdeaData && (
                <FloatingIdeaPopup
                    selectedIdeaData={selectedIdeaData}
                    isMenuVisible={isMenuVisible}
                    onExpand={handleExpandIdea}
                    onForget={handleForgetIdea}
                    onClose={handleCloseIdeaPopup}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a', // Dark gray base color to match gradient
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    // Idea Success Modal Styles - matching goal success modal design
    ideaSuccessModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    ideaSuccessModalBlur: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ideaSuccessModalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 20,
    },
    ideaSuccessModalGradient: {
        padding: 32,
        alignItems: 'center',
    },
    ideaSuccessIconContainer: {
        marginBottom: 24,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    ideaSuccessIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ideaSuccessTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    ideaSuccessMessage: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontFamily: 'Inter',
    },
    ideaSuccessButtonContainer: {
        width: '100%',
        gap: 12,
    },
    viewIdeasButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    viewIdeasButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    viewIdeasButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 8,
        fontFamily: 'Inter',
    },
    ideaContinueButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    ideaContinueButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
});

export default Ideas3DMindMap;