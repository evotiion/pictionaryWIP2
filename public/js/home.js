var easyList = ["sun", "balloon", "orange", "clock", "face", "ghost", "family", "basketball", "bench", "swing", "angel", "dog", "chair", "island", "chimney", "cow", "hippo", "curl", "broom", "candle", "crab", "leaf", "mountains", "girl", "doll", "window", "kitten", "caterpillar", "zigzag", "butterfly"]
var mediumList = ["meteor", "notebook", "hummingbird", "stem", "electrical outlet", "cracker", "cabin", "ladder", "volcano", "coyote", "scar", "gingerbread man", "computer", "mouse", "window", "ironing board", "nun", "blue jeans", "school bus", "chest", "yardstick", "pineapple", "yo-yo", "lap", "trip", "sleep", "poodle", "chain", "ambulance", "toy"]
var hardList = ["drip", "turtleneck", "shrew", "reveal", "yawn", "landlord", "economics", "staple", "atlas", "spare", "chameleon", "swamp", "wheelie", "clamp", "obey", "robe", "parking garage", "tow", "houseboat", "Heinz 57", "engaged", "mirror", "glitter", "edit", "diagonal", "plastic", "dew", "captain", "nanny", "front"]

let easyWord = "";
let mediumWord = "";
let hardWord = "";

let easyListLength = easyList.length;
let mediumListLength = mediumList.length;
let hardListLength = hardList.length;

//let socket = io();

var roomName = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
let socket = io({
    query: {
        roomName: roomName,
    },
});

socket.emit("playerJoin", roomName, sessionStorage.getItem('username'));

let randomNum;

let holdMessage;
let holdWord;

let currentDifficulty = "";
sessionStorage.setItem('score', 0);

let timer = 100;
let pointValue = 1;

let gameStarted = false;

let guessRight = false;

console.log("From home.js");
const lobby = $('#lobby')[0];
const game = $('#game')[0];
const startButton = $('#start-game')[0];
const drawingCanvas = $('#drawing-canvas')[0];
const chatHistory = $('#chat-history')[0];
const chatInput = $('#chat-input')[0];
const sendButton = $('#send-button')[0];
const easyButton = $('#easy-button')[0];
const mediumButton = $('#medium-button')[0];
const hardButton = $('#hard-button')[0];

easyButton.addEventListener('click', () => {
    if (easyListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (easyList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "easy";
        easyWord = easyList[randomNum];
        socket.emit("word", easyWord, currentDifficulty);
        easyList[randomNum] = null;
        easyListLength--;
    }
});
mediumButton.addEventListener('click', () => {
    if (mediumListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (mediumList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "medium";
        mediumWord = mediumList[randomNum];
        socket.emit("word", mediumWord, currentDifficulty);
        mediumList[randomNum] = null;
        mediumListLength--;
    }
});

hardButton.addEventListener('click', () => {
    if (hardListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (hardList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "hard";
        hardWord = hardList[randomNum];
        socket.emit("word", hardWord, currentDifficulty)
        hardList[randomNum] = null;
        hardListLength--;
    }
});

var wordHolder = "";

socket.on("word", (word, difficulty) => {
    currentDifficulty = difficulty;
    wordHolder = word;
    holdWord = word.replace(/\S/g, '?'); // Replace non-space characters with question marks
    console.log(holdWord);
    $("#displayWord").html(holdWord);
});

function myFunction1() {
    var sliderNum = $("#rating").val();
    $("#rating2").val(sliderNum);
}
function myFunction2() {
    var inputNum = $("#rating2").val();
    $("#rating").val(inputNum);
}

let isDrawing = false;
let context = drawingCanvas.getContext('2d');

// startButton.addEventListener('click', () => {
//     lobby.style.display = 'none';
//     game.style.display = 'block';
//     // Start the game logic
//     gameStarted = true;
//     startGame();
// });

startButton.addEventListener('click', () => {
  console.log(roomName);

  $.ajax({
      url: "/ifCanStart",
      type: "POST",
      data: { lobbyName: roomName, host: sessionStorage.getItem('sessionID') },
      success: function (data) {
          console.log(data); // Log the response
          if (data.success) {//is host
              console.log("Yes host");
              lobby.style.display = 'none';
              game.style.display = 'block';
              // Start the game logic
              startGame();
          }
          else {
              console.log("not host");
              alert("Only host can start");
          }
      },
      dataType: "json"
  });

});


sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    chatInput.value = "";
    if (message == wordHolder && guessRight == false) {
        socket.emit("chat message", "Got the word!", sessionStorage.getItem('username'));
        if (currentDifficulty == "easy") {
            sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(100 * pointValue));
            socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
            guessRight = true;
        }
        else if (currentDifficulty == "medium") {
            sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(200 * pointValue));
            socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
            guessRight = true;
        }
        else if (currentDifficulty == "hard") {
            sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(300 * pointValue));
            socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
            guessRight = true;
        }
    } else {
        socket.emit("chat message", message, sessionStorage.getItem('username')); // Send the message to the serve
        socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
    }
});

