export { GamePhase };
enum GamePhase {
  STOCK = "stock",
  TRACK = "track",
}

// export type GameState = {
//   [key: string]: any;
//   map?: { tiles: { [key: string]: TileType } };
//   companies?: { [key: string]: Company };
//   players?: { [key: string]: Player };
//   misc: {
//     curCompany: string;
//     curPhase: GamePhase;
//     curPlayer: string;
//     curTrainPhase: number;
//   };
//   ui?: { selectedLoc?: string };
// };

// type Company = {
//   name: string;
//   cash: number;
//   trains: { [key: string]: number };
//   floated: boolean;
//   stockLeft: number;
//   stockValue: number;
//   parValue: number;
//   curCEO?: string;
// };

// type Companies = {
//   [key: string]: Company;
// };

// type Player = {
//   name: string;
//   cash: number;
//   shares: { [key: string]: number };
// };

// // type Players = {
// //   [key: string]: Player;
// // };

// type TileType = {
//   type: string;
//   rotation: number;
// };

// type Action = {
//   type: string;
//   payload: any;
// };
