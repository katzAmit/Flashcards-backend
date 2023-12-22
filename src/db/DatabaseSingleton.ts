import sqlite3 from "sqlite3";

class DatabaseSingleton {
  private static instance: sqlite3.Database | null = null;

  private constructor() { } // Prevents external instantiation

  static getInstance(): sqlite3.Database {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new sqlite3.Database(
        "flashcard.db",
        (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log("Connected to the SQLite database.");
            DatabaseSingleton.initializeTables(); // Call table initialization
          }
        }
      );
    } else {
      // If the instance already exists, perform operations here if needed
    }
    return DatabaseSingleton.instance as sqlite3.Database;
  }

  private static initializeTables() {
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT,
      fname TEXT,
      lname TEXT
    )`);
    DatabaseSingleton.instance?.run(
      `CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT,
      flashcard_id TEXT,
      difficulty_level TEXT CHECK( difficulty_level IN ('Easy','Medium','Hard') ),
      username TEXT,
      start_date DATE,
      end_date DATE,
      category TEXT,
      PRIMARY KEY (id, flashcard_id),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
      
    )`,
      (initErr) => {
        if (initErr) {
          console.error("Error initializing quizzes table:", initErr.message);
        } else {
          console.log("Quizzes table initialized.");
        }
      }
    );
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS categories (
      category TEXT,
      username TEXT,
      PRIMARY KEY (category, username)
    )`);

    DatabaseSingleton.instance?.run(
      `CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      username TEXT,
      question TEXT,
      answer TEXT,
      category TEXT,
      difficulty_level TEXT CHECK( difficulty_level IN ('Easy','Medium','Hard') ),
      FOREIGN KEY (username) REFERENCES users(username),
      FOREIGN KEY (category) REFERENCES category(category)
    )`,
      (initErr) => {
        if (initErr) {
          console.error(
            "Error initializing flashcards table:",
            initErr.message
          );
        } else {
          console.log("flashcards tables initialized.");
        }
      }
    );

    DatabaseSingleton.instance?.run(
      `CREATE TABLE IF NOT EXISTS marathons (
        marathon_id TEXT,
        quiz_id TEXT,
        username TEXT,
        category TEXT,
        current_day INTEGER,
        total_days INTEGER,
        start_date DATE,
        did_quiz INTEGER,
        PRIMARY KEY (marathon_id, quiz_id), /* Composite primary key */
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
        FOREIGN KEY (category) REFERENCES categories(category),
        FOREIGN KEY (username) REFERENCES users(username)
      )`,
      (initErr: any) => {
        if (initErr) {
          console.error("Error initializing marathons table:", initErr.message);
        } else {
          console.log("marathons table initialized.");
        }
      }
    );
  }

  private static insertUser(
    username: string,
    password: string,
    fname: string,
    lname: string
  ) {
    DatabaseSingleton.instance?.run(
      `INSERT INTO users (username, password, fname, lname) VALUES (?, ?, ?, ?)`,
      [username, password, fname, lname],
      (err) => {
        if (err) {
          console.error("Error inserting user:", err.message);
        } else {
          console.log("User inserted successfully.");
        }
      }
    );
  }

  private static insertCategories() {
    const categories = [
      "Dynamic Programming",
      "NP Completeness",
      "Knapsack Problem",
      "Graph Algorithms",
      "Data Structures",
    ];

    categories.forEach((category) => {
      DatabaseSingleton.instance?.run(
        `INSERT INTO categories (category, username) VALUES (?, ?)`,
        [category, "dyu@post.bgu.ac.il"],
        (err) => {
          if (err) {
            console.error("Error inserting category:", err.message);
          } else {
            console.log("Category inserted successfully:", category);
          }
        }
      );
    });
  }

  static initializeDatabase() {
    DatabaseSingleton.instance?.serialize(() => {
      DatabaseSingleton.initializeTables();
      DatabaseSingleton.insertUser(
        "dyu@post.bgu.ac.il",
        "12345",
        "First",
        "Last"
      );
      DatabaseSingleton.insertCategories();
      DatabaseSingleton.insertFlashcards();
    });
  }

  private static insertFlashcards() {
    const flashcards = [
      {
        id: 1,
        category: "Dynamic Programming",
        question: "How does dynamic programming differ from greedy algorithms?",
        answer: "Breaks problems into smaller parts for one-time solution.",
      },
      {
        id: 2,
        category: "Dynamic Programming",
        question:
          "Solve the Fibonacci sequence problem using dynamic programming.",
        answer: "Store subproblems' solutions for Fibonacci calculation.",
      },
      {
        id: 3,
        category: "Dynamic Programming",
        question: "Explain the concept of memoization in dynamic programming.",
        answer:
          "Cache costly function results to avoid redundant computations.",
      },
      {
        id: 4,
        category: "Dynamic Programming",
        question:
          "Provide an example problem where dynamic programming can be applied other than Fibonacci.",
        answer:
          "Longest common subsequence problem demonstrates this technique.",
      },
      {
        id: 5,
        category: "Dynamic Programming",
        question:
          "Explain the implications of time complexity in dynamic programming solutions.",
        answer: "Optimizes time but increases space complexity.",
      },
      {
        id: 6,
        category: "NP Completeness",
        question:
          "Define the term 'reduction' in the context of NP-completeness.",
        answer: "Transform problems so solving one solves the other.",
      },
      {
        id: 7,
        category: "NP Completeness",
        question: "Discuss the implications of proving a problem NP-complete.",
        answer: "Implies a problem's difficulty in NP and its link to P=NP.",
      },
      {
        id: 8,
        category: "NP Completeness",
        question:
          "Explain the significance of Cook's theorem in NP-completeness.",
        answer: "SAT problem's NP-completeness foundation.",
      },
      {
        id: 9,
        category: "NP Completeness",
        question:
          "Provide an example of an NP-complete problem other than the Boolean satisfiability problem (SAT).",
        answer: "Traveling salesman problem as another NP-complete issue.",
      },
      {
        id: 10,
        category: "NP Completeness",
        question:
          "Explain the concept of polynomial-time verification in NP problems.",
        answer: "NP problems allow polynomial-time solution checks.",
      },
      {
        id: 11,
        category: "Knapsack Problem",
        question:
          "Describe the 0/1 Knapsack problem and its applications in real-world scenarios.",
        answer:
          "Optimize item selection within weight constraints for maximum value.",
      },
      {
        id: 12,
        category: "Knapsack Problem",
        question:
          "Explain the difference between the 0/1 Knapsack problem and the fractional Knapsack problem.",
        answer: "0/1 - items are whole; fractional - items can be divided.",
      },
      {
        id: 13,
        category: "Knapsack Problem",
        question:
          "Provide an algorithm to solve the Knapsack problem using dynamic programming.",
        answer: "Use a table to iteratively find the maximum value.",
      },
      {
        id: 14,
        category: "Knapsack Problem",
        question:
          "Discuss the concept of 'greedy choice' in the Knapsack problem.",
        answer:
          "Optimal solution might not come from maximum value-to-weight choice.",
      },
      {
        id: 15,
        category: "Knapsack Problem",
        question:
          "Explain how dynamic programming reduces time complexity in solving the Knapsack problem.",
        answer: "Reduces time by storing subproblem solutions.",
      },
      {
        id: 16,
        category: "Graph Algorithms",
        question:
          "Describe Prim's algorithm for finding a minimum spanning tree.",
        answer: "Builds minimum spanning tree by adding closest nodes.",
      },
      {
        id: 17,
        category: "Graph Algorithms",
        question:
          "Discuss Kruskal's algorithm and its advantages over Prim's algorithm.",
        answer: "Grows tree with smallest edges, efficient for sparse graphs.",
      },
      {
        id: 18,
        category: "Graph Algorithms",
        question:
          "Explain how Dijkstra's algorithm works and its time complexity.",
        answer:
          "Finds shortest path in weighted graphs with specific complexities.",
      },
      {
        id: 19,
        category: "Graph Algorithms",
        question:
          "Provide an example of where Bellman-Ford algorithm is preferred over Dijkstra's algorithm.",
        answer: "Handles negative edge weights unlike Dijkstra's.",
      },
      {
        id: 20,
        category: "Graph Algorithms",
        question: "Discuss the concept of 'backtracking' in graph algorithms.",
        answer: "Explores graph paths, used in algorithms like DFS.",
      },
      {
        id: 21,
        category: "Data Structures",
        question: "Explain the working principles behind a Red-Black tree.",
        answer: "Self-balancing trees ensuring logarithmic height.",
      },
      {
        id: 22,
        category: "Data Structures",
        question: "Discuss the differences between a stack and a queue.",
        answer: "LIFO vs. FIFO principles for different uses.",
      },
      {
        id: 23,
        category: "Data Structures",
        question:
          "Provide scenarios where a hash table is preferred over a binary search tree.",
        answer: "Best for dynamic data, offering constant-time operations.",
      },
      {
        id: 24,
        category: "Data Structures",
        question: "Explain the concept of a trie and its applications.",
        answer: "Efficient storage for strings, used in autocomplete systems.",
      },
      {
        id: 25,
        category: "Data Structures",
        question:
          "Discuss the concept of 'collision resolution' in hash tables.",
        answer: "Methods to handle hash table index clashes.",
      },
    ];

    flashcards.forEach((flashcards) => {
      const randomDifficulty = getRandomDifficulty();
      DatabaseSingleton.instance?.run(
        `INSERT INTO flashcards (id, username, question, answer, category, difficulty_level)
          VALUES (?, ?, ?, ?, ?, ?)`,
        [
          flashcards.id,
          "dyu@post.bgu.ac.il",
          flashcards.question,
          flashcards.answer,
          flashcards.category,
          randomDifficulty,
        ], // Set default difficulty
        (err) => {
          if (err) {
            console.error("Error inserting flashcard:", err.message);
          } else {
            console.log("Flashcard inserted successfully.");
          }
        }
      );
    });
  }
}

function getRandomDifficulty() {
  const difficulties = ["Easy", "Medium", "Hard"];
  const randomIndex = Math.floor(Math.random() * difficulties.length);
  return difficulties[randomIndex];
}
export default DatabaseSingleton;
