// flashcardInterfaces.ts
export enum DifficultyLevel {
  Easy = '1',
  Medium = '2',
  Hard = '3'
}

export type Flashcard = {
  id: string;
  username: string;
  question: string;
  answer: string;
  category: string;
  difficulty_level: DifficultyLevel; // Using the ENUM here
}

export type User = {
  username: string;
  password: string; // Encrypted at rest
  fname: string;
  lname: string;
}

export type Category = {
  category: string;
}