// Handle receiving and displaying chat messages
socket.on("chat message", (message, username) => {
    holdMessage = message;
    displayMessage(username, message); // Display messages from other users
    $("#leaderboard tr").each(function () {
        if ($(this).find("td:eq(0)").text() == sessionStorage.getItem('username')) {
            $(this).find("td:eq(1)").text(sessionStorage.getItem('score'));
        }
    });

});

function displayMessage(sender, message) {
    var messageElement = $('<div>').text("(" + sessionStorage.getItem('score') + ")" + sender + ': ' + message);
    chatHistory.appendChild(messageElement[0]); // Append message to chat history
}

socket.on("send Score", (username, score) => {
    console.log(username + score + "ss");

    $("#leaderboard tr").each(function () {
      if ($(this).find("td:eq(0)").text() == username) {
          $(this).find("td:eq(1)").text(score);
      }
  });

});


//SOCKET.IO CODE FOR DRAWING ON CANVAS

let lastX, lastY;

drawingCanvas.addEventListener('mousedown', () => {
    isDrawing = true;
    lastX = event.clientX - drawingCanvas.offsetLeft;
    lastY = event.clientY - drawingCanvas.offsetTop;
    context.beginPath();
    context.moveTo(lastX, lastY);
});

drawingCanvas.addEventListener('mousemove', () => {
    if (isDrawing) {
        const currentX = event.clientX - drawingCanvas.offsetLeft;
        const currentY = event.clientY - drawingCanvas.offsetTop;
        context.lineTo(currentX, currentY);
        context.stroke();

        // Emit the drawing data and settings to other players
        socket.emit("draw", {
            fromX: lastX,
            fromY: lastY,
            toX: currentX,
            toY: currentY,
            lineWidth: $("#rating").val(), // Send line width
            strokeStyle: $("#color").val(), // Send stroke style (color)
        });

        lastX = currentX;
        lastY = currentY;
    }
});

drawingCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
    context.closePath();
});

// Handle receiving and displaying drawing data
// Handle receiving and displaying drawing data
socket.on("draw", (data) => {
    console.log("Someone is currently drawing")
    context.beginPath();
    context.moveTo(data.fromX, data.fromY);
    context.lineWidth = data.lineWidth; // Set line width
    context.strokeStyle = data.strokeStyle; // Set stroke style (color)
    context.lineTo(data.toX, data.toY);
    context.lineCap = "round"
    context.stroke();
});

let holdPlayers = [];
let holdRemove;

socket.on("updatePlayersDisconnect", (player) => {
    const index = holdPlayers.indexOf(player);
    if (index > -1) { // only splice array when item is found
        holdPlayers.splice(index, 1); // 2nd parameter means remove one item only
    }
    console.log(holdPlayers)
    $("#playerCount").empty();
    $("#playerCount").append(("Players: " + holdPlayers + (", ")));
});

socket.on("updatePlayers", (check, players) => {
    holdPlayers = players;
    console.log("Hello from updatePlayers socket code: " + holdPlayers);
    if (check == false) {
        $("#playerCount").empty();
        $("#playerCount").append(("Players: " + holdPlayers + (", ")));
        $("#leaderboard tr").remove();
        for (var i = 0; i < holdPlayers.length; i++) {
            $("#leaderboard").append("<tr><td>" + holdPlayers[i] + "</td><td>" + sessionStorage.getItem('score') + "</td></tr>");
        }


    }
});

polling();

function polling() {
    if (gameStarted) {
        if (pointValue > .5) {
            pointValue -= .01;
        }
        timer--;
        if (timer <= 0) {
            timeOver();
        }
    }

    let numMilliSeconds = 1000;   // 1000 milliseconds = 1 second
    setTimeout(polling, numMilliSeconds);
}
