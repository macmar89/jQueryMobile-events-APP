function sortGameByStartDate(games) {
  return games.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

//  ***
//  --- SAVE GAMES TO SESSION STORAGE ---
//  ***

function fetchGamesToStorage() {
  const jsonFile = "events.json";

  $.getJSON(jsonFile, function (data) {
    const sortedGamesByDate = sortGameByStartDate(data);

    const games = sortedGamesByDate.map((game) => {
      return { ...game, pastGameViewed: false };
    });

    sessionStorage.setItem("games", JSON.stringify(games));
  });
}

//  ***
//  --- FETCH SAVED GAMES IN SESSION STORAGE ---
//  ***

function fetchGamesFromSession() {
  return JSON.parse(sessionStorage.getItem("games")) || [];
}

//  ***
//  --- GET GAMES FROM JSON FILE ---
//  ***

function displayGames() {
  const data = fetchGamesFromSession();
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

//  ***
//  --- FORMAT DATE ---
//  ***

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString();
}

//  ***
//  --- FORMAT DATE ---
//  ***

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString();
}

//  ***
//  --- SET GAME AS pastGameViewed ---
//  ***

function setGameAsPastGameViewed(id) {
  const games = fetchGamesFromSession();
  const updatedGames = games.reduce((acc, game) => {
    if (game.id === id) {
      return [...acc, { ...game, pastGameViewed: true }];
    }
    return [...acc, game];
  }, []);
  sessionStorage.setItem("games", JSON.stringify(updatedGames));
}

//  ***
//  --- FILLING DATA FOR POPUP WINDOW ---
//  ***

function showGameDetail(id) {
  const games = fetchGamesFromSession();
  const currentGame = games.find((game) => game.id === id);
  const { startDate, name, possibleWinner, pastGameViewed } = currentGame;

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
    popup.append(`<hr />`);
    popup.append(
      `<div class="ui-content popup-next-game"><p>Zápas sa už odohral.</p><p>Pozrite nasledujúci zápas: bla vs. bla</p></div>`
    );
  }

  const gamesDiv = $("#games");
  gamesDiv.empty();
  displayGames();
}
