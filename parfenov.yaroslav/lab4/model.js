// Экспортируйте класс и функции коллекций с именами из контракта вашего варианта.
const FIRST_GAME_RELEASE_YEAR = 1952;

export class Game {
  constructor(title, platforms, releaseYear) {
    this.title = title;
    this.platforms = platforms;
    this.releaseYear = releaseYear;
  }

  addPlatform(platform) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.platforms.push(platform);
          this.platforms = [...new Set(this.platforms)];

          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  removePlatform(platform) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.platforms.indexOf(platform);
          if (index === -1) {
            return;
          }

          this.platforms.splice(index, 1);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  get platformCount() {
    return this.platforms.length;
  }
}

export function groupGamesByReleaseYear(games) {
  const gameByReleaseYear = new Map();

  for (const game of games) {
    if (gameByReleaseYear.has(game.releaseYear)) {
      gameByReleaseYear.set(
        game.releaseYear,
        gameByReleaseYear.get(game.releaseYear).add(game),
      );
    } else {
      gameByReleaseYear.set(game.releaseYear, new Set([game]));
    }
  }

  return gameByReleaseYear;
}

export function getUniquePlatforms(games) {
  const uniquePlatforms = new Set();

  for (const game of games) {
    uniquePlatforms.add(...game.platforms);
  }

  return uniquePlatforms.values().toArray();
}

export function findGamesByPlatform(games, platform) {
  const uniqueGames = new Set();

  for (const game of games) {
    if (game.platforms.includes(platform)) {
      uniqueGames.add(game);
    }
  }

  return uniqueGames.values().toArray();
}

export function groupGamesByPlatformCount(games) {
  const gamesByPlatformCount = new Map();

  for (const game of games) {
    if (gamesByPlatformCount.has(game.platforms.length)) {
      gamesByPlatformCount.set(
        game.platforms.length,
        gamesByPlatformCount.get(game.platforms.length).add(game),
      );
    } else {
      gamesByPlatformCount.set(game.platforms.length, new Set([game]));
    }
  }

  return gamesByPlatformCount;
}

export function findGamesReleasedAfter(games, limitYear) {
  const gamesReleasedAfterYear = new Set();

  for (const game of games) {
    if (game.releaseYear > limitYear) {
      gamesReleasedAfterYear.add(game);
    }
  }

  return gamesReleasedAfterYear;
}

export function addGame(games, newGame) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (
          newGame.title.trim().length > 0 &&
          +newGame.releaseYear >= FIRST_GAME_RELEASE_YEAR &&
          !games
            .map((game) => {
              return game.title;
            })
            .includes(newGame.title)
        ) {
          games.push(newGame);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
}

export function removeGame(games, gameTitle) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        for (const game of games) {
          if (game.title === gameTitle) {
            games.splice(games.indexOf(game), 1);

            break;
          }
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    }, 500);
  });
}
