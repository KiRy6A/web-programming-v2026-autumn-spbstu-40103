import './model.js';
import {addGame, Game, removeGame} from './model.js';

const games = loadGames();

function loadGames() {
  const savedGames = JSON.parse(localStorage.getItem('games') ?? '[]');

  return savedGames.map(
    (game) =>
      new Game(
        game.title,
        Array.isArray(game.platforms) ? game.platforms : [game.platforms],
        game.releaseYear,
      ),
  );
}

// Реализуйте асинхронную логику UI и синхронизацию с localStorage.
const form = document.querySelector('form[data-testid="entity-form"]');
const formGamesManipulation = document.querySelector('#gamesManipulation');
const buttonAddPlatform = document.querySelector('#addPlatform');
const buttonRemovePlatform = document.querySelector('#removePlatform');

const section = document.querySelector('section[data-testid="entity-list"]');

renderGameCards();

function renderGameCards() {
  section.replaceChildren();

  for (const game of games) {
    const note = document.createElement('article');
    note.textContent = `${game.title}; ${game.releaseYear}; ${game.platforms}`;
    note.setAttribute('data-testid', 'entity-card');

    const button = document.createElement('button');
    button.setAttribute('data-testid', 'delete-entity');
    button.textContent = 'Удалить';
    button.onclick = async (event) => {
      event.preventDefault();

      const gameTitle = game.title;

      await removeGame(games, gameTitle);

      saveGames(games);

      renderGameCards();
    };
    note.appendChild(button);

    section.appendChild(note);
  }
}

formGamesManipulation.addEventListener('submit', async (event) => {
  event.preventDefault();

  const gameTitle = form.elements['gameTitle'].value;
  const gameReleaseYear = form.elements['gameReleaseYear'].value;
  const gamePlatform = form.elements['platformName'].value;

  const game = new Game(gameTitle, [gamePlatform], gameReleaseYear);
  await addGame(games, game);

  saveGames(games);

  renderGameCards();
});

buttonAddPlatform.addEventListener('click', async (event) => {
  event.preventDefault();

  const gameTitle = form.elements['gameTitle'].value;
  const platformName = form.elements['platformName'].value;

  for (const game of games) {
    if (game.title === gameTitle) {
      await game.addPlatform(platformName);
      saveGames(games);

      renderGameCards();

      return;
    }
  }
});

buttonRemovePlatform.addEventListener('click', async (event) => {
  event.preventDefault();

  const gameTitle = form.elements['gameTitle'].value;
  const platformName = form.elements['platformName'].value;

  for (const game of games) {
    if (game.title === gameTitle) {
      await game.removePlatform(platformName);
      saveGames(games);

      renderGameCards();

      return;
    }
  }
});

function saveGames() {
  localStorage.setItem('games', JSON.stringify(games));
}
