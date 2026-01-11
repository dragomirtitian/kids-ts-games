const logElement = document.getElementById("log")!;
const choicesElement = document.getElementById("choices")!;
const questionElement = document.getElementById("question")!;

export function newParagraph(): void {
  const p = document.createElement("p");
  logElement.appendChild(p);
}

export function clear(): void {
  logElement.innerHTML = "";
  choicesElement.innerHTML = "";
  questionElement.innerHTML = "";
}
// Utility to write or continue a story line
export function write(text: string | number): void {
  if(typeof text === "number") {
    text = "Value: " + text;
  }
  if (!logElement.lastElementChild) {
    newParagraph();
  }
  logElement.lastElementChild!.append(text);
}
export function writeParagraph(text: string | number): void {
  write(text);
  newParagraph();
}

export function writeImage(imageUrl: string): void {
  if (!logElement.lastElementChild) {
    newParagraph();
  }
  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.float = "left";
  img.style.marginRight = "10px";
  img.style.maxWidth = "200px";
  logElement.lastElementChild!.appendChild(img);
}

// Utility to add a chapter title
export function addChapterTitle(title: string, heading = 1): void {
  const h2 = document.createElement("h" + heading);
  h2.textContent = title;
  logElement.appendChild(h2);
  newParagraph();
}
let isEchoOn = true;
let globalEchoFunction: (text: string) => void = writeParagraph;
export function echo(on: boolean, echoFunction: (text: string) => void = writeParagraph): void {
  isEchoOn = on;
  globalEchoFunction = echoFunction;
} 
// Utility to ask a question and handle choices
export function askChoiceQuestion(question: string, ...choices: string[]): Promise<number> {

  let resolveChoice: (choice: number) => void;

  // Create choice buttons
  questionElement.innerHTML = question;
  choicesElement.innerHTML = ""
  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.onclick = () => {
      resolveChoice(index + 1); // Return the chosen index
      choicesElement.innerHTML = ""; // Clear buttons
      questionElement.innerHTML = ""; // Clear question
      if(isEchoOn) {
        globalEchoFunction(`${question}`);
        globalEchoFunction(`${choice}`)
      }
    };
    choicesElement.appendChild(button);
  });

  // Return a promise that resolves when a choice is made
  return new Promise<number>((resolve) => {
    resolveChoice = resolve;
  });
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollDice(message?: string, maxValue: number = 6): Promise<number> {
  return new Promise((resolve) => {
    questionElement.innerHTML = message ?? `Roll the dice (1-${maxValue})`;
    choicesElement.innerHTML = "";
    
    const button = document.createElement("button");
    button.textContent = "🎲 Roll Dice";
    button.onclick = () => {
      const result = randomNumber(1, maxValue);
      choicesElement.innerHTML = ""; // Clear buttons
      questionElement.innerHTML = "";
      if (isEchoOn) {
        globalEchoFunction(`Rolled a ${result}!`);
      }
      resolve(result);
    };
    choicesElement.appendChild(button);
  });
}

export function askNumberQuestion(question: string): Promise<number> {
  return new Promise((resolve) => {
    questionElement.innerHTML = question;
    const input = document.createElement("input");
    input.type = "number";
    choicesElement.innerHTML = "";
    choicesElement.appendChild(input);
    const validaionMessage = document.createElement("p");
    function submitInput() {
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        resolve(value);
        choicesElement.innerHTML = ""; // Clear buttons
        if(isEchoOn) {
          questionElement.innerHTML = "";
          globalEchoFunction(`${question} ${value}`);
        }else {
          questionElement.innerHTML = "";
        }
      } else {
        validaionMessage.innerText = "Please enter a valid number.";
      }

    }
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        submitInput();
      }
    });

    const button = document.createElement("button");
    button.textContent = "Submit";
    button.onclick = () => {
      submitInput();
    };
    choicesElement.appendChild(button);
    choicesElement.appendChild(validaionMessage);

  });
}

export function exit(message: string) {
  writeParagraph(message);
  throw new Error("You died");
}