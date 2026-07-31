// Crisis detection: scans user text for signs of acute self-harm or suicidal
// intent and returns resources. This is a keyword heuristic, NOT a clinical
// instrument — it errs toward surfacing help.

const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|end|hurt)\s+(my|myself|me)\b/i,
  /\b(killing myself|kill myself|end my life|ending my life)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(want to die|wanna die|wish i were dead|wish i was dead|better off dead)\b/i,
  /\b(cut myself|cutting myself|harm myself|harming myself)\b/i,
  /\b(overdose|overdosing)\b/i,
  /\b(no reason to live|nothing to live for|don't want to be here|do not want to be here)\b/i,
  /\b(give up on life|taking my life|take my own life)\b/i,
];

export interface CrisisResult {
  isCrisis: boolean;
  matchedPhrase?: string;
}

export function detectCrisis(text: string): CrisisResult {
  for (const pattern of CRISIS_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { isCrisis: true, matchedPhrase: match[0] };
    }
  }
  return { isCrisis: false };
}

export const CRISIS_RESOURCES = [
  { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988 (US, 24/7)', url: 'https://988lifeline.org' },
  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
  { name: 'International Association for Suicide Prevention', contact: 'Find a crisis line near you', url: 'https://www.iasp.info/resources/Crisis_Centres/' },
];
