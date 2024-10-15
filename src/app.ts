import { delay, setBackground, createElement, stageWidth, stageHeight, repeatForever, onArrowLeft, onArrowRight, onArrowDown, onArrowUp, showInTop, showMessage, onCollisionBetween, repeatNTimes, createCircle, randomDelay, showInDebug, askForANumber, onKeyDown } from "./scratch-lib.js";

async function main() {
    let ship = createElement("ship.png");
    // repeatForever(async () => {
    //     ship.moveRight(200)
    //     await delay(1000)
    //     ship.moveDown(150)
    // });
    onArrowRight(async () => {
        ship.moveRight(10);
    })
    onKeyDown("A", async () => {
        ship.moveDown(10);
    })

    ship.onClick(() => {
        ship.moveToRandomXY();
    })

}

main();