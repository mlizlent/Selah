import { matchVerses } from '@/lib/verses';
import { detectCrisis } from '@/lib/crisis';

export interface CompanionReply {
  text: string;
  verses: { reference: string; text: string; explanation?: string }[];
  showEscalation: boolean;
  isCrisis: boolean;
}

// Theme detection for empathetic phrasing. Maps keyword clusters to a
// validating reflection + a gentle invitation. This is a curated rule-based
// responder — no external LLM — so replies stay safe, on-topic, and grounded.
const REFLECTIONS: { keywords: string[]; themes: string[]; reflect: string; invite: string }[] = [
  {
    keywords: ['anxious', 'anxiety', 'worry', 'worried', 'panic', 'nervous', 'overwhelm', 'overwhelmed', 'stressed', 'stress', 'fear', 'afraid', 'scared'],
    themes: ['anxiety', 'worry', 'fear', 'stress', 'peace', 'calm'],
    reflect: "It sounds like worry has been pressing in on you — that tight, restless weight that makes it hard to rest even when you want to. That is a heavy thing to carry, and you don't have to pretend it isn't there.",
    invite: "Would it help to set it down for a moment and let something steadier hold it?",
  },
  {
    keywords: ['grief', 'grieving', 'loss', 'lost', 'mourning', 'death', 'died', 'gone', 'funeral', 'sad', 'sadness', 'sorrow', 'cry', 'crying', 'tears', 'heartbroken', 'broken', 'lonely', 'alone', 'empty'],
    themes: ['grief', 'loss', 'mourning', 'comfort', 'hope', 'broken'],
    reflect: "What you're describing sounds like real grief — the kind of ache that doesn't have a quick fix, only room to be felt. I'm sorry you're in it. Loss like this changes the shape of a day.",
    invite: "You don't have to move through it quickly. May I sit with you in it for a moment?",
  },
  {
    keywords: ['money', 'finances', 'financial', 'bills', 'debt', 'rent', 'job', 'work', 'unemployed', 'laid off', 'fired', 'income', 'poor', 'broke', 'afford', 'provision', 'provide'],
    themes: ['finances', 'money', 'provision', 'need', 'care', 'burden'],
    reflect: "That kind of pressure — wondering how the numbers will work, whether there will be enough — wears on a person in a particular way. It's not just numbers; it's your sense of safety.",
    invite: "You're not alone in carrying this. Let me offer something that has steadied people in just this spot.",
  },
  {
    keywords: ['relationship', 'relationships', 'marriage', 'married', 'spouse', 'partner', 'husband', 'wife', 'boyfriend', 'girlfriend', 'family', 'mother', 'father', 'mom', 'dad', 'sister', 'brother', 'friend', 'conflict', 'fight', 'argue', 'argument', 'divorce', 'breakup', 'betrayal', 'hurt', 'forgive', 'forgiveness'],
    themes: ['relationships', 'conflict', 'forgiveness', 'love', 'peace', 'family'],
    reflect: "Relational pain has a way of reaching deeper than almost anything else — because it's the people closest to us who can hurt us most, and the ones we most want to make it right with. That tension is real.",
    invite: "Would it help to bring this before something gentler than the conflict itself?",
  },
  {
    keywords: ['sick', 'illness', 'ill', 'pain', 'hurt', 'hospital', 'surgery', 'cancer', 'diagnosis', 'recovery', 'healing', 'body', 'health', 'chronic', 'tired', 'exhausted', 'fatigue', 'weary', 'burnout', 'burned out'],
    themes: ['health', 'healing', 'strength', 'rest', 'tired', 'weary'],
    reflect: "When your body or your energy isn't cooperating, everything else gets harder too. It's exhausting in a way that's hard to explain to someone who hasn't felt it. I hear that.",
    invite: "Let me offer a word that has been a resting place for people in long, tiring seasons.",
  },
  {
    keywords: ['lost', 'confused', 'direction', 'decision', 'decide', 'path', 'future', 'purpose', 'meaning', 'calling', 'what next', 'stuck', 'guidance', 'wisdom', 'clarity', 'don\'t know', 'dont know'],
    themes: ['guidance', 'direction', 'decision', 'wisdom', 'clarity', 'purpose'],
    reflect: "Standing at a crossroads without a clear sign is its own kind of hard. Not knowing can feel like falling, even when you're standing still. That uncertainty is worth slowing down for.",
    invite: "May I offer something that has helped people find their footing in exactly this kind of moment?",
  },
  {
    keywords: ['bless', 'blessing', 'blessings', 'blessed', 'favored', 'favor', 'abundant', 'prosper', 'riches'],
    themes: ['blessing', 'blessings', 'favor', 'provision', 'gratitude'],
    reflect: "Hearing you talk about blessings feels like noticing the good God has already brought near you. That is a gentle and powerful place to stand.",
    invite: "I can share scriptures that speak directly to blessing, favor, and God’s good care.",
  },
  {
    keywords: ['grateful', 'gratitude', 'thankful', 'thanks', 'blessed', 'joy', 'happy', 'good', 'wonderful', 'gift', 'answered', 'praise'],
    themes: ['gratitude', 'joy', 'thankful', 'praise', 'blessing'],
    reflect: "What a beautiful thing to carry — gratitude has a way of softening everything else it touches. Thank you for naming it. Joy shared multiplies.",
    invite: "Here is a word that echoes what you're feeling.",
  },
  {
    keywords: ['angry', 'anger', 'mad', 'rage', 'frustrated', 'frustration', 'unfair', 'injustice', 'bitter', 'resentment'],
    themes: ['anger', 'conflict', 'forgiveness', 'peace', 'justice'],
    reflect: "Anger often points to something that mattered to you and got hurt. It's not a flaw — it's a signal. The question is what to do with the signal without letting it burn the house down.",
    invite: "Would it help to bring that fire somewhere it can be held safely?",
  },
  {
    keywords: ['shame', 'ashamed', 'guilt', 'guilty', 'failure', 'failed', 'not enough', 'worthless', 'regret', 'mistake', 'sinned', 'sin'],
    themes: ['shame', 'guilt', 'worth', 'grace', 'identity', 'forgiveness'],
    reflect: "Shame is one of the heaviest things a person can carry — it tells you the problem isn't what you did, but who you are. That voice is not the truest voice in the room, even when it's the loudest.",
    invite: "Let me offer a word that speaks to who you actually are.",
  },
];

