/// <reference types="node" />

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  {
    category: 'JavaScript',
    text: 'What is a closure in JavaScript? Can you give a practical use case?',
    hint: 'Think about function scope and data privacy.',
  },
  {
    category: 'JavaScript',
    text: 'Explain the difference between == and === in JavaScript.',
    hint: 'Consider type coercion and when it occurs.',
  },
  {
    category: 'JavaScript',
    text: 'What is the event loop and how does it work?',
    hint: 'Think about the call stack, task queue, and microtasks.',
  },
  {
    category: 'JavaScript',
    text: 'What is the difference between var, let, and const? Why is var considered problematic?',
    hint: 'Think about scoping, hoisting, and the temporal dead zone.',
  },
  {
    category: 'React',
    text: 'What is the difference between useEffect and useLayoutEffect?',
    hint: 'Think about when each fires relative to the DOM paint cycle.',
  },
  {
    category: 'React',
    text: 'Explain the concept of React reconciliation and the virtual DOM.',
    hint: 'How does React decide what to update in the real DOM?',
  },
  {
    category: 'React',
    text: 'What are React keys and why are they important in lists?',
    hint: 'Think about how React tracks elements across re-renders.',
  },
  {
    category: 'TypeScript',
    text: 'What is the difference between interface and type in TypeScript?',
    hint: 'Consider declaration merging, extensibility, and use cases for each.',
  },
  {
    category: 'CSS',
    text: 'Explain how CSS specificity works and how you would debug a specificity conflict.',
    hint: 'Think about the specificity score: inline, ID, class, element.',
  },
  {
    category: 'Performance',
    text: 'What are some techniques to improve the initial load performance of a React app?',
    hint: 'Think about code splitting, lazy loading, and bundle size reduction.',
  },
  {
    category: 'Architecture',
    text: 'Explain the difference between SSR and CSR. When would you choose each?',
    hint: 'Consider SEO, time-to-first-byte, and interactivity needs.',
  },
  {
    category: 'JavaScript',
    text: 'What is a Promise and how does it differ from async/await syntax?',
    hint: 'They solve the same problem — what does async/await compile down to?',
  },
]

async function main() {
  console.log('Seeding questions...')

  // Clear existing questions first to avoid duplicates on re-run
  await prisma.question.deleteMany()

  for (const q of questions) {
    await prisma.question.create({
      data: {
        ...q,
        createdBy: 'seed',
      },
    })
  }

  console.log(`Seeded ${questions.length} questions successfully.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })