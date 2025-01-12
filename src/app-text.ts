import { askQuestion, writeLine, addChapterTitle, newParagraph } from "./scratch-text.js";

// Game State
const inventory: string[] = [];
let lives = 3;
async function startGame(): Promise<void> {
    addChapterTitle("The Temple Ruins");
    writeLine("You stand before the entrance to a sprawling temple. Legends say it hides a treasure locked behind a magical door.");
    writeLine("To open the door, you must find the three sacred items: the Golden Compass, the Mystic Gem, and the Stone Relic.");

    await mainTemple();
}
async function mainTemple(): Promise<void> {
    addChapterTitle("The Main Hall");
    writeLine(`You are in the main hall of the temple. Lives remaining: ${lives}.`);
    writeLine("Three passages branch out before you.");

    const choice = await askQuestion(
        "Which passage will you explore?",
        "The Left Passage - The Artifact Room",
        "The Middle Passage - The Trap Corridor",
        "The Right Passage - The Puzzle Room",
        "Return to the Magical Door"
    );

    if (choice === 1) {
        await artifactRoom();
    } else if (choice === 2) {
        await trapCorridor();
    } else if (choice === 3) {
        await puzzleRoom();
    } else if (choice === 4) {
        await magicalDoor();
    }
}
 
function gameOver(): void {
    addChapterTitle("Game Over");
    writeLine("You have run out of lives and failed your quest. Perhaps next time, you will succeed.");
    askQuestion("Play again?", "Yes").then(() => {
      inventory.length = 0;
      lives = 3;
      startGame();
    });
  }
  

async function artifactRoom(): Promise<void> {
    addChapterTitle("The Artifact Room");
    writeLine("The room is filled with ancient treasures and broken relics. On the wall, you notice a faded mural depicting a proud eagle soaring through the sky.");

    const choice = await askQuestion(
        "Will you take the Golden Compass?",
        "Yes, take it",
        "No, leave it and explore elsewhere",
        "Return to the Main Hall"
    );

    if (choice === 1) {
        if (!inventory.includes("Golden Compass")) {
            inventory.push("Golden Compass");
            writeLine("You take the Golden Compass. It hums faintly in your hands, as though guiding you.");
        } else {
            writeLine("You've already taken the Golden Compass.");
        }
    } else if (choice === 2) {
        writeLine("You decide to leave the Golden Compass untouched for now.");
    }

    writeLine("You ponder the mural.  Could the eagle be significant?");
    await mainTemple();
}

async function trapCorridor(): Promise<void> {
    addChapterTitle("The Trap Corridor");
    writeLine("The corridor is lined with tiles marked with animal symbols: Snake, Eagle, and Wolf.");

    const choice = await askQuestion(
        "Which tile will you step on?",
        "Snake Tile",
        "Eagle Tile",
        "Wolf Tile",
        "Return to the Main Hall"
    );

    if (choice === 4) {
        writeLine("You decide to leave the corridor and return to the Main Hall.");
        return mainTemple();
    }

    if (choice === 2) {
        writeLine("The Eagle tile clicks softly, and a hidden compartment opens, revealing a Mystic Gem!");
        if (!inventory.includes("Mystic Gem")) {
            inventory.push("Mystic Gem");
            writeLine("You take the Mystic Gem and carefully place it in your bag.");
        } else {
            writeLine("You've already taken the Mystic Gem.");
        }
    } else {
        lives -= 1;
        writeLine(`The tile triggers a trap! You barely escape, but you lose a life. Lives remaining: ${lives}.`);
        if (lives <= 0) {
            return gameOver();
        }
    }

    await mainTemple();
}


async function puzzleRoom(): Promise<void> {
    addChapterTitle("The Puzzle Room");
    writeLine("The room contains a series of levers and inscriptions. Solving the puzzle might reveal something valuable.");
    writeLine("The inscription on the wall reads: 'The stars light the way, but only the moon can reveal the truth.'");

    let puzzleSolved = false;
    while (!puzzleSolved) {
        const choice = await askQuestion(
            "Which lever will you pull first?",
            "The Sun Lever",
            "The Moon Lever",
            "The Stars Lever",
            "Return to the Main Hall"
        );

        if (choice === 4) {
            writeLine("You decide to leave the puzzle for now and return to the Main Hall.");
            return mainTemple();
        }

        const secondChoice = await askQuestion(
            "Which lever will you pull second?",
            "The Sun Lever",
            "The Moon Lever",
            "The Stars Lever"
        );

        // Check if the sequence is correct (Stars → Moon)
        if (choice === 3 && secondChoice === 2) {
            writeLine("The correct sequence! The room shakes as a hidden compartment opens, revealing the Stone Relic.");
            if (!inventory.includes("Stone Relic")) {
                inventory.push("Stone Relic");
                writeLine("You take the Stone Relic and carefully place it in your bag.");
            }
            puzzleSolved = true;
        } else {
            writeLine("The levers reset with a loud clunk. The solution eludes you.");
        }
    }

    await mainTemple();
}


async function magicalDoor(): Promise<void> {
    addChapterTitle("The Magical Door");
    writeLine("You stand before the massive door. It shimmers with energy and has three slots for items.");

    if (
        inventory.includes("Golden Compass") &&
        inventory.includes("Mystic Gem") &&
        inventory.includes("Stone Relic")
    ) {
        writeLine("You place the Golden Compass, the Mystic Gem, and the Stone Relic into their respective slots.");
        writeLine("The door creaks open, revealing a hidden treasure chamber filled with gold and jewels!");
        endGame(true);
    } else {
        writeLine("You don't have all the required items. The door remains firmly shut.");
        await mainTemple();
    }
}

function endGame(success: boolean): void {
    if (success) {
        addChapterTitle("The Treasure Chamber");
        writeLine("Congratulations! You've successfully unlocked the treasure chamber and completed your quest!");
    } else {
        addChapterTitle("The End");
        writeLine("Your journey ends here. Perhaps next time, you will uncover the secrets of the temple.");
    }

    askQuestion("Play again?", "Yes").then(() => {
        inventory.length = 0; // Reset inventory
        startGame();
    });
}

// Start the game
startGame();
