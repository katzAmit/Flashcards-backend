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

    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS user (
      username TEXT PRIMARY KEY,
      password TEXT,
      fname TEXT,
      lname TEXT
    )`);
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS quizzes (
      quiz_id INTEGER,
      flashcard_id INTEGER,
      start_date DATE,
      end_date DATE,
      PRIMARY KEY (quiz_id, flashcard_id),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    )`, (initErr) => {
      if (initErr) {
        console.error('Error initializing quizzes table:', initErr.message);
      } else {
        console.log('Quizzes table initialized.');
      }
    });
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS category (
      category TEXT PRIMARY KEY
    )`);

    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      username TEXT,
      question TEXT,
      answer TEXT,
      category TEXT,
      difficulty_level TEXT CHECK( difficulty_level IN ('Easy','Medium','Hard') ),
      FOREIGN KEY (username) REFERENCES user(username),
      FOREIGN KEY (category) REFERENCES category(category)
    )`, (initErr) => {
      if (initErr) {
        console.error('Error initializing flashcards table:', initErr.message);
      } else {
        console.log('flashcards tables initialized.');
      }
    });
  }

  private static insertUser(username: string, password: string, fname: string, lname: string) {
    DatabaseSingleton.instance?.run(
      `INSERT INTO user (username, password, fname, lname) VALUES (?, ?, ?, ?)`,
      [username, password, fname, lname],
      (err) => {
        if (err) {
          console.error('Error inserting user:', err.message);
        } else {
          console.log('User inserted successfully.');
        }
      }
    );
  }

  private static insertCategories() {
    const categories = ['Biology', 'History', 'Geography'];

    categories.forEach((category) => {
      DatabaseSingleton.instance?.run(
        `INSERT INTO category (category) VALUES (?)`,
        [category],
        (err) => {
          if (err) {
            console.error('Error inserting category:', err.message);
          } else {
            console.log('Category inserted successfully:', category);
          }
        }
      );
    });
  }

  static initializeDatabase() {
    DatabaseSingleton.instance?.serialize(() => {
      DatabaseSingleton.initializeTables();
      DatabaseSingleton.insertUser('dyu@post.bgu.ac.il', '12345', 'First', 'Last');
      DatabaseSingleton.insertCategories();
      DatabaseSingleton.insertFlashcards();
    });
  }

  private static insertFlashcards() {
    const cards = [
      // Biology Category
      {
        id: 1,
        category: "Biology",
        question: "What is Evolution?",
        answer: "Evolution is a process that involves changes in the inherited traits of a population over successive generations."
      },
      {
        id: 2,
        category: "Biology",
        question: "Define Photosynthesis.",
        answer: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments."
      },
      {
        id: 3,
        category: "Biology",
        question: "Explain the structure of DNA.",
        answer: "DNA, or deoxyribonucleic acid, i s a double-stranded helical structure that contains genetic instructions used in the development and functioning of all known living organisms."
      },
      {
        id: 4,
        category: "Biology",
        question: "What is a cell membrane?",
        answer: "The cell membrane, also known as the plasma membrane, is a biological membrane that separates the interior of all cells from the outside environment. It consists of a lipid bilayer with embedded proteins."
      },
      {
        id: 5,
        category: "Biology",
        question: "Name the four basic types of tissue in the human body.",
        answer: "The four basic types of tissue in the human body are epithelial, connective, muscle, and nervous tissue."
      },

      // History Category
      {
        id: 6,
        category: "History",
        question: "Who was the first President of the United States?",
        answer: "George Washington was the first President of the United States, serving from April 30, 1789, to March 4, 1797."
      },
      {
        id: 7,
        category: "History",
        question: "What event marked the beginning of World War II?",
        answer: "The invasion of Poland by Germany on September 1, 1939, marked the beginning of World War II."
      },
      {
        id: 8,
        category: "History",
        question: "When was the Declaration of Independence adopted?",
        answer: "The Declaration of Independence was adopted on July 4, 1776, by the Continental Congress."
      },
      {
        id: 9,
        category: "History",
        question: "Who was the leader of the Civil Rights Movement in the United States?",
        answer: "Martin Luther King Jr. was a prominent leader in the American Civil Rights Movement during the 1950s and 1960s."
      },
      {
        id: 10,
        category: "History",
        question: "Name the ancient wonder of the world that is still standing today.",
        answer: "The Great Pyramid of Giza is the only ancient wonder of the world that is still standing today."
      },

      // Geography Category
      {
        id: 11,
        category: "Geography",
        question: "What is the capital of Japan?",
        answer: "Tokyo is the capital of Japan."
      },
      {
        id: 12,
        category: "Geography",
        question: "Name the longest river in the world.",
        answer: "The Nile River is the longest river in the world."
      },
      {
        id: 13,
        category: "Geography",
        question: "Which continent is known as the 'Land of Kangaroos'?",
        answer: "Australia is known as the 'Land of Kangaroos.'"
      },
      {
        id: 14,
        category: "Geography",
        question: "What is the highest mountain in North America?",
        answer: "Denali, also known as Mount McKinley, is the highest mountain in North America."
      },
      {
        id: 15,
        category: "Geography",
        question: "Which country is known as the 'Land of the Rising Sun'?",
        answer: "Japan is known as the 'Land of the Rising Sun.'"
      }
    ];

    cards.forEach((card) => {
      DatabaseSingleton.instance?.run(
        `INSERT INTO flashcards (id, username, question, answer, category, difficulty_level)
          VALUES (?, ?, ?, ?, ?, ?)`,
        [card.id, 'dyu@post.bgu.ac.il', card.question, card.answer, card.category, 'Medium'], // Set default difficulty
        (err) => {
          if (err) {
            console.error('Error inserting flashcard:', err.message);
          } else {
            console.log('Flashcard inserted successfully.');
          }
        }
      );
    });
  }
}

export default DatabaseSingleton;
