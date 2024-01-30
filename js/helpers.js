function sortGameByStartDate(games) {
  return games.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

function fetchGamesFromSessionStorage() {
  return JSON.parse(sessionStorage.getItem("games")) || [];
}

function saveEventsToSessionStorage(data) {
  sessionStorage.setItem("games", JSON.stringify(data));
}

function fetchAndSortEventsFromJson() {
  const jsonFile = "events.json";

  $.getJSON(jsonFile, function (data) {
    const sortedGamesByDate = sortGameByStartDate(data);

    const games = sortedGamesByDate.map((game) => {
      return { ...game, pastGameViewed: false };
    });

    saveEventsToSessionStorage(games);
  });
}

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString();
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString();
}

function setGameAsPastGameViewed(id) {
  const games = fetchGamesFromSessionStorage();
  const updatedGames = games.reduce((acc, game) => {
    if (game.id === id) {
      return [...acc, { ...game, pastGameViewed: true }];
    }
    return [...acc, game];
  }, []);
  saveEventsToSessionStorage(updatedGames);
}

function showEvents() {
  const data = fetchGamesFromSessionStorage();
  const games = $("#games");

  const groupByDate = data?.reduce(function (gameDate, obj) {
    let key = new Date(obj["startDate"]).toLocaleDateString();

    if (!gameDate[key]) {
      gameDate[key] = [];
    }
    gameDate[key].push(obj);
    return gameDate;
  }, {});

  $.each(Object.keys(groupByDate), function (index, item) {
    const isOnlyOneDisabled =
      groupByDate[item].filter((game) => game.pastGameViewed).length === 1;
    const isMoreThanOneDisabled =
      groupByDate[item].filter((game) => game.pastGameViewed).length > 1;

    let gamesDivClass = "";

    switch (true) {
      case isOnlyOneDisabled:
        gamesDivClass = "ui-body-c";
        break;
      case isMoreThanOneDisabled:
        gamesDivClass = "ui-body-d";
        break;
      default:
        gamesDivClass = "ui-body-a";
    }

    const dateDiv = $('<li class="ui-corner-all">').appendTo(games);

    const headerDiv = $('<div class="ui-bar-a">').appendTo(dateDiv);
    const gamesDiv = $(`<div class="ui-content ${gamesDivClass}">`).appendTo(
      dateDiv
    );

    headerDiv.append(`<h4>${item}</h4>`);
    groupByDate[item].forEach((game) => {
      if (game.pastGameViewed) {
        return gamesDiv.append(`<li>
                                <button disabled class="ui-btn ui-corner-all">${game.name}</button>
                            </li>`);
      }

      gamesDiv.append(`<li>
                            <a href="#gameDetailPopup" id="gameDetailPopup" class="ui-button ui-shadow ui-corner-all game-btn" data-rel="dialog" data-transition="pop">
                                <button class="ui-btn ui-corner-all" id="gameBtn" data-game"${JSON.stringify(
                                  game
                                )}" onclick="showGameDetail('${game.id}')">
                                    ${game.name}
                                </button>
                            </a>
                        </li>`);
    });
  });

  $("#home").bind("pageinit", function () {
    $("#games").listview("refresh");
  });
}

function showGameDetail(id) {
  const games = fetchGamesFromSessionStorage();
  const currentGame = games.find((game) => game.id === id);
  const { startDate, name, possibleWinner } = currentGame;

  const isGamePlayed = new Date(startDate) < new Date();

  if (isGamePlayed) {
    setGameAsPastGameViewed(id);
  }

  const popup = $("#popupBody");
  popup
    .empty()
    .append(
      `<div class="date-time"><h3>${formatDate(
        startDate
      )}</h3> - <h4>${formatTime(startDate)}</h4></div>`
    )
    .append(`<h3>${name}</h3>`)
    .append(
      `<div><span>Pravdepodobný viťaz: </span><strong>${possibleWinner}</strong></div>`
    );

  if (isGamePlayed) {
    const indexCurrentGame = games.findIndex((game) => game.id === id);

    const nextUnviewedGame = games
      .slice(indexCurrentGame + 1)
      .find((match) => !match.pastGameViewed);

    popup.append(`<hr />`);
    popup.append(
      `<div class="ui-content popup-next-game"><p>Zápas sa už odohral.</p><p>Pozrite nasledujúci zápas: <strong>${nextUnviewedGame.name}</strong></p></div>`
    );
  }

  const gamesDiv = $("#games");
  gamesDiv.empty();
  showEvents();
}
