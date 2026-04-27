const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');
require('dotenv').config();

const assessments = [
  {
    title: 'JavaScript Fundamentals',
    domain: 'JavaScript',
    questions: [
      { text: 'What is the correct way to declare a JavaScript variable?', options: ['variable x = 5;', 'var x = 5;', 'v x = 5;', 'declare x = 5;'], correct: 1 },
      { text: 'Which operator is used for strict equality?', options: ['==', '===', '!=', '='], correct: 1 },
      { text: 'What will typeof null return?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correct: 2 },
      { text: 'Which method converts JSON to a JavaScript object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'JSON.convert()'], correct: 1 },
      { text: 'What does the "this" keyword refer to in a regular function?', options: ['The function itself', 'The global object', 'The calling object', 'undefined'], correct: 2 },
      { text: 'Which array method creates a new array from calling a function for every element?', options: ['forEach()', 'filter()', 'map()', 'reduce()'], correct: 2 }
    ]
  },
  {
    title: 'React Essentials',
    domain: 'React',
    questions: [
      { text: 'What is JSX?', options: ['A database query language', 'A syntax extension for JavaScript', 'A CSS framework', 'A testing library'], correct: 1 },
      { text: 'Which hook is used for managing state in functional components?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], correct: 1 },
      { text: 'What is the virtual DOM?', options: ['A direct copy of the browser DOM', 'A lightweight representation of the real DOM', 'A CSS rendering engine', 'A server-side DOM'], correct: 1 },
      { text: 'How do you pass data from parent to child component?', options: ['Using state', 'Using props', 'Using context only', 'Using localStorage'], correct: 1 },
      { text: 'What does useEffect with an empty dependency array do?', options: ['Runs on every render', 'Runs only once after initial render', 'Never runs', 'Runs before render'], correct: 1 },
      { text: 'Which of these is used for routing in React?', options: ['react-dom', 'react-router-dom', 'react-navigation', 'react-link'], correct: 1 },
      { text: 'What is the purpose of keys in React lists?', options: ['Styling elements', 'Helping React identify which items changed', 'Adding event listeners', 'Database indexing'], correct: 1 }
    ]
  },
  {
    title: 'Node.js Proficiency',
    domain: 'Node.js',
    questions: [
      { text: 'What is Node.js?', options: ['A browser', 'A JavaScript runtime built on V8', 'A database', 'A CSS preprocessor'], correct: 1 },
      { text: 'Which module is used to create a web server in Node.js?', options: ['url', 'http', 'fs', 'path'], correct: 1 },
      { text: 'What does npm stand for?', options: ['Node Package Manager', 'New Programming Method', 'Node Process Monitor', 'Network Protocol Manager'], correct: 0 },
      { text: 'Which of these is a Node.js framework?', options: ['Django', 'Flask', 'Express', 'Laravel'], correct: 2 },
      { text: 'How do you import a module in Node.js (CommonJS)?', options: ['import module', 'require("module")', 'include module', '#import module'], correct: 1 },
      { text: 'What is middleware in Express?', options: ['A database layer', 'Functions that execute during request-response cycle', 'A template engine', 'A security protocol'], correct: 1 }
    ]
  },
  {
    title: 'Python Basics',
    domain: 'Python',
    questions: [
      { text: 'Which keyword is used to define a function in Python?', options: ['func', 'function', 'def', 'define'], correct: 2 },
      { text: 'What is the output of print(type([]))?', options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correct: 0 },
      { text: 'Which of these is immutable in Python?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correct: 3 },
      { text: 'What does PEP 8 refer to?', options: ['Python Enhancement Proposal for style guide', 'Python Error Protocol', 'Python Execution Plan', 'Python Environment Package'], correct: 0 },
      { text: 'How do you create a virtual environment?', options: ['python -m venv myenv', 'python create venv', 'pip install venv', 'python --venv create'], correct: 0 },
      { text: 'What is a list comprehension?', options: ['A way to sort lists', 'A concise way to create lists', 'A method to delete list items', 'A debugging tool'], correct: 1 }
    ]
  },
  {
    title: 'CSS & Design Systems',
    domain: 'CSS',
    questions: [
      { text: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Coded Style Syntax'], correct: 1 },
      { text: 'Which property is used to change the background color?', options: ['color', 'bgcolor', 'background-color', 'bg-color'], correct: 2 },
      { text: 'What is Flexbox used for?', options: ['Database queries', 'One-dimensional layouts', 'Server routing', 'Image editing'], correct: 1 },
      { text: 'Which unit is relative to the viewport width?', options: ['px', 'em', 'vw', 'rem'], correct: 2 },
      { text: 'What does z-index control?', options: ['Font size', 'Element stacking order', 'Margin spacing', 'Border width'], correct: 1 }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profile_dashboard');
    await Assessment.deleteMany({});
    await Assessment.insertMany(assessments);
    console.log(`✅ ${assessments.length} assessments seeded successfully`);
    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedDB();
