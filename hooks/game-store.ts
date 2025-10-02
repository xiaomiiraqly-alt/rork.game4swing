import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Category, GameState, Player, Task, TaskBank, Gender } from '@/types/game';

const AsyncStorage = Platform.select({
  web: {
    getItem: async (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors on web
      }
    },
  },
  default: require('@react-native-async-storage/async-storage').default,
});

const STORAGE_KEYS = {
  TASKS: 'romantic_game_tasks',
  GAME_STATE: 'romantic_game_state',
};

const initialGameState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  currentCategory: 'знакомство',
  usedTasks: {
    'знакомство': { male: [], female: [] },
    'флирт': { male: [], female: [] },
    'прелюдия': { male: [], female: [] },
    'fire': { male: [], female: [] },
  },
  isGameStarted: false,
};

const initialTaskBank: TaskBank = {
  'знакомство': {
    male: [
      { id: '1', text: 'Расскажи о своем самом смешном детском воспоминании', category: 'знакомство', gender: 'male' },
      { id: '2', text: 'Назови три качества, которые тебя привлекают в людях', category: 'знакомство', gender: 'male' },
    ],
    female: [
      { id: '3', text: 'Поделись своей самой заветной мечтой', category: 'знакомство', gender: 'female' },
      { id: '4', text: 'Расскажи о месте, где ты чувствуешь себя счастливой', category: 'знакомство', gender: 'female' },
    ],
  },
  'флирт': {
    male: [
      { id: '5', text: 'Сделай комплимент девушке напротив', category: 'флирт', gender: 'male' },
      { id: '6', text: 'Расскажи, что тебя привлекает в женщинах', category: 'флирт', gender: 'male' },
    ],
    female: [
      { id: '7', text: 'Подмигни самому привлекательному мужчине в комнате', category: 'флирт', gender: 'female' },
      { id: '8', text: 'Расскажи о своем идеальном свидании', category: 'флирт', gender: 'female' },
    ],
  },
  'прелюдия': {
    male: [
      { id: '9', text: 'Опиши самый романтичный поцелуй', category: 'прелюдия', gender: 'male' },
      { id: '10', text: 'Расскажи о своей самой романтичной фантазии', category: 'прелюдия', gender: 'male' },
    ],
    female: [
      { id: '11', text: 'Поделись секретом соблазнения', category: 'прелюдия', gender: 'female' },
      { id: '12', text: 'Расскажи, что тебя возбуждает больше всего', category: 'прелюдия', gender: 'female' },
    ],
  },
  'fire': {
    male: [
      { id: '13', text: 'Опиши свою самую страстную фантазию', category: 'fire', gender: 'male' },
      { id: '14', text: 'Расскажи о самом возбуждающем опыте', category: 'fire', gender: 'male' },
    ],
    female: [
      { id: '15', text: 'Поделись своим самым смелым желанием', category: 'fire', gender: 'female' },
      { id: '16', text: 'Расскажи, что заводит тебя больше всего', category: 'fire', gender: 'female' },
    ],
  },
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [taskBank, setTaskBank] = useState<TaskBank>(initialTaskBank);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedTasks, storedGameState] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE),
      ]);

      if (storedTasks) {
        setTaskBank(JSON.parse(storedTasks));
      }

      if (storedGameState) {
        setGameState(JSON.parse(storedGameState));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTaskBank = useCallback(async (newTaskBank: TaskBank) => {
    if (!newTaskBank) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTaskBank));
      setTaskBank(newTaskBank);
    } catch (error) {
      console.error('Error saving task bank:', error);
    }
  }, []);

  const saveGameState = useCallback(async (newGameState: GameState) => {
    if (!newGameState) return;
    setGameState(newGameState);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(newGameState));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, []);

  const setupPlayers = useCallback(async (players: Player[]) => {
    const newGameState: GameState = {
      ...initialGameState,
      players,
      isGameStarted: true,
    };
    await saveGameState(newGameState);
  }, [saveGameState]);

  const getCurrentPlayer = useCallback((): Player | null => {
    if (gameState.players.length === 0) return null;
    return gameState.players[gameState.currentPlayerIndex];
  }, [gameState.players, gameState.currentPlayerIndex]);

  const getNextTask = useCallback((): Task | null => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return null;

    const categoryTasks = taskBank[gameState.currentCategory][currentPlayer.gender];
    const usedTaskIds = gameState.usedTasks[gameState.currentCategory][currentPlayer.gender];
    
    const availableTasks = categoryTasks.filter(task => !usedTaskIds.includes(task.id));
    
    if (availableTasks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableTasks.length);
    return availableTasks[randomIndex];
  }, [taskBank, gameState.currentCategory, gameState.usedTasks, getCurrentPlayer]);

  const markTaskAsUsed = useCallback((taskId: string) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    const newUsedTasks = { ...gameState.usedTasks };
    newUsedTasks[gameState.currentCategory][currentPlayer.gender].push(taskId);

    const newGameState = {
      ...gameState,
      usedTasks: newUsedTasks,
    };
    
    saveGameState(newGameState);
  }, [gameState, getCurrentPlayer, saveGameState]);

  const nextPlayer = useCallback(() => {
    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const newGameState = {
      ...gameState,
      currentPlayerIndex: nextIndex,
    };
    saveGameState(newGameState);
  }, [gameState, saveGameState]);

  const nextCategory = useCallback(() => {
    const categories: Category[] = ['знакомство', 'флирт', 'прелюдия', 'fire'];
    const currentIndex = categories.indexOf(gameState.currentCategory);
    const nextIndex = Math.min(currentIndex + 1, categories.length - 1);
    
    const newGameState = {
      ...gameState,
      currentCategory: categories[nextIndex],
      usedTasks: {
        ...gameState.usedTasks,
        [categories[nextIndex]]: { male: [], female: [] },
      },
    };
    saveGameState(newGameState);
  }, [gameState, saveGameState]);

  const addTask = useCallback((category: Category, gender: Gender, text: string) => {
    if (!text?.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      category,
      gender,
    };

    const newTaskBank = {
      ...taskBank,
      [category]: {
        ...taskBank[category],
        [gender]: [...taskBank[category][gender], newTask],
      },
    };

    saveTaskBank(newTaskBank);
  }, [taskBank, saveTaskBank]);

  const deleteTask = useCallback((category: Category, gender: Gender, taskId: string) => {
    const newTaskBank = {
      ...taskBank,
      [category]: {
        ...taskBank[category],
        [gender]: taskBank[category][gender].filter(task => task.id !== taskId),
      },
    };

    saveTaskBank(newTaskBank);
  }, [taskBank, saveTaskBank]);

  const resetGame = useCallback(() => {
    saveGameState(initialGameState);
  }, [saveGameState]);

  const canMoveToNextCategory = useCallback((): boolean => {
    const categories: Category[] = ['знакомство', 'флирт', 'прелюдия', 'fire'];
    const currentIndex = categories.indexOf(gameState.currentCategory);
    return currentIndex < categories.length - 1;
  }, [gameState.currentCategory]);

  return useMemo(() => ({
    gameState,
    taskBank,
    isLoading,
    setupPlayers,
    getCurrentPlayer,
    getNextTask,
    markTaskAsUsed,
    nextPlayer,
    nextCategory,
    addTask,
    deleteTask,
    resetGame,
    canMoveToNextCategory,
  }), [
    gameState,
    taskBank,
    isLoading,
    setupPlayers,
    getCurrentPlayer,
    getNextTask,
    markTaskAsUsed,
    nextPlayer,
    nextCategory,
    addTask,
    deleteTask,
    resetGame,
    canMoveToNextCategory,
  ]);
});