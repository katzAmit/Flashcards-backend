// flashcardInterfaces.ts
export type Flashcard = {
  FlashcardID: string;
  UserID: string;
  Question: string;
  Answer: string;
  Category: string;
  DifficultyLevel: '1' | '2' | '3'; // ENUM representing Easy, Medium, Hard
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
