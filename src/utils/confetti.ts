/**
 * Lightweight dynamic-imported confetti runner
 * Keeps canvas-confetti out of the initial critical render path
 */
export async function triggerConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}) {
  try {
    const confettiModule = await import('canvas-confetti');
    const confetti = typeof confettiModule.default === 'function' ? confettiModule.default : confettiModule;
    (confetti as (opts: any) => void)({
      particleCount: 50,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#ef4444', '#6366f1', '#10b981', '#a855f7'],
      ...options
    });
  } catch (err) {
    console.debug('Confetti effect skipped:', err);
  }
}

