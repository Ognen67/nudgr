import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/ui/AppLayout';
import { useRouter } from 'expo-router';

// Frosted Glass Card Component
const ProfileCard: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
}> = ({ children, onPress }) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper 
      style={styles.profileCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <BlurView 
        intensity={60} 
        tint="dark" 
        style={styles.profileBlur}
      >
        <View style={styles.profileOverlay}>
          {children}
        </View>
      </BlurView>
    </CardWrapper>
  );
};

export default function Profile() {
  const router = useRouter();

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleSettings = () => {
    console.log('Settings');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <AppLayout>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Info Card */}
          <ProfileCard>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color="#FF6B35" />
                </View>
              </View>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userEmail}>john.doe@example.com</Text>
              <Text style={styles.userRole}>Productivity Enthusiast</Text>
            </View>
          </ProfileCard>

          {/* Stats Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <ProfileCard>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>47</Text>
                  <Text style={styles.statLabel}>Tasks Done</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Goals Set</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>85%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
              </View>
            </ProfileCard>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <ProfileCard onPress={handleEditProfile}>
              <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="person-outline" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.settingText}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </ProfileCard>

            <ProfileCard onPress={() => console.log('Notifications')}>
              <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="notifications-outline" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </ProfileCard>

            <ProfileCard onPress={() => console.log('Privacy')}>
              <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="shield-outline" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.settingText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </ProfileCard>

            <ProfileCard onPress={handleSettings}>
              <View style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name="settings-outline" size={20} color="#FF6B35" />
                </View>
                <Text style={styles.settingText}>App Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>
            </ProfileCard>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Button
              title="Sign Out"
              icon="log-out-outline"
              onPress={handleLogout}
              variant="secondary"
              style={styles.logoutButton}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 140 : 120, // Space for tab bar + chat
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    shadowColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileBlur: {
    borderRadius: 16,
  },
  profileOverlay: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  userRole: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FF6B35',
    fontFamily: 'Inter',
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    marginTop: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 12,
  },
}); 