export type Campaign = {
  name: string;
  about: string;
  involved: Participant[];
  teams: Team[];
  missions: Mission[];
  gameOptions: string[];
  gameRules: string[];
  customRules: string;
  loseRules: LoseMission;
};

type Team = {
  name: string;
  about: string;
  players: number[];
};

type Mission = {
  name: string;
  map: Level;
  about: string;
  involved: {
    teamIndex: number;
    players: {
      index: number;
      spawn: number;
      about: string;
    }[];
  }[];
  gameOptions: string[];
  gameRules: string[];
  customRules: string;
};

type LoseMission = {
  ironman: boolean;
  map?: 'Previous' | 'Random' | 'Random Previous';
  rules?: string[];
  options?: string[];
  customRules?: string;
};

type Participant = {
  portrait?: string;
  race: string;
  army: string;
  about: string;
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