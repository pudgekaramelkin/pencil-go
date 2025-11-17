import { Room } from "./types.js";
import { getRandomWords } from "./wordService.js";

export class GameLogic {
  startGame(room: Room): void {
    if (room.players.size < 3) return;

    room.currentRound = 1;
    room.gameState = "choosing";

    const playerIds = Array.from(room.players.keys());
    const firstPlayerId = playerIds[0];
    if (!firstPlayerId) return;
    room.currentDrawerId = firstPlayerId;

    room.wordOptions = getRandomWords(3) ?? [];
  }

  selectWord(room: Room, word: string): void {
    if (!room.wordOptions.includes(word)) return;

    room.currentWord = word;
    room.gameState = "drawing";
    room.roundStartTime = Date.now();
    room.revealedIndices.clear();
    room.guessedPlayers.clear();
    room.strokes = [];

    room.players.forEach((p) => (p.hasGuessedCorrectly = false));
  }

  checkGuess(room: Room, playerId: string, guess: string): boolean {
    if (!room.currentWord || room.currentDrawerId === playerId) return false;
    if (room.guessedPlayers.has(playerId)) return false;

    const normalized = guess.toLowerCase().replace(/[^a-zа-яё0-9]/g, "");
    const wordNormalized = room.currentWord
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/g, "");

    console.log(normalized, wordNormalized);
    if (normalized === wordNormalized) {
      const player = room.players.get(playerId);
      if (!player) return false;

      const elapsed = (Date.now() - (room.roundStartTime || 0)) / 1000;
      const remaining = Math.max(0, room.roundTime - elapsed);
      const timeBonus = Math.ceil(remaining * 3);
      const basePoints = 100;

      player.score += basePoints + timeBonus;
      player.hasGuessedCorrectly = true;
      room.guessedPlayers.add(playerId);

      if (room.currentDrawerId) {
        const drawer = room.players.get(room.currentDrawerId);
        if (drawer) drawer.score += 50;
      }

      return true;
    }

    return false;
  }

  getMaskedWord(room: Room): string {
    if (!room.currentWord) return "";

    return room.currentWord
      .split("")
      .map((char, i) => {
        if (char === " ") return " ";
        return room.revealedIndices.has(i) ? char : "_";
      })
      .join(" ");
  }

  revealLetter(room: Room): void {
    if (!room.currentWord) return;

    const currentWord = room.currentWord;
    const unrevealedIndices = currentWord
      .split("")
      .map((_, i) => i)
      .filter(
        (i) => !room.revealedIndices.has(i) && currentWord[i] !== " ",
      );

    // Не открываем букву, если осталась только одна неоткрытая буква
    if (unrevealedIndices.length > 1) {
      const randomIndex =
        unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      if (randomIndex !== undefined) {
        room.revealedIndices.add(randomIndex);
      }
    }
  }

  revealAllButOne(room: Room): void {
    if (!room.currentWord) return;

    const currentWord = room.currentWord;
    const unrevealedIndices = currentWord
      .split("")
      .map((_, i) => i)
      .filter(
        (i) => !room.revealedIndices.has(i) && currentWord[i] !== " ",
      );

    // Открываем все буквы кроме одной (последней)
    if (unrevealedIndices.length > 1) {
      // Оставляем последнюю букву закрытой
      const lettersToReveal = unrevealedIndices.slice(0, -1);
      lettersToReveal.forEach((index) => {
        room.revealedIndices.add(index);
      });
    }
  }

  endRound(room: Room): void {
    if (!room.currentDrawerId) return;

    const playerIds = Array.from(room.players.keys());
    const currentIndex = playerIds.indexOf(room.currentDrawerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    if (nextIndex === 0) {
      room.currentRound++;
    }

    if (room.currentRound > room.totalRounds) {
      room.gameState = "gameOver";
    } else {
      room.gameState = "results";
    }
  }

  async nextRound(room: Room): Promise<void> {
    if (!room.currentDrawerId) return;

    const playerIds = Array.from(room.players.keys());
    const currentIndex = room.currentDrawerId
      ? playerIds.indexOf(room.currentDrawerId)
      : -1;
    const nextIndex = (currentIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];
    if (!nextPlayerId) return;

    room.currentDrawerId = nextPlayerId;
    room.wordOptions = (await getRandomWords(3)) ?? [];
    room.gameState = "choosing";
    room.currentWord = null;
    room.guessedPlayers.clear();
    room.players.forEach((p) => (p.hasGuessedCorrectly = false));
  }
}
