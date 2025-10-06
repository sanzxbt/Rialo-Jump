//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//rialo
let rialoWidth = 46;
let rialoHeight = 46;
let rialoX = boardWidth / 2 - rialoWidth / 2;
let rialoY = boardHeight * 7 / 8 - rialoHeight;
let rialoRightImg;
let rialoLeftImg;

let rialo = {
    img: null,
    x: rialoX,
    y: rialoY,
    width: rialoWidth,
    height: rialoHeight
}

//physics
let velocityX = 0;
let velocityY = 0; //rialo jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw rialo
    // context.fillStyle = "green";
    // context.fillRect(rialo.x, rialo.y, rialo.width, rialo.height);

    //load images
    rialoRightImg = new Image();
    rialoRightImg.src = "./rialo-right.png";
    rialo.img = rialoRightImg;
    rialoRightImg.onload = function () {
        context.drawImage(rialo.img, rialo.x, rialo.y, rialo.width, rialo.height);
    }

    rialoLeftImg = new Image();
    rialoLeftImg.src = "./rialo-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveRialo);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //rialo
    rialo.x += velocityX;
    if (rialo.x > boardWidth) {
        rialo.x = 0;
    }
    else if (rialo.x + rialo.width < 0) {
        rialo.x = boardWidth;
    }

    velocityY += gravity;
    rialo.y += velocityY;
    if (rialo.y > board.height) {
        gameOver = true;
    }
    context.drawImage(rialo.img, rialo.x, rialo.y, rialo.width, rialo.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && rialo.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY; // slide platform down
        }
        if (detectCollision(rialo, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; //jump
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth / 7, boardHeight * 7 / 8);
    }
}

function moveRialo(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 4;
        rialo.img = rialoRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -4;
        rialo.img = rialoLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        //reset
        rialo = {
            img: rialoRightImg,
            x: rialoX,
            y: rialoY,
            width: rialoWidth,
            height: rialoHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);

    // platform = {
    //     img : platformImg,
    //     x : boardWidth/2,
    //     y : boardHeight - 150,
    //     width : platformWidth,
    //     height : platformHeight
    // }
    // platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); //(0-1) * boardWidth*3/4
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        }

        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); //(0-1) * boardWidth*3/4
    let platform = {
        img: platformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50 * Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}