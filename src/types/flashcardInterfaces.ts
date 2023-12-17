// flashcardInterfaces.ts
export enum difficulty_level {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

export type Flashcard = {
  id: string;
  username: string;
  question: string;
  answer: string;
  category: string;
  difficulty_level: difficulty_level; // Using the ENUM here
}

export type User = {
  username: string;
  password: string; // Encrypted at rest
  fname: string;
  lname: string;
}

export type Category = {
  category: string;
  username: string;
}
export type Quiz = {
  id: string,
  flashcards: Flashcard[],
  start_time: Date,
  end_time: Date
}

export type FilterCriteria = {
  [key: string]: string[] | undefined;
  // Add other criteria properties as needed
}

