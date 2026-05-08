export interface Tab {
  id: string;
  name: string;
  content: string;
  isHelp?: boolean;
}

export interface CalculationResult {
  value: any;
  error?: string;
  raw?: string;
}

export const HELP_CONTENT = `# NoteCalc Help

// Basic operations
2 + 2
5 * (10 - 2)
10 / 3
2 ^ 10

// Variables
price = 100
tax = 0.2
total = price * (1 + tax)

// Using previous results
10 + 5
last * 2 // last is 15, so 30

// Comments
# This is a comment
// This is also a comment

// Mathematical constants
pi
e

// Functions
sin(pi / 2)
sqrt(16)
abs(-5)
log(100, 10)

// Copy results by clicking on them!
`;
