import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ArrowRight, Home, SkipForward } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategoryInfo } from '@/constants/categories';
import { useGame } from '@/hooks/game-store';
import { Task } from '@/types/game';

export default function GameScreen() {
  const {
    gameState,
    isLoading,
    getCurrentPlayer,
    getNextTask,
    markTaskAsUsed,
    nextPlayer,
    nextCategory,
    canMoveToNextCategory,
    resetGame,
  } = useGame();
  const insets = useSafeAreaInsets();

  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showNextCategoryModal, setShowNextCategoryModal] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);

  const taskAnim = useRef(new Animated.Value(0)).current;
  const playerAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const loadNextTask = useCallback(() => {
    const task = getNextTask();
    if (!task) {
      if (canMoveToNextCategory()) {
        setShowNextCategoryModal(true);
      } else {
        setShowGameEndModal(true);
      }
      return;
    }
    setCurrentTask(task);
    Animated.timing(taskAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [getNextTask, canMoveToNextCategory, taskAnim]);

  useEffect(() => {
    if (!isLoading && gameState.isGameStarted && gameState.players.length > 0) {
      loadNextTask();
    }
  }, [gameState.currentPlayerIndex, gameState.currentCategory, gameState.isGameStarted, gameState.players.length, isLoading, loadNextTask]);

  useEffect(() => {
    Animated.timing(playerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [gameState.currentPlayerIndex, playerAnim, buttonAnim]);

  const handleTaskComplete = () => {
    if (currentTask) {
      markTaskAsUsed(currentTask.id);
    }
    Animated.parallel([
      Animated.timing(taskAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(playerAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      nextPlayer();
      setCurrentTask(null);
    });
  };

  const handleNextCategory = () => {
    setShowNextCategoryModal(false);
    nextCategory();
  };

  const handleEndGame = () => {
    resetGame();
    router.replace('/');
  };

  const handleGameEnd = () => {
    setShowGameEndModal(false);
    router.replace('/');
  };

  const currentPlayer = getCurrentPlayer();
  const categoryInfo = getCategoryInfo(gameState.currentCategory);

  if (isLoading || !gameState.isGameStarted || gameState.players.length === 0) {
    return (
      <LinearGradient
        colors={['#8B0000', '#DC143C', '#FF1493', '#8B008B']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!currentPlayer) {
    return (
      <LinearGradient
        colors={['#8B0000', '#DC143C', '#FF1493', '#8B008B']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Игра',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleEndGame}>
              <Home size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <LinearGradient
        colors={[categoryInfo.color, categoryInfo.color + '80', '#000000']}
        style={styles.container}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
              <Text style={[styles.categoryText, { color: '#000000' }]}>
                {categoryInfo.name}
              </Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.playerSection,
              {
                opacity: playerAnim,
                transform: [
                  { scale: playerAnim },
                  { translateY: playerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                ],
              },
            ]}
          >
            <Text style={[styles.playerEmoji, { color: categoryInfo.color === '#FFFFFF' ? '#333' : '#FFF' }]}>
              {currentPlayer.emoji}
            </Text>
            <Text style={[styles.playerName, { color: categoryInfo.color === '#FFFFFF' ? '#333' : '#FFF' }]}>
              {currentPlayer.name}
            </Text>
          </Animated.View>

          {currentTask && (
            <Animated.View
              style={[
                styles.taskCard,
                {
                  opacity: taskAnim,
                  transform: [
                    { translateY: taskAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                    { scale: taskAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }
                  ],
                },
              ]}
            >
              <Text style={styles.taskText}>{currentTask.text}</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.animatedButtonContainer, { opacity: buttonAnim, transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: categoryInfo.color === '#FFFFFF' ? '#DC143C' : 'rgba(255, 255, 255, 0.2)' }]}
              onPress={handleTaskComplete}
            >
              <Text style={styles.nextButtonText}>Следующий игрок</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>

      <Modal
        visible={showNextCategoryModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Уровень пройден!</Text>
            <Text style={styles.modalText}>
              Все задания категории &quot;{categoryInfo.name}&quot; завершены.
              Перейти к следующему уровню сложности?
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleNextCategory}
            >
              <Text style={styles.modalButtonText}>Перейти к следующему уровню</Text>
              <SkipForward size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGameEndModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Игра завершена!</Text>
            <Text style={styles.modalText}>
              Все задания пройдены. Спасибо за игру!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGameEnd}
            >
              <Text style={styles.modalButtonText}>На главную</Text>
              <Home size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 255, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playerSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  playerEmoji: {
    fontSize: 90,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 24,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  taskText: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    color: '#1a1a1a',
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#DC143C',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedButtonContainer: {
    // Base style for animated button container
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});