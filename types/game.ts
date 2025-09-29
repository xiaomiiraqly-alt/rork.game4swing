export type Gender = 'male' | 'female';

export type Category = 'знакомство' | 'флирт' | 'прелюдия' | 'fire';

export type Player = {
  id: string;
  name: string;
  gender: Gender;
  emoji: string;
};

export type Task = {
  id: string;
  text: string;
  category: Category;
  gender: Gender;
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  currentCategory: Category;
  usedTasks: Record<Category, Record<Gender, string[]>>;
  isGameStarted: boolean;
};

export type TaskBank = {
  [K in Category]: {
    [G in Gender]: Task[];
  };
};