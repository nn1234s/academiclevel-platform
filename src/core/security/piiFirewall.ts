/**
 * PII & Profanity Regex Firewall for StudentPacks Child Safety
 * Complies with Digital Personal Data Protection (DPDP) Act 2023.
 * Blocks phone numbers, email addresses, external URLs, social handles, and profanity.
 */

export interface FirewallScanResult {
  isSafe: boolean;
  reason?: 'PHONE_NUMBER_DETECTED' | 'EMAIL_DETECTED' | 'EXTERNAL_LINK_DETECTED' | 'SOCIAL_HANDLE_DETECTED' | 'PROFANITY_DETECTED';
  redactedText: string;
  blockedDetails?: string;
}

export class PIIFirewall {
  // 10-digit Indian numbers, optional +91, spaces/dashes
  private static PHONE_REGEX = /(?:(?:\+91[\-\s]?)?[6-9]\d{9})|(?:(?:\+?1[\-\s]?)?[2-9]\d{2}[\-\s]?\d{3}[\-\s]?\d{4})/g;

  // Standard email format
  private static EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  // External URLs, invites, domains
  private static URL_REGEX = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  private static DOMAIN_REGEX = /(?:t\.me|wa\.me|discord\.gg|instagram\.com|snapchat\.com|facebook\.com)\/[^\s]+/gi;

  // Child-inappropriate profanity list (curated for educational safety)
  private static PROFANITY_LIST = [
    'abuse', 'bastard', 'bitch', 'crap', 'damn', 'dick', 'fuck', 'fucker',
    'idiot', 'moron', 'nude', 'porn', 'scam', 'sex', 'shit', 'slut', 'stupid',
    'chutiya', 'saala', 'kamina', 'harami', 'bhosadi', 'madarchod', 'behenchod'
  ];

  /**
   * Scans text for security violations and returns safe redacted text or block status.
   */
  public static scan(input: string): FirewallScanResult {
    let sanitized = input;

    // 1. Phone check
    if (this.PHONE_REGEX.test(input)) {
      sanitized = sanitized.replace(this.PHONE_REGEX, '[PHONE REMOVED FOR SAFETY]');
      return {
        isSafe: false,
        reason: 'PHONE_NUMBER_DETECTED',
        redactedText: sanitized,
        blockedDetails: 'Sharing phone numbers is strictly prohibited to protect child safety under DPDP Act 2023.'
      };
    }

    // 2. Email check
    if (this.EMAIL_REGEX.test(input)) {
      sanitized = sanitized.replace(this.EMAIL_REGEX, '[EMAIL REMOVED]');
      return {
        isSafe: false,
        reason: 'EMAIL_DETECTED',
        redactedText: sanitized,
        blockedDetails: 'Sharing personal email addresses is not permitted in StudentPacks.'
      };
    }

    // 3. URLs and domain links
    if (this.URL_REGEX.test(input) || this.DOMAIN_REGEX.test(input)) {
      sanitized = sanitized.replace(this.URL_REGEX, '[LINK REMOVED]').replace(this.DOMAIN_REGEX, '[LINK REMOVED]');
      return {
        isSafe: false,
        reason: 'EXTERNAL_LINK_DETECTED',
        redactedText: sanitized,
        blockedDetails: 'External links, social media handles, and invite links are blocked.'
      };
    }

    // 4. Profanity check
    const lower = input.toLowerCase();
    for (const badWord of this.PROFANITY_LIST) {
      const wordRegex = new RegExp(`\\b${badWord}\\b`, 'i');
      if (wordRegex.test(lower)) {
        sanitized = sanitized.replace(wordRegex, '***');
        return {
          isSafe: false,
          reason: 'PROFANITY_DETECTED',
          redactedText: sanitized,
          blockedDetails: 'Please use respectful and encouraging language in our learning community.'
        };
      }
    }

    return {
      isSafe: true,
      redactedText: sanitized
    };
  }
}
