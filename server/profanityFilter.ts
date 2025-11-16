const PROFANITY_LIST = ["badword1", "badword2", "badword3"];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY_LIST.some((word) => lower.includes(word));
}

export function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "***");
  });
  return filtered;
}
