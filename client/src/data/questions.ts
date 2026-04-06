import type { Question } from "../types";

export const QUESTIONS: Question[] = [
    {
        id: 1,
        category: 'JavaScript',
        text: 'What is a closure in Javascript? Can you give a practical use case?',
        hint: 'Think about function score and data privacy',
    },
    {
        id: 2,
        category: 'JavaScript',
        text: 'Explain the difference between == and === in JavaScript',
        hint: 'Consider type coercion and when it occurs.',
    },
    {
        id: 3,
        category: 'JavaScript',
        text: 'What is the event loop and how does it work?',
        hint: 'Think about the call stack, task queue, and microtasks.'
    },
    {
        id: 4,
        category: 'JavaScript',
        text: 'What is the difference between var, let, and const? Why is var considered problematic?',
        hint: 'Think about scoping, hoisting, and the temporal dead zone.',
    },
    {
        id: 5,
        category: 'React',
        text: 'What is the difference between useEffect and useLayoutEffect?',
        hint: 'Think about when each fires relative to the DOM paint cycle',
    },
    {
        id: 6,
        category: 'React',
        text: 'Explain  the concept of React reconciliation and the virtual DOM.',
        hint: 'How does React decide what to update in the real DOM?',
    },
    {
        id: 7,
        category: 'React',
        text: 'What are React keys and why are they important in lists?',
        hint: 'Think about how React tracks elements across re-renders.',
    },
    {
        id: 8,
        category: 'TypeScript',
        text: 'What is the difference between interface and type in TypeScript',
        hint: 'Consider declaration merging, extensibility, and use cases for each.',
    },
    {
        id: 9,
        category: 'CSS',
        text: 'Explain how CSS specificity works and how you would debug a specificity conflict',
        hint: 'Think about the specificity score: inline, ID, class, element',
    },
    {
        id: 10,
        category: 'Performance',
        text: 'What are some techniques to improve the initial load performance of a React app?',
        hint: 'Think about code splitting, lazy loading, and bundle size reduction',
    },
    {
        id: 11,
        category: 'Architecture',
        text: 'Explain the difference between SSR and CSR. When would you choose each?',
        hint: 'Consider SEO, time-to-first-byte, and interactivity needs.',
    },
    {
        id: 12,
        category: 'JavaScript',
        text: 'What is a Promise and how does it differ from async/await syntax?',
        hint: 'They solve the same problem - what does async/await compile down to?',
    },
]