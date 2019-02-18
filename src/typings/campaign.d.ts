export type Campaign = {
  name: string;
  about: string;
  involved: Participant[];
  teams: Team[];
  missions: Mission[];
  gameOptions: GameOptions;
  gameRules: GameRule[];
  customRules: string;
  loseRules: LoseMission;
};

type GameRule = {
  mod: string;
  title: string;
  victoryCondition: boolean;
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
  portrait: string;
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
  ANY = 0,
  EASY,
  STANDARD,
  HARD,
  HARDER,
  INSANE
}

declare const enum GameStartResource {
  ANY = 0,
  STANDARD,
  QUICK
}

declare const enum GameSpeed {
  ANY = 0,
  VERY_SLOW,
  SLOW,
  NORMAL,
  FAST
}

declare const enum GameResourceRate {
  ANY = 0,
  LOW,
  STANDARD,
  HIGH
}

type GameOptions = {
  difficulty?: GameDiff;
  startingResources?: GameStartResource;
  gameSpeed?: GameSpeed;
  resourceRate?: GameResourceRate;
};