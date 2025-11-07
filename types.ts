
export interface Feedback {
  black: number;
  white: number;
}

export interface Guess {
  combination: string[];
  feedback: Feedback;
}

export enum RoundState {
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost'
}

export type GameMode = 'single' | 'twoPlayer';

export type Player = 1 | 2;
