/**
 * Have I Been Pwned password check using k-anonymity
 * This implementation never sends the full password to any external service
 * Only the first 5 characters of the SHA-1 hash are sent
 */

// Hash password using SHA-1 (required by HIBP API)
async function sha1(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Check if password appears in known breaches using k-anonymity
export async function checkPasswordBreached(password: string): Promise<{
  isBreached: boolean;
  breachCount: number;
  error?: string;
}> {
  try {
    // Hash the password
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HIBP API with only the first 5 characters
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Business-MVP-Security-Check',
      },
    });

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status}`);
    }

    const text = await response.text();
    
    // Parse response to find our suffix
    const lines = text.split('\n');
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return {
          isBreached: true,
          breachCount: parseInt(count, 10),
        };
      }
    }

    return {
      isBreached: false,
      breachCount: 0,
    };

  } catch (error) {
    console.error('Password breach check failed:', error);
    return {
      isBreached: false,
      breachCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get security level based on breach count
export function getPasswordSecurityLevel(breachCount: number): {
  level: 'safe' | 'risky' | 'dangerous';
  message: string;
  severity: 'success' | 'warning' | 'error';
} {
  if (breachCount === 0) {
    return {
      level: 'safe',
      message: 'This password has not been found in known data breaches.',
      severity: 'success',
    };
  }

  if (breachCount < 100) {
    return {
      level: 'risky',
      message: `This password has been seen ${breachCount.toLocaleString()} times in data breaches. Consider using a different password.`,
      severity: 'warning',
    };
  }

  return {
    level: 'dangerous',
    message: `This password has been seen ${breachCount.toLocaleString()} times in data breaches. Please choose a different password.`,
    severity: 'error',
  };
}

// Debounced password check for real-time validation
export class PasswordChecker {
  private timeoutId: number | null = null;
  private readonly debounceMs: number;

  constructor(debounceMs: number = 500) {
    this.debounceMs = debounceMs;
  }

  async checkDebounced(
    password: string,
    callback: (result: {
      isBreached: boolean;
      breachCount: number;
      level: 'safe' | 'risky' | 'dangerous';
      message: string;
      severity: 'success' | 'warning' | 'error';
      error?: string;
    }) => void
  ): Promise<void> {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Skip check for very short passwords
    if (password.length < 4) {
      return;
    }

    this.timeoutId = window.setTimeout(async () => {
      const result = await checkPasswordBreached(password);
      const securityLevel = getPasswordSecurityLevel(result.breachCount);
      
      callback({
        ...result,
        ...securityLevel,
      });
    }, this.debounceMs);
  }

  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// Utility for password strength checking (basic implementation)
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  else if (password.length >= 8) feedback.push('Longer passwords are more secure');

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Include both uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Include at least one special character');

  // Common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
  }

  if (/1234|abcd|qwer/i.test(password)) {
    feedback.push('Avoid common sequences');
    score = Math.max(0, score - 1);
  }

  return { score: Math.min(4, score), feedback };
}