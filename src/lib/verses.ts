export interface Verse {
  reference: string;
  text: string;
  themes: string[];
}

// A curated, carefully chosen library. Each verse carries lowercase theme
// keywords used by the matching engine in companion.ts.
export const VERSES: Verse[] = [
  {
    reference: 'Philippians 4:6-7',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    themes: ['anxiety', 'worry', 'fear', 'peace', 'stress', 'overwhelm', 'mind', 'calm'],
  },
  {
    reference: '1 Peter 5:7',
    text: 'Cast all your anxiety on him because he cares for you.',
    themes: ['anxiety', 'worry', 'care', 'burden', 'fear', 'stress'],
  },
  {
    reference: 'Psalm 34:18',
    text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
    themes: ['grief', 'loss', 'broken', 'sad', 'sorrow', 'mourning', 'death', 'lonely', 'crushed'],
  },
  {
    reference: 'Matthew 5:4',
    text: 'Blessed are those who mourn, for they will be comforted.',
    themes: ['grief', 'mourning', 'loss', 'comfort', 'sad', 'sorrow'],
  },
  {
    reference: 'Revelation 21:4',
    text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.',
    themes: ['grief', 'death', 'mourning', 'tears', 'pain', 'hope', 'loss'],
  },
  {
    reference: 'Philippians 4:19',
    text: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
    themes: ['finances', 'money', 'provision', 'need', 'lack', 'bills', 'debt', 'poor'],
  },
  {
    reference: 'Matthew 6:31-33',
    text: 'So do not worry, saying, "What shall we eat?" or "What shall we drink?" or "What shall we wear?" ... But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    themes: ['finances', 'money', 'worry', 'provision', 'need', 'food', 'clothing'],
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    themes: ['guidance', 'direction', 'decision', 'path', 'trust', 'lost', 'future', 'confused'],
  },
  {
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp for my feet, a light on my path.',
    themes: ['guidance', 'direction', 'path', 'decision', 'lost', 'clarity', 'light'],
  },
  {
    reference: 'James 1:5',
    text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
    themes: ['guidance', 'wisdom', 'decision', 'direction', 'confused', 'choice'],
  },
  {
    reference: 'Colossians 3:13',
    text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.',
    themes: ['relationships', 'forgiveness', 'conflict', 'anger', 'family', 'marriage', 'friend', 'hurt'],
  },
  {
    reference: 'Ephesians 4:2-3',
    text: 'Be completely humble and gentle; be patient, bearing with one another in love. Make every effort to keep the unity of the Spirit through the bond of peace.',
    themes: ['relationships', 'conflict', 'family', 'marriage', 'patience', 'peace', 'love'],
  },
  {
    reference: '1 Corinthians 13:4-5',
    text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
    themes: ['relationships', 'love', 'marriage', 'family', 'patience', 'kindness', 'anger'],
  },
  {
    reference: 'Psalm 147:3',
    text: 'He heals the brokenhearted and binds up their wounds.',
    themes: ['health', 'healing', 'wound', 'broken', 'sick', 'pain', 'recovery', 'grief'],
  },
  {
    reference: 'Jeremiah 30:17',
    text: 'But I will restore you to health and heal your wounds, declares the Lord.',
    themes: ['health', 'healing', 'sick', 'recovery', 'restore', 'wound', 'illness', 'body'],
  },
  {
    reference: 'Isaiah 41:10',
    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    themes: ['anxiety', 'fear', 'strength', 'alone', 'weak', 'overwhelm', 'support', 'fearful'],
  },
  {
    reference: 'Psalm 23:4',
    text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
    themes: ['grief', 'fear', 'dark', 'valley', 'comfort', 'death', 'alone', 'hard'],
  },
  {
    reference: '2 Corinthians 12:9',
    text: 'My grace is sufficient for you, for my power is made perfect in weakness.',
    themes: ['weak', 'struggle', 'inadequate', 'failure', 'not enough', 'strength', 'grace', 'shame'],
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    themes: ['hope', 'purpose', 'hard', 'struggle', 'confused', 'plan', 'good', 'meaning'],
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, an ever-present help in trouble.',
    themes: ['trouble', 'fear', 'strength', 'refuge', 'safe', 'help', 'overwhelm', 'crisis'],
  },
  {
    reference: 'Psalm 30:5',
    text: 'Weeping may stay for the night, but rejoicing comes in the morning.',
    themes: ['grief', 'sad', 'sorrow', 'hope', 'morning', 'weeping', 'dark', 'tears'],
  },
  {
    reference: '1 Thessalonians 5:18',
    text: 'Give thanks in all circumstances; for this is God\u2019s will for you in Christ Jesus.',
    themes: ['gratitude', 'thanks', 'thankful', 'joy', 'blessing', 'appreciate'],
  },
  {
    reference: 'Psalm 100:4',
    text: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.',
    themes: ['gratitude', 'thanks', 'praise', 'joy', 'thankful', 'worship'],
  },
  {
    reference: 'James 1:2-3',
    text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
    themes: ['trial', 'hard', 'struggle', 'perseverance', 'endurance', 'testing', 'difficulty'],
  },
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    themes: ['weary', 'tired', 'burden', 'rest', 'exhausted', 'overwhelm', 'heavy', 'burnout'],
  },
  {
    reference: 'Psalm 55:22',
    text: 'Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.',
    themes: ['burden', 'care', 'worry', 'sustain', 'anxiety', 'stress', 'overwhelm'],
  },
  {
    reference: 'John 14:27',
    text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    themes: ['peace', 'fear', 'troubled', 'afraid', 'calm', 'anxiety', 'heart'],
  },
  {
    reference: 'Lamentations 3:22-23',
    text: 'Because of the Lord\u2019s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    themes: ['hope', 'new', 'morning', 'faithfulness', 'love', 'compassion', 'start', 'fresh'],
  },
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    themes: ['purpose', 'future', 'hope', 'plans', 'prosper', 'direction'],
  },
  {
    reference: 'Joshua 1:9',
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    themes: ['courage', 'fear', 'strength', 'guidance', 'hope'],
  },
  {
    reference: 'Psalm 121:1-2',
    text: 'I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.',
    themes: ['help', 'support', 'strength', 'trust', 'guidance'],
  },
  {
    reference: 'Isaiah 40:31',
    text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    themes: ['strength', 'hope', 'endurance', 'waiting', 'trust'],
  },
  {
    reference: 'Romans 8:31',
    text: 'If God is for us, who can be against us?',
    themes: ['confidence', 'trust', 'hope', 'protection', 'strength'],
  },
  {
    reference: 'Ecclesiastes 3:1',
    text: 'There is a time for everything, and a season for every activity under the heavens.',
    themes: ['timing', 'season', 'patience', 'waiting', 'purpose'],
  },
  {
    reference: '1 Corinthians 10:13',
    text: 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.',
    themes: ['temptation', 'testing', 'strength', 'endurance', 'trial'],
  },
  {
    reference: 'Proverbs 18:10',
    text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.',
    themes: ['safety', 'protection', 'trust', 'refuge', 'help'],
  },
  {
    reference: 'Matthew 7:7',
    text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.',
    themes: ['asking', 'prayer', 'seek', 'guidance', 'help'],
  },
  {
    reference: 'John 16:33',
    text: 'I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.',
    themes: ['peace', 'trouble', 'hope', 'courage', 'overcome'],
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    themes: ['courage', 'power', 'love', 'discipline', 'strength'],
  },
  {
    reference: 'Romans 12:12',
    text: 'Be joyful in hope, patient in affliction, faithful in prayer.',
    themes: ['hope', 'patience', 'prayer', 'affliction', 'joy'],
  },
  {
    reference: 'Galatians 5:22-23',
    text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    themes: ['fruit', 'love', 'joy', 'peace', 'kindness', 'self-control'],
  },
  {
    reference: 'Matthew 6:14-15',
    text: 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you.',
    themes: ['forgiveness', 'grace', 'mercy', 'relationship', 'conflict'],
  },
  {
    reference: 'James 5:14-15',
    text: 'Is anyone among you sick? Let them call the elders of the church to pray over them and anoint them with oil in the name of the Lord.',
    themes: ['healing', 'sick', 'prayer', 'health', 'care'],
  },
  {
    reference: 'Ephesians 2:10',
    text: 'For we are God’s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.',
    themes: ['purpose', 'calling', 'good works', 'identity', 'meaning'],
  },
  {
    reference: 'Proverbs 16:3',
    text: 'Commit to the Lord whatever you do, and he will establish your plans.',
    themes: ['plans', 'work', 'purpose', 'guidance', 'success'],
  },
];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'i', 'me', 'my', 'we', 'you', 'your',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'to', 'of', 'in',
  'on', 'for', 'with', 'that', 'this', 'it', 'as', 'at', 'so', 'if', 'do',
  'does', 'did', 'have', 'has', 'had', 'not', 'no', 'just', 'about', 'what',
  'how', 'why', 'when', 'who', 'can', 'will', 'would', 'could', 'should',
  'from', 'them', 'they', 'he', 'she', 'him', 'her', 'all', 'some', 'any',
]);

export interface VerseMatch {
  verse: Verse;
  score: number;
}

// Match verses to free text by counting theme-keyword hits. Returns the top N.
export function matchVerses(text: string, limit = 3, preferredThemes: string[] = []): VerseMatch[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const scored = VERSES.map((verse) => {
    let score = 0;

    for (const theme of verse.themes) {
      if (preferredThemes.includes(theme)) {
        score += 3;
      }
    }

    for (const word of words) {
      for (const theme of verse.themes) {
        if (theme === word || theme.startsWith(word) || word.startsWith(theme)) {
          score += 1;
          break;
        }
      }
    }

    return { verse, score };
  });

  const matches = scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If no reliable verse matches were found, return an empty result.
  if (matches.length === 0) {
    return [];
  }

  return matches;
}
