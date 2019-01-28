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

declare const enum LoseMap {
  PREVIOUS = 0,
  RANDOM,
  RANDOM_PREVIOUS
}

type LoseMission = {
  ironman: boolean;
  map?: LoseMap;
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

declare const enum GameDiff {
  EASY = 0,
  STANDARD,
  HARD,
  HARDER,
  INSANE
}

declare const enum GameStartResource {
  STANDARD = 0,
  QUICK
}

declare const enum GameSpeed {
  VERY_SLOW = 0,
  SLOW,
  NORMAL,
  FAST
}

declare const enum GameResourceRate {
  LOW = 0,
  STANDARD,
  HIGH
}

type GameOptions = {
  difficulty?: GameDiff;
  startingResources?: GameStartResource;
  gameSpeed?: GameSpeed;
  resourceRate?: GameResourceRate;
};