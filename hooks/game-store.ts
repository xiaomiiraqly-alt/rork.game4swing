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
    'знакомство': { male: [], female: [], common: [] },
    'флирт': { male: [], female: [], common: [] },
    'прелюдия': { male: [], female: [], common: [] },
    'fire': { male: [], female: [], common: [] },
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
    common: [
      { id: '17', text: 'Расскажи о самом ярком впечатлении из детства', category: 'знакомство', gender: 'common' },
      { id: '18', text: 'Поделись своим любимым хобби', category: 'знакомство', gender: 'common' },
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
    common: [
      { id: '19', text: 'Сделай комплимент человеку напротив', category: 'флирт', gender: 'common' },
      { id: '20', text: 'Расскажи о самом романтичном моменте в твоей жизни', category: 'флирт', gender: 'common' },
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
    common: [
      { id: '21', text: 'Опиши идеальную романтическую атмосферу', category: 'прелюдия', gender: 'common' },
      { id: '22', text: 'Расскажи о самом чувственном прикосновении', category: 'прелюдия', gender: 'common' },
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
    common: [
      { id: '23', text: 'Опиши самый страстный момент', category: 'fire', gender: 'common' },
      { id: '24', text: 'Поделись своей самой смелой фантазией', category: 'fire', gender: 'common' },
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

      console.log('Loading data from storage...');
      console.log('Stored tasks:', storedTasks ? 'Found' : 'Not found');
      console.log('Stored game state:', storedGameState ? 'Found' : 'Not found');

      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        console.log('Loaded tasks from storage:', parsedTasks);
        setTaskBank(parsedTasks);
      } else {
        console.log('No stored tasks found, using initial task bank');
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTaskBank));
      }

      if (storedGameState) {
        const parsedGameState = JSON.parse(storedGameState);
        console.log('Loaded game state from storage');
        setGameState(parsedGameState);
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
      console.log('Saving task bank to storage...');
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTaskBank));
      setTaskBank(newTaskBank);
      console.log('Task bank saved successfully');
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

    const genderTasks = taskBank[gameState.currentCategory][currentPlayer.gender];
    const commonTasks = taskBank[gameState.currentCategory].common;
    const usedGenderTaskIds = gameState.usedTasks[gameState.currentCategory][currentPlayer.gender];
    const usedCommonTaskIds = gameState.usedTasks[gameState.currentCategory].common;
    
    const availableGenderTasks = genderTasks.filter(task => !usedGenderTaskIds.includes(task.id));
    const availableCommonTasks = commonTasks.filter(task => !usedCommonTaskIds.includes(task.id));
    
    const allAvailableTasks = [...availableGenderTasks, ...availableCommonTasks];
    
    if (allAvailableTasks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allAvailableTasks.length);
    return allAvailableTasks[randomIndex];
  }, [taskBank, gameState.currentCategory, gameState.usedTasks, getCurrentPlayer]);

  const markTaskAsUsed = useCallback((taskId: string) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    const genderTasks = taskBank[gameState.currentCategory][currentPlayer.gender];
    const commonTasks = taskBank[gameState.currentCategory].common;
    
    const isCommonTask = commonTasks.some(task => task.id === taskId);
    const taskGender = isCommonTask ? 'common' : currentPlayer.gender;

    const newUsedTasks = { ...gameState.usedTasks };
    newUsedTasks[gameState.currentCategory][taskGender].push(taskId);

    const newGameState = {
      ...gameState,
      usedTasks: newUsedTasks,
    };
    
    saveGameState(newGameState);
  }, [gameState, getCurrentPlayer, saveGameState, taskBank]);

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
        [categories[nextIndex]]: { male: [], female: [], common: [] },
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

    console.log('Adding new task:', newTask);

    const newTaskBank = {
      ...taskBank,
      [category]: {
        ...taskBank[category],
        [gender]: [...taskBank[category][gender], newTask],
      },
    };

    console.log('New task bank:', newTaskBank);
    saveTaskBank(newTaskBank);
  }, [taskBank, saveTaskBank]);

  const deleteTask = useCallback((category: Category, gender: Gender, taskId: string) => {
    console.log('Deleting task:', taskId);
    
    const newTaskBank = {
      ...taskBank,
      [category]: {
        ...taskBank[category],
        [gender]: taskBank[category][gender].filter(task => task.id !== taskId),
      },
    };

    console.log('Task bank after deletion:', newTaskBank);
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