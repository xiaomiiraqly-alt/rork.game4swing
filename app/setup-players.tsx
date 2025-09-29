import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ArrowRight, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FEMALE_EMOJIS, MALE_EMOJIS } from '@/constants/emojis';
import { useGame } from '@/hooks/game-store';
import { Gender, Player } from '@/types/game';

type PlayerSetup = {
  name: string;
  gender: Gender;
  emoji: string;
};

export default function SetupPlayersScreen() {
  const { setupPlayers } = useGame();
  const insets = useSafeAreaInsets();
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', gender: 'male', emoji: MALE_EMOJIS[0] },
    { name: '', gender: 'female', emoji: FEMALE_EMOJIS[0] },
    { name: '', gender: 'male', emoji: MALE_EMOJIS[1] },
    { name: '', gender: 'female', emoji: FEMALE_EMOJIS[1] },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(players.map(() => new Animated.Value(0))).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    Animated.stagger(150, cardAnims.map(cardAnim => {
      if (!cardAnim) return Animated.timing(new Animated.Value(0), { toValue: 0, duration: 0, useNativeDriver: true });
      return Animated.timing(cardAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    })).start(() => {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, cardAnims, buttonAnim]);

  const updatePlayer = (index: number, field: keyof PlayerSetup, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const selectEmoji = (index: number, emoji: string) => {
    if (!emoji?.trim() || emoji.trim().length === 0) return;
    if (emoji.trim().length > 10) return;
    const sanitizedEmoji = emoji.trim();
    updatePlayer(index, 'emoji', sanitizedEmoji);
  };

  const canStart = players.every(player => player.name.trim().length > 0);

  const startGame = async () => {
    if (!canStart) return;

    const gamePlayers: Player[] = players.map((player, index) => ({
      id: `player_${index}`,
      name: player.name.trim(),
      gender: player.gender,
      emoji: player.emoji,
    }));

    await setupPlayers(gamePlayers);
    router.replace('/game');
  };

  const getPlayerTitle = (index: number) => {
    switch (index) {
      case 0: return 'Мужчина из первой пары';
      case 1: return 'Девушка из первой пары';
      case 2: return 'Мужчина из второй пары';
      case 3: return 'Девушка из второй пары';
      default: return `Игрок ${index + 1}`;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Настройка игроков', headerShown: true }} />
      <LinearGradient
        colors={['#8B0000', '#DC143C', '#FF1493', '#8B008B']}
        style={styles.container}
      >
        <Animated.View style={[styles.scrollView, { opacity: fadeAnim }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.header}>
                <Users size={40} color="#FFFFFF" />
                <Text style={styles.title}>Введите имена игроков</Text>
                <Text style={styles.subtitle}>Выберите эмодзи и введите имена</Text>
              </View>

              <View style={styles.playersContainer}>
                {players.map((player, index) => (
                  <Animated.View
                    key={`player-${index}-${player.gender}`}
                    style={[
                      styles.playerCard,
                      {
                        opacity: cardAnims[index],
                        transform: [
                          { scale: cardAnims[index] },
                          { translateY: cardAnims[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.playerTitle}>{getPlayerTitle(index)}</Text>

                    <View style={styles.emojiContainer}>
                      <Text style={styles.selectedEmoji}>{player.emoji}</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.emojiScroll}
                      >
                        {(player.gender === 'male' ? MALE_EMOJIS : FEMALE_EMOJIS).map((emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            style={[
                              styles.emojiButton,
                              player.emoji === emoji && styles.selectedEmojiButton,
                            ]}
                            onPress={() => {
                              if (emoji?.trim()) {
                                selectEmoji(index, emoji.trim());
                              }
                            }}
                          >
                            <Text style={styles.emojiText}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <TextInput
                      style={styles.nameInput}
                      placeholder="Введите имя"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      value={player.name}
                      onChangeText={(text) => updatePlayer(index, 'name', text)}
                    />
                  </Animated.View>
                ))}
              </View>

              <Animated.View style={[styles.animatedButtonContainer, { opacity: buttonAnim, transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <TouchableOpacity
                  style={[styles.startButton, !canStart && styles.startButtonDisabled]}
                  onPress={startGame}
                  disabled={!canStart}
                >
                  <Text style={styles.startButtonText}>Начать игру</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playersContainer: {
    gap: 20,
    marginBottom: 30,
  },
  playerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  emojiScroll: {
    maxHeight: 60,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  selectedEmojiButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emojiText: {
    fontSize: 24,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  animatedButtonContainer: {
    // Base style for animated button container
  },
});