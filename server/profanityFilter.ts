const PROFANITY_LIST = [
  "дурак",
  "долбаеб",
  "долбоеб",
  "придурок",
  "идиот",
  "дебил",
  "тупой",
  "тупая",
  "тупое",
  "хуй",
  "хуя",
  "хуе",
  "пизда",
  "пизде",
  "ебан",
  "ебать",
  "ебал",
  "ебану",
  "ебанный",
  "ебанная",
  "сука",
  "суки",
  "бля",
  "блядь",
  "блять",
  "бляд",
  "мудак",
  "мудаки",
  "гандон",
  "пидор",
  "пидорас",
  "гомик",
  "педик",
  "лох",
  "лошара",
  "кретин",
  "мразь",
  "мрази",
  "гад",
  "гады",
  "сволочь",
  "сволочи",
  "ублюдок",
  "ублюдки",
  // Английские
  "fuck",
  "fucking",
  "fucked",
  "shit",
  "shitting",
  "asshole",
  "bitch",
  "bastard",
  "damn",
  "dammit",
  "crap",
  "piss",
  "pissed",
  "dick",
  "cock",
  "pussy",
  "whore",
  "slut",
  "retard",
  "retarded",
  "stupid",
  "idiot",
  "moron",
  "dumb",
  "dumbass",
];

export function containsProfanity(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);

  return PROFANITY_LIST.some((word) => {
    const wordLower = word.toLowerCase();
    return normalized.some((w) => w.includes(wordLower) || wordLower.includes(w));
  });
}

export function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_LIST.forEach((word) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(^|[^а-яёa-z0-9])${escapedWord}([^а-яёa-z0-9]|$)`,
      "gi"
    );
    filtered = filtered.replace(regex, (_, before, after) => {
      return (before || "") + "***" + (after || "");
    });
  });
  return filtered;
}
