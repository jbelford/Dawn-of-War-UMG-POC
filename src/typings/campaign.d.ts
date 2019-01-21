export type Campaign = {
  name: string;
  about: string;
  involved: Participant[];
  teams: Team[];
  missions: Mission[];
  gameOptions: GameOptions;
  gameRules: string[];
  customRules: string;
  loseRules: LoseMission;
};

type Team = {
  id: number;
  name: string;
  about: string;
};

type Mission = {
  name: string;
  map: Level;
  about: string;
  involved: {
    index: number;
    spawn: number;
    about: string;
  }[];
  gameOptions: GameOptions;
  gameRules: string[];
  customRules: string;
};

type LoseMission = {
  ironman: boolean;
  map?: 'Previous' | 'Random' | 'Random Previous';
  gameOptions?: GameOptions;
  gameRules?: string[];
  customRules?: string;
};

type Participant = {
  portrait?: string;
  id: number;
  race: string;
  army: string;
  about: string;
  team: number;
};

type Level = {
  name: string;
  players: number;
  size: number;
};

type GameOptions = {
  difficulty?: 'Easy' | 'Standard' | 'Hard' | 'Harder' | 'Insane';
  startingResources?: 'Standard' | 'Quick';
  gameSpeed?: 'Very Slow' | 'Slow' | 'Normal' | 'Fast';
  resourceRate?: 'Low' | 'Standard' | 'High';
};