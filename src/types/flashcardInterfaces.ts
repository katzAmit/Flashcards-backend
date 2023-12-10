// flashcardInterfaces.ts
export enum DifficultyLevel {
  Easy = '1',
  Medium = '2',
  Hard = '3'
}

export type Flashcard = {
  FlashcardID: string;
  UserID: string;
  Question: string;
  Answer: string;
  Category: string;
  DifficultyLevel: DifficultyLevel; // Using the ENUM here
}

export type User = {
  Username: string;
  Password: string; // Encrypted at rest
  fName: string;
  lName: string;
}

export type Category = {
  Description: string;
}
