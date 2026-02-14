import { askChoiceQuestion, write, addChapterTitle, newParagraph, askNumberQuestion, clear, writeParagraph, rollDice, exit, writeImage, randomNumber, askTextQuestion } from "./scratch-text.js";

let gold = 0;
let hp = 100;
let weaponAttack = 10;
async function fluffyBattle() {
    addChapterTitle("The Skeleton!", 2)
    writeImage(`./images/skeleto.png`);
    writeParagraph(`The traveler goes into the forest and he wonder around`)
    writeParagraph(`The traveler meets a dagerous beast called Fluffy. 
        He is fluffy but has HUGE fangs 🦷`);
    
    let fluffyHp = 30;
    let fluffyAttack = 20;
    while(fluffyHp > 0) {
        let attackRoll = await rollDice(`Roll to see if you defeat fluffy`, 20);
        if(attackRoll > 10) {
            writeParagraph(`You hit fluffy`);
            fluffyHp = fluffyHp - weaponAttack;
        } else {
            writeParagraph(`You missed fluffy`)
        }
        let fluffyRoll = await randomNumber(0, 20);
        if(fluffyRoll > 10) {
            writeParagraph(`Fluffy hit you!`);
            hp = hp - fluffyAttack;
        }else {
            writeParagraph(`Fluffy missed you!`);
        }
        writeParagraph(`You still have ${hp} fluffy has ${fluffyHp}`);
    }
    gold = gold + 10;
    writeParagraph(`You defeated fluffy. You now have ${gold}🪙`)
}
async function skeletoBattle() {
    
    addChapterTitle("The Skeleton!")

    writeParagraph(`The traveler meets another dangerous beask taht is just a skeleton 
        of a bunny called Skeleto 🦴🦴`);

    
    let skeletoRoll = await rollDice(`Roll to see if you defeat fluffy`, 20);
    if(skeletoRoll < 5) {
        exit(`Fluffy defeated you. You are dead 💀`)
    }
    gold = gold + 50;
    writeParagraph(`You made it to the end of the forest! Congratiolations! 
        You now have ${gold} 🪙`);

}

async function takeHp(damage: number) {
    hp -= damage;
    if(hp < 0) {
        exit(`You died`);
    }
}
async function battle(monsterHp: number, monsterName: string, monsterAttack: number) {
    while(monsterHp > 0) {
        let attackRoll = await rollDice(`Roll to see if you defeat fluffy`, 20);
        if(attackRoll > 10) {
            writeParagraph(`You hit fluffy`);
            monsterHp = monsterHp - weaponAttack;
        } else {
            writeParagraph(`You missed fluffy`)
        }
        let fluffyRoll = await randomNumber(0, 20);
        if(fluffyRoll > 10) {
            writeParagraph(`${monsterName} hit you!`);
            hp = hp - monsterAttack;
        }else {
            writeParagraph(`${monsterName} missed you!`);
        }
        writeParagraph(`You still have ${hp} ${monsterName} has ${monsterHp}`);
    }
}

async function forest() {
    addChapterTitle("The Forest...")
    
    await fluffyBattle()
    
    await skeletoBattle();
    // photosynthesis 
}
// pollen 

/**
 * 1. Move Your existing code into a forest function
 * 2. Create a new castle function ( just add a chapter title )
 * 3. Add two monster battles in the castle 
 * 4. How to let the user choose what quest to do 
 * 5. Once a quest finishes. Go back and let the user choose a quest again 
 */
async function main() {
    await forest()
}

main();