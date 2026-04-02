import { createInterface } from 'readline/promises';

export async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    const answer = await rl.question(`${question} [s/n]: `);
    const normalized = answer.trim().toLowerCase();
    return ['s', 'si', 'y', 'yes'].includes(normalized);
  } finally {
    rl.close();
  }
}
