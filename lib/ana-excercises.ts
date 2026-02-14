import { askNumberQuestion, askTextQuestion, randomNumber, writeImage, writeParagraph } from "./scratch-text.js";

async function askForName() {
    let a = await askNumberQuestion(`Tell me your age`);
    
    let name = await askTextQuestion(`Tell me your name`);
    
    // writeParagraph(`You name is ${name} and your age is ${a}`);
    greeting(name, a)
}

function doubleAge(age: number) {
    let n = 2 * age;
    return n;
}

function greeting(n:string,age:number) {
    writeParagraph(`Hello ${n}. You are ${age} years old`)
}

async function main() {
    let n = 5;
    let m = `Mara`
    let r = `Test ${m} ${n}`
    n = 6
    let theNewAge = doubleAge(50 + 1);
    writeParagraph(`Double the age is ${theNewAge}`);
    writeParagraph(`Double the age is ${doubleAge(50 + 1)}`);


    greeting("Ana", 10)
    greeting("Titian", 40)
    greeting("Mara", 8)
    writeParagraph(`Test ${m} ${n}`)
    writeParagraph(r)
    await askForName();
}

let x = await askNumberQuestion(`What?s`);
main();



















async function ex4() {
    let firstNumber = await askNumberQuestion(`Please can you insert a number.`)
    let secondNumber = await askNumberQuestion(`Please can you insert another number.`)
    let sum = secondNumber + firstNumber
    writeParagraph(`you got ${sum} as your number.`)
    writeParagraph(`When you multiply these 2 numbers you get ${secondNumber * firstNumber}.`)
    writeParagraph(`Another thing which you can do with these 2 numbers
         is divide which then equals ${secondNumber / firstNumber} 
         (remainder: ${secondNumber % firstNumber}) `)
}

//ex4()

async function ex5() {
    let N = await askNumberQuestion(`Please can you insert a number.`)
    if (N > 10) writeParagraph(`Your number is bigger than ten.`)
    if (N < 10) writeParagraph(`Your number is smaller than ten.`)
    if (N === 10) writeParagraph(`Your number is equal to ten.`)
}

async function ex5b() {
    let N = await askNumberQuestion(`Please can you insert a number.`)
    if (N > 10) {
        writeParagraph(`Your number is bigger than ten.`)
    } else {
        writeParagraph(`Your number is smaller than ten.`)
    }
}
//ex5()

async function ex6(){
    let A = await askTextQuestion(`Please can you insert a word.`)
    writeParagraph(`If you say your word 2 times it will say ${A} ${A}.`)
}
// ex6()

async function ex7() {
    let target = randomNumber(0, 10);
    let guess = await askNumberQuestion(`What is your guess?`);
    while(guess !== target) {
        if(guess > target) {
            writeParagraph(`The number is too big`)
        } else {
            writeParagraph(`The number is too small`)
        }
        guess = await askNumberQuestion(`Try again: `);
    }
    writeParagraph(`Congratulations you guessed ${target}🥳`)
}
// ex7()


function sayHello(name: string, age: number) {
    writeParagraph(`Hi ${name}. Your age is ${age}`);
}


let typeOfImage = "scary";
function showImage(name: string) {
    writeImage(`./images/${typeOfImage}/${name}`);
}
// showImage("ogre.jpg")
// // showImage("skeleto.png")


// async function askForNameAndSayHello() {
//     let n = await askTextQuestion(`What is your name?`)
//     let a = await askNumberQuestion(`How old are you?`);
//     sayHello(n,a)
// }

// await askForNameAndSayHello();
// await askForNameAndSayHello();



// function doubleTheAge(age:number) {
//     return age * 2;
// }

// function areYouOld(name: string, age: number) {
//     if(age > 50) {
//         return `${name}, you are old!`
//     }else {
//         return `${name}, you are still young`;
//     }
// }

// let msg1 = areYouOld("Titian", 40);

// writeParagraph(msg1)


// sayHello(`Ana`, 10);

// sayHello(`Mara`, 8);

// let anaDouble = doubleTheAge(10);
// let maraDouble = doubleTheAge(8);

// writeParagraph(`Double the ages ${anaDouble}, ${maraDouble}`)




