/**
 * UTR (Unique Transaction Reference) Security Validator
 * Enforces 12-digit numeric constraint: ^[0-9]{12}$
 * Computes tamper-evident SHA-256 fingerprint for deduplication.
 */

export interface UTRValidationResult {
  isValid: boolean;
  errorCode?: 'INVALID_FORMAT' | 'DUPLICATE_REPLAY_ATTEMPT' | 'EMPTY_FIELD';
  message: string;
}

export class UTRValidator {
  private static UTR_REGEX = /^[0-9]{12}$/;

  /**
   * Validates syntax of a 12-digit bank UTR reference.
   */
  public static validateFormat(utr: string): UTRValidationResult {
    const trimmed = (utr || '').trim();
    if (!trimmed) {
      return {
        isValid: false,
        errorCode: 'EMPTY_FIELD',
        message: 'Transaction reference number (UTR) cannot be empty.',
      };
    }

    if (!this.UTR_REGEX.test(trimmed)) {
      return {
        isValid: false,
        errorCode: 'INVALID_FORMAT',
        message: 'Invalid UTR format. Bank reference must be exactly 12 numeric digits (0-9).',
      };
    }

    return {
      isValid: true,
      message: 'UTR format is valid.',
    };
  }

  /**
   * Simple client-safe cryptographic hash simulation for deduplication fingerprinting.
   */
  public static async computeFingerprint(utr: string, amountInr: number): Promise<string> {
    const raw = `UTR:${utr.trim()}:INR:${amountInr.toFixed(2)}:SALT:AL_PROD_SECURE`;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}
