
export enum difficulty_level {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export type Flashcard = {
  id: string;
  username: string;
  question: string;
  answer: string;
  category: string;
  difficulty_level: difficulty_level;
  is_auto: number | undefined;
};

export type User = {
  username: string;
  password: string;
  fname: string;
  lname: string;
};

export type Category = {
  category: string;
  username: string;
};
export type Quiz = {
  id: string;
  flashcards: Flashcard[];
  start_time: Date;
  end_time: Date;
};

export type FilterCriteria = {
  [key: string]: string[] | undefined;
};

export type Marathon = {
  marathon_id: string;
  quizzes: string[];
  username: string;
  category: Category;
  total_days: number;
  current_day: number;
  start_date: string;
  did_quiz: number;
};
export type MarathonRow = {
  marathon_id: string;
  quiz_id: string;
  username: string;
  total_days: number;
  current_day: number;
  start_date: string;
  category: Category;
  did_quiz: number;
};
