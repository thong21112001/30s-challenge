import { PrismaClient, Role, ChallengeType, Difficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const challengesData = [
  // QUIZ EASY (10 XP)
  {
    title: 'Asian Capitals',
    description: 'Test your basic geography knowledge!',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      question: 'Which of the following is the capital city of Japan?',
      options: ['Kyoto', 'Osaka', 'Tokyo', 'Hiroshima'],
      correctAnswer: 'Tokyo',
    },
  },
  {
    title: 'Planet Order',
    description: 'Our solar system neighborhood.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Mars', 'Earth'],
      correctAnswer: 'Mercury',
    },
  },
  {
    title: 'Primary Colors',
    description: 'Basic color theory.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      question: 'Which of these is NOT a primary color in traditional color theory?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctAnswer: 'Green',
    },
  },
  {
    title: 'Speed of Light',
    description: 'Physics standard units.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      question: 'In physics, what letter traditionally represents the speed of light?',
      options: ['v', 'c', 'e', 'm'],
      correctAnswer: 'c',
    },
  },
  {
    title: 'Binary Basics',
    description: 'Computer science 101.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      question: 'How many bits make up one byte?',
      options: ['4', '8', '16', '32'],
      correctAnswer: '8',
    },
  },

  // QUIZ MEDIUM (25 XP)
  {
    title: 'Periodic Table Symbol',
    description: 'Identify the chemical element.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      question: 'What element has the chemical symbol "Au"?',
      options: ['Silver', 'Gold', 'Argon', 'Aluminum'],
      correctAnswer: 'Gold',
    },
  },
  {
    title: 'Largest Ocean',
    description: 'Global geography quiz.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      question: 'Which is the largest and deepest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 'Pacific Ocean',
    },
  },
  {
    title: 'Web Standards',
    description: 'Identify the web acronym.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      question: 'What does CSS stand for in web development?',
      options: [
        'Creative Style Sheets',
        'Cascading Style Sheets',
        'Computer System Styles',
        'Color Spectrum System',
      ],
      correctAnswer: 'Cascading Style Sheets',
    },
  },
  {
    title: 'Programming Language Origins',
    description: 'Tech history challenge.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      question: 'Who created the Python programming language in 1991?',
      options: ['Guido van Rossum', 'Brendan Eich', 'James Gosling', 'Bjarne Stroustrup'],
      correctAnswer: 'Guido van Rossum',
    },
  },
  {
    title: 'Human Skeleton',
    description: 'Human biology quick answer.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      question: 'What is the longest and strongest bone in the human body?',
      options: ['Tibia', 'Radius', 'Femur', 'Humerus'],
      correctAnswer: 'Femur',
    },
  },

  // QUIZ HARD (50 XP)
  {
    title: 'Quantum Unit',
    description: 'Advanced science Trivia.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      question: 'Which scientist formulated the Uncertainty Principle in quantum mechanics?',
      options: ['Niels Bohr', 'Werner Heisenberg', 'Erwin Schrödinger', 'Max Planck'],
      correctAnswer: 'Werner Heisenberg',
    },
  },
  {
    title: 'Complex Time Complexity',
    description: 'Data Structures & Algorithms.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      question: 'What is the average time complexity of QuickSort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctAnswer: 'O(n log n)',
    },
  },
  {
    title: 'Historical Treaties',
    description: 'World history precision test.',
    type: ChallengeType.QUIZ,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      question: 'In what year was the Treaty of Versailles signed to end WWI?',
      options: ['1917', '1918', '1919', '1920'],
      correctAnswer: '1919',
    },
  },

  // TEXT EASY (10 XP)
  {
    title: 'Quick Phrase Typing',
    description: 'Type the exact string before time runs out!',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      prompt: 'Type the exact sentence below into the box:',
      targetText: 'Thirty seconds is all it takes to win!',
      mode: 'EXACT',
    },
  },
  {
    title: 'Color List',
    description: 'Name 3 primary colors.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      prompt: 'Type 3 primary colors separated by spaces or commas (e.g. red, blue, yellow):',
      requiredKeywords: ['red', 'blue', 'yellow'],
      mode: 'KEYWORDS',
      minCount: 3,
    },
  },
  {
    title: 'Fast Alphabetic Rush',
    description: 'Type the first 7 letters of the alphabet.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      prompt: 'Type the first 7 letters of the English alphabet in lowercase without spaces:',
      targetText: 'abcdefg',
      mode: 'EXACT',
    },
  },

  // TEXT MEDIUM (25 XP)
  {
    title: 'Asian Countries Typing',
    description: 'Name 4 countries located in Asia.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      prompt: 'Type 4 countries in Asia separated by commas (e.g. Japan, China, India, Vietnam):',
      mode: 'LIST_CHECK',
      allowedAnswers: [
        'japan', 'china', 'india', 'vietnam', 'korea', 'south korea', 'thailand',
        'indonesia', 'malaysia', 'singapore', 'philippines', 'nepal', 'pakistan',
        'bangladesh', 'sri lanka', 'mongolia', 'laos', 'cambodia', 'myanmar'
      ],
      minCount: 4,
    },
  },
  {
    title: 'Code Snippet Typist',
    description: 'Type code syntax accurately under pressure.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      prompt: 'Type this exact JavaScript arrow function line:',
      targetText: 'const calculateXp = (streak) => streak * 10;',
      mode: 'EXACT',
    },
  },
  {
    title: 'Pangram Sprint',
    description: 'Type a famous typing pangram.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      prompt: 'Type this exact sentence without mistakes:',
      targetText: 'The quick brown fox jumps over the lazy dog.',
      mode: 'EXACT',
    },
  },

  // TEXT HARD (50 XP)
  {
    title: 'Complex Code Syntax',
    description: 'Type a tricky TypeScript signature.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      prompt: 'Type this exact TypeScript generic signature:',
      targetText: 'type Response<T> = { data: T; status: number };',
      mode: 'EXACT',
    },
  },
  {
    title: 'Programming Languages Sprint',
    description: 'Name 5 distinct programming languages.',
    type: ChallengeType.TEXT,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      prompt: 'Type 5 programming languages separated by commas (e.g. Python, JavaScript, Rust, Go, Java):',
      mode: 'LIST_CHECK',
      allowedAnswers: [
        'python', 'javascript', 'typescript', 'rust', 'go', 'java', 'c++', 'c#',
        'ruby', 'php', 'swift', 'kotlin', 'c', 'haskell', 'scala', 'elixir', 'zig'
      ],
      minCount: 5,
    },
  },

  // ACTION EASY (10 XP)
  {
    title: 'Speed Clicker',
    description: 'Click the button 10 times before 30 seconds expire!',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      actionType: 'CLICK_TARGET',
      targetCount: 10,
      instructions: 'Click the neon energizer button 10 times!',
    },
  },
  {
    title: 'Numerical Sequence Rush',
    description: 'Click numbers 1 to 5 in ascending order.',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.EASY,
    baseXp: 10,
    payload: {
      actionType: 'ORDER_CLICK',
      numbers: [3, 1, 5, 2, 4],
      expectedOrder: [1, 2, 3, 4, 5],
      instructions: 'Click the numbered tiles in order from 1 to 5!',
    },
  },

  // ACTION MEDIUM (25 XP)
  {
    title: 'Rapid Math Equation',
    description: 'Solve the quick arithmetic problem.',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      actionType: 'MATH_SOLVER',
      equation: '17 + 28 - 9',
      correctAnswer: 36,
      instructions: 'Calculate the result of: 17 + 28 - 9',
    },
  },
  {
    title: 'Precision Target Slider',
    description: 'Adjust the slider to match the exact target value!',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      actionType: 'SLIDER_TARGET',
      targetValue: 74,
      tolerance: 2,
      instructions: 'Drag the slider to exactly 74 (±2 margin)!',
    },
  },
  {
    title: 'Pattern Unscramble',
    description: 'Unscramble the letters to form a word.',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.MEDIUM,
    baseXp: 25,
    payload: {
      actionType: 'WORD_UNSCRAMBLE',
      scrambled: 'T I O N A C',
      correctWord: 'ACTION',
      instructions: 'Rearrange the scrambled letters into the correct 6-letter word!',
    },
  },

  // ACTION HARD (50 XP)
  {
    title: 'Double Digit Mental Math',
    description: 'Fast mental arithmetic under pressure.',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      actionType: 'MATH_SOLVER',
      equation: '(14 * 6) + 16',
      correctAnswer: 100,
      instructions: 'Calculate: (14 * 6) + 16',
    },
  },
  {
    title: 'Matrix Number Memory',
    description: 'Memorize the highlighted grid cells and click them!',
    type: ChallengeType.ACTION,
    difficulty: Difficulty.HARD,
    baseXp: 50,
    payload: {
      actionType: 'ORDER_CLICK',
      numbers: [8, 3, 9, 1, 6, 4, 7],
      expectedOrder: [1, 3, 4, 6, 7, 8, 9],
      instructions: 'Click all 7 tiles in strictly ascending numerical order!',
    },
  },
];

