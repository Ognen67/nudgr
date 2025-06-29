import React, { useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ideas3DMindMap } from '@/components/Ideas3DMindMap';
import { AppLayout } from '@/components/ui/AppLayout';
import { useFocusEffect } from '@react-navigation/native';
import { ToggleableTabBar } from '@/components/ui/ToggleableTabBar';

const Ideas3DScreen: React.FC = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Hide menu when screen loads/focuses (removed auto-refresh)
  useFocusEffect(
    React.useCallback(() => {
      setIsMenuVisible(false);
    }, [])
  );

  const toggleMenu = () => {
    const newVisibility = !isMenuVisible;
    setIsMenuVisible(newVisibility);
    console.log('Menu toggled:', newVisibility ? 'visible' : 'hidden');
  };

  const hideMenuImmediately = () => {
    setIsMenuVisible(false);
    console.log('Menu hidden immediately for navigation');
  };

  return (
    <AppLayout showChatbox={false}>
      {/* 3D Mind Map - now has its own TaskPreviewModal */}
      <View style={styles.mindMapContainer}>
        <Ideas3DMindMap 
          onBackgroundClick={toggleMenu}
        />
      </View>
      
      {/* Reusable Toggleable Tab Bar */}
      <ToggleableTabBar 
        isVisible={isMenuVisible}
        onToggle={toggleMenu}
        onNavigate={hideMenuImmediately}
      />
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  mindMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Ideas3DScreen; 