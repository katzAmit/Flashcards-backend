import sqlite3 from 'sqlite3';

class DatabaseSingleton {
  private static instance: sqlite3.Database | null = null;

  private constructor() { } // Prevents external instantiation

  static getInstance(): sqlite3.Database {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new sqlite3.Database('flashcard.db', (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('Connected to the SQLite database.');
          DatabaseSingleton.initializeTables(); // Call table initialization
        }
      });
    } else {
      // If the instance already exists, perform operations here if needed
    }
    return DatabaseSingleton.instance as sqlite3.Database;
  }

  private static initializeTables() {
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS User (
      Username TEXT PRIMARY KEY,
      Password TEXT,
      fName TEXT,
      lName TEXT
    )`);

    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS Category (
      Description TEXT PRIMARY KEY
    )`);

    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS Flashcard (
      id TEXT PRIMARY KEY,
      UserID TEXT,
      Question TEXT,
      Answer TEXT,
      CategoryDescription TEXT,
      DifficultyLevel TEXT,
      FOREIGN KEY (UserID) REFERENCES User(Username),
      FOREIGN KEY (CategoryDescription) REFERENCES Category(Description)
    )`, (initErr) => {
      if (initErr) {
        console.error('Error initializing flashcards table:', initErr.message);
      } else {
        console.log('Flashcards table initialized.');
      }
    });
  }

  static insertFlashcard(
    id: string,
    UserID: string,
    Question: string,
    Answer: string,
    CategoryDescription: string,
    DifficultyLevel: string
  ) {
    DatabaseSingleton.instance?.run(`INSERT INTO Flashcard (id, UserID, Question, Answer, CategoryDescription, DifficultyLevel)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, UserID, Question, Answer, CategoryDescription, DifficultyLevel],
      (err) => {
        if (err) {
          console.error('Error inserting flashcard:', err.message);
        } else {
          console.log('Flashcard inserted successfully.');
        }
      });
  }
}

export default DatabaseSingleton;