const GENERIC_REFLECT =
  "Thank you for trusting me with that. Whatever it is, it matters because it's weighing on you — and that's enough.";
const GENERIC_INVITE = "Let me offer a word that has been a resting place for people in hard moments.";

function pickReflection(text: string): { reflect: string; invite: string; themes: string[] } {
  const lower = text.toLowerCase();
  let best: { reflect: string; invite: string; themes: string[] } | null = null;
  let bestScore = 0;
  for (const r of REFLECTIONS) {
    let score = 0;
    for (const kw of r.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best ?? { reflect: GENERIC_REFLECT, invite: GENERIC_INVITE, themes: [] };
}

export function generateReply(userText: string): CompanionReply {
  const crisis = detectCrisis(userText);
  const { reflect, invite, themes } = pickReflection(userText);
  const matches = matchVerses(userText, 3, themes);
  const extraHelp = matches.length === 0 ? ' I didn’t find a direct scripture match for that exact topic, but I’m here with you.' : '';

  if (crisis.isCrisis) {
    return {
      text:
        "I hear how much pain you're in, and I want to pause everything else to say: you matter, and you deserve real, immediate support from a person — more than I can give you here. Please reach out right now to a crisis line. They are free, confidential, and there for exactly this moment. You don't have to be alone in this.",
      verses: matches.map((m) => ({ reference: m.verse.reference, text: m.verse.text })),
      showEscalation: true,
      isCrisis: true,
    };
  }

  return {
    text: `${reflect} ${invite}${extraHelp}`,
    verses: matches.map((m) => ({ reference: m.verse.reference, text: m.verse.text })),
    showEscalation: true,
    isCrisis: false,
  };
}

export const GREETING =
  "I'm here. This is a quiet space — share a struggle, ask a Bible question, or talk about a hard season in life. I’ll listen, offer comfort, and point you to Scripture that speaks to your situation.";
