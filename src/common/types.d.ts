export type WinCondition = {
  title: string;
  description: string;
  victoryCondition: boolean;
  alwaysOn: boolean;
  exclusive: boolean;
};

export type MapData = {
  name: string;
  description: string;
  players: number;
  pic: string;
};

export type Mod = {
  name: string;
  winConditions: WinCondition[];
  maps: MapData[];
};