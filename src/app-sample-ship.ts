import { delay, setBackground, createElement, stageWidth, stageHeight, repeatForever, onArrowLeft, onArrowRight, onArrowDown, onArrowUp, showInTop, showMessage, onCollisionBetween, repeatNTimes, createCircle, randomDelay, showInDebug } from "./scratch-lib.js";

async function main() {
    await delay(1000);
    setBackground("black");
    repeatNTimes(100, () => {
        let star = createCircle(3, "white");
        star.moveToRandomXY();
        repeatForever(async () => {
            star.color("yellow")
            await randomDelay(500);
            star.color("white")
            await randomDelay(1000);
            star.moveByRandomXY()
        });
    });
    repeatNTimes(4, () => {
        let planet = createCircle(20, "lightblue");
        planet.moveToRandomXY();
        repeatForever(async () => {
            planet.color("lightgreen");
            planet.moveRight(5);
            await randomDelay(500);
            planet.color("lightblue");
            await randomDelay(1000);
            planet.moveRight(5);
        });
    });
    let ship = createElement("ship.png");
    ship.moveTo(stageWidth / 2 - 50, stageHeight - 110);

    let rock = createElement("rock.png");
    rock.moveToRandomX();
    repeatForever(() =>{
        rock.moveDown(5);
        rock.moveByRandomX();
        rock.rotateLeft(30);
        if(rock.y > stageHeight) {
            rock.moveTo(0,0);
            rock.moveToRandomX();
        }
    }); 

    let comet = createElement("comet.png");
    comet.moveToRandomX();
    comet.moveDown(720);
    comet.rotateRight(40);
    repeatForever(() =>{
        comet.moveDown(15);
        comet.moveByRandomX();
        if(comet.y > stageHeight) {
            comet.moveTo(0,0);
            comet.moveToRandomX();
        }
    });

    onArrowLeft(() => {
        ship.moveLeft(10);
    });
    onArrowRight(() => {
        ship.moveRight(10);
    });
    onArrowDown(() => {
        ship.moveDown(10);
    })
    onArrowUp(() => {
        ship.moveUp(10);
    })
    let score = 0;
    let lives = 3;
    async function showScore() {
        if(lives === 0) {
            await showMessage("You lose!");
            lives = 3;
        }
        showInTop("Score ", score, " Lives:", "♥".repeat(lives))
    }

    async function flashBackGround() {
        await repeatNTimes(3, async () => {
            setBackground("red");
            await delay(100);
            setBackground("black");
        })

    }
    onCollisionBetween(ship, comet, async () => {
        lives = lives - 1;
        await showScore();
        await flashBackGround();
    })
    onCollisionBetween(ship, rock, async () => {
        lives = lives - 1;
        await showScore();
        await flashBackGround();
    })
    repeatNTimes(3, () => {
        let gift = createElement("diamond.png", 50);
        gift.moveToRandomXY();
        onCollisionBetween(ship, gift, async () => {
            score += 10;
            gift.hide();
            await delay(3000);
            gift.show();
            gift.moveToRandomXY();
            showScore();
        })
    });

    let heart = createElement("heart.png", 50)
    heart.moveToRandomXY();
    repeatForever(async () =>{
        heart.moveDown(15);
        if(heart.y > stageHeight) {
            await delay(5000); 
            heart.moveTo(0,0);
            heart.moveToRandomX();
        }
    });
    onCollisionBetween(ship, heart, () => {
        lives = lives + 1
        showScore();
        heart.moveDown(stageHeight);
    })
}

main();