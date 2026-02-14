import { askChoiceQuestion, write, addChapterTitle, newParagraph } from "./scratch-text.js";

// Game State
const inventory: string[] = [];
let lives = 3;
async function startGame(): Promise<void> {
    addChapterTitle("The Temple Ruins");
    write("You stand before the entrance to a sprawling temple. Legends say it hides a treasure locked behind a magical door.");
    write("To open the door, you must find the three sacred items: the Golden Compass, the Mystic Gem, and the Stone Relic.");

    await mainTemple();
}
async function mainTemple(): Promise<void> {
    addChapterTitle("The Main Hall");
    write(`You are in the main hall of the temple. Lives remaining: ${lives}.`);
    write("Three passages branch out before you.");

    const choice = await askChoiceQuestion(
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
    write("You have run out of lives and failed your quest. Perhaps next time, you will succeed.");
    askChoiceQuestion("Play again?", "Yes").then(() => {
      inventory.length = 0;
      lives = 3;
      startGame();
    });
  }
  

async function artifactRoom(): Promise<void> {
    addChapterTitle("The Artifact Room");
    write("The room is filled with ancient treasures and broken relics. On the wall, you notice a faded mural depicting a proud eagle soaring through the sky.");

    const choice = await askChoiceQuestion(
        "Will you take the Golden Compass?",
        "Yes, take it",
        "No, leave it and explore elsewhere",
        "Return to the Main Hall"
    );

    if (choice === 1) {
        if (!inventory.includes("Golden Compass")) {
            inventory.push("Golden Compass");
            write("You take the Golden Compass. It hums faintly in your hands, as though guiding you.");
        } else {
            write("You've already taken the Golden Compass.");
        }
    } else if (choice === 2) {
        write("You decide to leave the Golden Compass untouched for now.");
    }

    write("You ponder the mural.  Could the eagle be significant?");
    await mainTemple();
}

async function trapCorridor(): Promise<void> {
    addChapterTitle("The Trap Corridor");
    write("The corridor is lined with tiles marked with animal symbols: Snake, Eagle, and Wolf.");

    const choice = await askChoiceQuestion(
        "Which tile will you step on?",
        "Snake Tile",
        "Eagle Tile",
        "Wolf Tile",
        "Return to the Main Hall"
    );

    if (choice === 4) {
        write("You decide to leave the corridor and return to the Main Hall.");
        return mainTemple();
    }

    if (choice === 2) {
        write("The Eagle tile clicks softly, and a hidden compartment opens, revealing a Mystic Gem!");
        if (!inventory.includes("Mystic Gem")) {
            inventory.push("Mystic Gem");
            write("You take the Mystic Gem and carefully place it in your bag.");
        } else {
            write("You've already taken the Mystic Gem.");
        }
    } else {
        lives -= 1;
        write(`The tile triggers a trap! You barely escape, but you lose a life. Lives remaining: ${lives}.`);
        if (lives <= 0) {
            return gameOver();
        }
    }

    await mainTemple();
}


async function puzzleRoom(): Promise<void> {
    addChapterTitle("The Puzzle Room");
    write("The room contains a series of levers and inscriptions. Solving the puzzle might reveal something valuable.");
    write("The inscription on the wall reads: 'The stars light the way, but only the moon can reveal the truth.'");

    let puzzleSolved = false;
    while (!puzzleSolved) {
        const choice = await askChoiceQuestion(
            "Which lever will you pull first?",
            "The Sun Lever",
            "The Moon Lever",
            "The Stars Lever",
            "Return to the Main Hall"
        );

        if (choice === 4) {
            write("You decide to leave the puzzle for now and return to the Main Hall.");
            return mainTemple();
        }

        const secondChoice = await askChoiceQuestion(
            "Which lever will you pull second?",
            "The Sun Lever",
            "The Moon Lever",
            "The Stars Lever"
        );

        // Check if the sequence is correct (Stars → Moon)
        if (choice === 3 && secondChoice === 2) {
            write("The correct sequence! The room shakes as a hidden compartment opens, revealing the Stone Relic.");
            if (!inventory.includes("Stone Relic")) {
                inventory.push("Stone Relic");
                write("You take the Stone Relic and carefully place it in your bag.");
            }
            puzzleSolved = true;
        } else {
            write("The levers reset with a loud clunk. The solution eludes you.");
        }
    }

    await mainTemple();
}


async function magicalDoor(): Promise<void> {
    addChapterTitle("The Magical Door");
    write("You stand before the massive door. It shimmers with energy and has three slots for items.");

    if (
        inventory.includes("Golden Compass") &&
        inventory.includes("Mystic Gem") &&
        inventory.includes("Stone Relic")
    ) {
        write("You place the Golden Compass, the Mystic Gem, and the Stone Relic into their respective slots.");
        write("The door creaks open, revealing a hidden treasure chamber filled with gold and jewels!");
        endGame(true);
    } else {
        write("You don't have all the required items. The door remains firmly shut.");
        await mainTemple();
    }
}

function endGame(success: boolean): void {
    if (success) {
        addChapterTitle("The Treasure Chamber");
        write("Congratulations! You've successfully unlocked the treasure chamber and completed your quest!");
    } else {
        addChapterTitle("The End");
        write("Your journey ends here. Perhaps next time, you will uncover the secrets of the temple.");
    }

    askChoiceQuestion("Play again?", "Yes").then(() => {
        inventory.length = 0; // Reset inventory
        startGame();
    });
}

// Start the game
startGame();