// Helper to generate up to 60 total challenges dynamically for depth
function generateExtendedPool() {
  const list = [...challengesData];
  const topics = [
    { title: 'Tech History', question: 'In what decade was the World Wide Web invented?', options: ['1970s', '1980s', '1990s', '2000s'], ans: '1980s' },
    { title: 'Space Science', question: 'Which galaxy is nearest to the Milky Way?', options: ['Andromeda', 'Triangulum', 'Sombrero', 'Whirlpool'], ans: 'Andromeda' },
    { title: 'Database Basics', question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Queue Logic', 'Server Query Link', 'System Quick Layer'], ans: 'Structured Query Language' },
    { title: 'Cybersecurity', question: 'What does HTTPS add to standard HTTP?', options: ['Speed', 'SSL/TLS Encryption', 'UDP Compression', 'Multi-threading'], ans: 'SSL/TLS Encryption' },
    { title: 'Git Mastery', question: 'Which command creates a new branch and switches to it in Git?', options: ['git checkout -b', 'git branch new', 'git switch create', 'git push -b'], ans: 'git checkout -b' },
    { title: 'OS Fundamentals', question: 'Which kernel forms the foundation of Android OS?', options: ['Linux', 'Windows NT', 'XNU', 'BSD'], ans: 'Linux' },
    { title: 'HTML5 Elements', question: 'Which HTML5 element is used to draw graphics on the fly via scripting?', options: ['<canvas>', '<svg>', '<figure>', '<graphic>'], ans: '<canvas>' },
    { title: 'TypeScript Types', question: 'Which keyword defines an inline type alias in TypeScript?', options: ['type', 'interface', 'typedef', 'struct'], ans: 'type' },
    { title: 'React Hooks', question: 'Which built-in React hook manages persistent mutable values across renders?', options: ['useRef', 'useState', 'useMemo', 'useEffect'], ans: 'useRef' },
    { title: 'Cloud Computing', question: 'What does AWS stand for in cloud infrastructure?', options: ['Amazon Web Services', 'Automated Web Server', 'Advanced Web Security', 'Array Web Storage'], ans: 'Amazon Web Services' },
  ];

  let counter = 1;
  for (let i = 0; i < 35; i++) {
    const topic = topics[i % topics.length];
    list.push({
      title: `${topic.title} #${counter}`,
      description: `Speed challenge variant ${counter}`,
      type: ChallengeType.QUIZ,
      difficulty: counter % 3 === 0 ? Difficulty.HARD : counter % 2 === 0 ? Difficulty.MEDIUM : Difficulty.EASY,
      baseXp: counter % 3 === 0 ? 50 : counter % 2 === 0 ? 25 : 10,
      payload: {
        question: topic.question,
        options: topic.options,
        correctAnswer: topic.ans,
      },
    });
    counter++;
  }
  return list;
}

async function main() {
  console.log('🌱 Starting 30s Challenge Database Seeding...');

  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.challengeSession.deleteMany();
  await prisma.challengeAssignment.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@30schallenge.app',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      stats: {
        create: {
          totalXp: 150,
          currentStreak: 5,
          bestStreak: 7,
        },
      },
    },
  });
  console.log(`✅ Admin created: username=admin, password=admin123`);

  // Create 10 Test Users
  const userPasswordHash = await bcrypt.hash('user123', 10);
  for (let i = 1; i <= 10; i++) {
    await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@30schallenge.app`,
        passwordHash: userPasswordHash,
        role: Role.USER,
        stats: {
          create: {
            totalXp: (i * 25) % 150,
            currentStreak: i % 4,
            bestStreak: i % 4 + 2,
          },
        },
      },
    });
  }
  console.log(`✅ Created 10 test users (user1 to user10, password: user123)`);

  // Seed Challenges Pool
  const pool = generateExtendedPool();
  for (const item of pool) {
    await prisma.challenge.create({
      data: {
        title: item.title,
        description: item.description,
        type: item.type,
        difficulty: item.difficulty,
        baseXp: item.baseXp,
        payload: item.payload,
        isActive: true,
      },
    });
  }

  console.log(`🎉 Seeding complete! Created ${pool.length} active challenges in the pool.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
