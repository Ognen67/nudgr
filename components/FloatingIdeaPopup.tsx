import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectedIdeaData {
    id: string;
    title: string;
    description: string;
    color: string;
    screenX: number;
    screenY: number;
}

interface FloatingIdeaPopupProps {
    selectedIdeaData: SelectedIdeaData;
    isMenuVisible: boolean;
    onExpand: () => void;
    onForget: () => void;
    onClose: () => void;
}

export const FloatingIdeaPopup: React.FC<FloatingIdeaPopupProps> = ({
    selectedIdeaData,
    isMenuVisible,
    onExpand,
    onForget,
    onClose
}) => {
    const { width, height } = Dimensions.get('window');
    
    // Smart positioning logic
    const POPUP_WIDTH = 300;
    const POPUP_HEIGHT = 180; // Approximate height based on content
    const MENU_HEIGHT = Platform.OS === 'ios' ? 88 : 70; // Platform-specific tab bar height
    const SAFE_MARGIN = 20;
    const ORB_OFFSET = 60; // Distance from orb center
    
    const orbX = selectedIdeaData.screenX;
    const orbY = selectedIdeaData.screenY;
    
    // Calculate available space in each direction
    const spaceLeft = orbX - SAFE_MARGIN;
    const spaceRight = width - orbX - SAFE_MARGIN;
    const spaceTop = orbY - SAFE_MARGIN;
    const spaceBottom = height - orbY - (isMenuVisible ? MENU_HEIGHT : SAFE_MARGIN);
    
    let popupX, popupY;
    
    // Horizontal positioning: prefer center, then left, then right
    if (spaceLeft >= POPUP_WIDTH / 2 && spaceRight >= POPUP_WIDTH / 2) {
        // Center the popup horizontally on the orb
        popupX = orbX - POPUP_WIDTH / 2;
    } else if (spaceRight >= POPUP_WIDTH) {
        // Position to the right of the orb
        popupX = Math.min(orbX, width - POPUP_WIDTH - SAFE_MARGIN);
    } else {
        // Position to the left of the orb
        popupX = Math.max(SAFE_MARGIN, orbX - POPUP_WIDTH);
    }
    
    // Vertical positioning: prefer above, then below
    if (spaceTop >= POPUP_HEIGHT + ORB_OFFSET) {
        // Position above the orb
        popupY = orbY - POPUP_HEIGHT - ORB_OFFSET;
    } else if (spaceBottom >= POPUP_HEIGHT + ORB_OFFSET) {
        // Position below the orb
        popupY = orbY + ORB_OFFSET;
    } else {
        // Fallback: position in the center vertically, avoiding menu
        const availableHeight = height - (isMenuVisible ? MENU_HEIGHT : 0) - (SAFE_MARGIN * 2);
        popupY = Math.max(
            SAFE_MARGIN,
            Math.min(
                height - POPUP_HEIGHT - (isMenuVisible ? MENU_HEIGHT : SAFE_MARGIN),
                (availableHeight - POPUP_HEIGHT) / 2 + SAFE_MARGIN
            )
        );
    }
    
    // Final boundary checks
    popupX = Math.max(SAFE_MARGIN, Math.min(popupX, width - POPUP_WIDTH - SAFE_MARGIN));
    popupY = Math.max(SAFE_MARGIN, Math.min(popupY, height - POPUP_HEIGHT - (isMenuVisible ? MENU_HEIGHT : SAFE_MARGIN)));

    return (
        <View style={[
            styles.floatingPopup, 
            {
                left: popupX,
                top: popupY
            }
        ]}>
            <BlurView intensity={20} tint="dark" style={styles.floatingPopupBlur}>
                {/* Close Button */}
                <TouchableOpacity 
                    style={styles.floatingPopupClose}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
                
                {/* Idea Content */}
                <Text style={styles.floatingPopupTitle}>
                    {selectedIdeaData.title}
                </Text>
                
                <Text style={styles.floatingPopupDescription}>
                    {selectedIdeaData.description}
                </Text>

                {/* Action Buttons */}
                <View style={styles.floatingPopupButtonContainer}>
                    <TouchableOpacity 
                        style={styles.expandIdeaButtonSmall}
                        onPress={onExpand}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF6B35', '#FF8C42']}
                            style={styles.expandIdeaButtonSmallGradient}
                        >
                            <Ionicons name="rocket-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.expandIdeaButtonSmallText}>Expand</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.forgetIdeaButtonSmall}
                        onPress={onForget}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(40, 40, 40, 0.8)', 'rgba(20, 20, 20, 0.4)', 'rgba(0, 0, 0, 0.1)']}
                            style={styles.forgetIdeaButtonSmallGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.forgetIdeaButtonSmallText}>Forget</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingPopup: {
        position: 'absolute',
        width: 300,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 1000
    },
    floatingPopupBlur: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 15, 15, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        padding: 24,
        paddingTop: 36,
        backdropFilter: 'blur(20px)',
    },
    floatingPopupClose: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },
    floatingPopupTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        fontFamily: 'Inter',
        letterSpacing: 0.3,
    },
    floatingPopupDescription: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.75)',
        lineHeight: 22,
        marginBottom: 20,
        fontFamily: 'Inter',
        letterSpacing: 0.2,
    },
    floatingPopupButtonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    expandIdeaButtonSmall: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    expandIdeaButtonSmallGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    expandIdeaButtonSmallText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 6,
        fontFamily: 'Inter',
        letterSpacing: 0.3,
    },
    forgetIdeaButtonSmall: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    forgetIdeaButtonSmallGradient: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgetIdeaButtonSmallText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontFamily: 'Inter',
        letterSpacing: 0.2,
    },
}); 