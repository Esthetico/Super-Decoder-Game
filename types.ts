
export interface Feedback {
  black: number;
  white: number;
}

export interface Guess {
  combination: string[];
  feedback: Feedback;
}

export enum GameState {
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost'
}
