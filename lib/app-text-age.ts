import { askChoiceQuestion, write, addChapterTitle, newParagraph, askNumberQuestion, clear, writeParagraph, rollDice } from "./scratch-text.js";

async function converter() {
    let km = await askNumberQuestion(`How many km?`);
    let m = 1000 * km;
    writeParagraph(`The number of meters is ${m}`);
    write("Hi!!")
    write("Hi!!")
}
// converter();

async function main() {
    await rollDice("Roll", 6);
    let year = await askNumberQuestion(`What year is it?`);
    writeParagraph(`The year is ${year}`)
    let ageMara = year - 2017;
    let ageAna = ageMara + 2
    if (ageMara >= 0) {
        writeParagraph(`mara's age: ${ageMara}`);
    }
    if (ageAna >= 0) {
        writeParagraph(`Ana's age: ${ageAna}`)
    }

    let ageDad = ageAna + 30
    if (ageDad >= 0) {
        if (ageDad === 0) {
            writeParagraph(`Dad has just has been born`)
        } else {
            writeParagraph(`Dad's age is: ${ageDad}`)
        }

        if (ageDad > 30) {
            writeParagraph(`Dad is old`)
        } else {
            writeParagraph(`Dad is young`)
        }
    }


    let ageMom = ageMara + 33
    if (ageMom >= 0) {
        writeParagraph(`mom's age ${ageMom}`)
    }

}

main();