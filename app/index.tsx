import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Heart, Play, Settings } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim1 = useRef(new Animated.Value(0)).current;
  const buttonAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.stagger(200, [
        Animated.timing(buttonAnim1, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim2, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim, scaleAnim, buttonAnim1, buttonAnim2]);

  return (
    <LinearGradient
      colors={['#8B0000', '#DC143C', '#FF1493', '#8B008B']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.header}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Heart size={80} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.title}>Romantic Game</Text>
          <Text style={styles.subtitle}>Игра для двух пар</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.animatedButton, { opacity: buttonAnim1, transform: [{ translateY: buttonAnim1.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push('/setup-players')}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Начать игру</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.animatedButton, { opacity: buttonAnim2, transform: [{ translateY: buttonAnim2.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/task-editor')}
            >
              <Settings size={20} color="#DC143C" />
              <Text style={styles.settingsButtonText}>Редактировать задания</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    // Container for the animated icon
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  settingsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsButtonText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedButton: {
    // Base style for animated button containers
  },
});