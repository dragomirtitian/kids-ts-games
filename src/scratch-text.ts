const logElement = document.getElementById("log")!;
const choicesElement = document.getElementById("choices")!;
const questionElement = document.getElementById("question")!;

export function newParagraph(): void {
  const p = document.createElement("p");
  logElement.appendChild(p);
}

// Utility to write or continue a story line
export function writeLine(text: string): void {
  if (!logElement.lastElementChild) {
    newParagraph();
  }
  logElement.lastElementChild!.textContent += " " + text;
}

// Utility to add a chapter title
export function addChapterTitle(title: string): void {
  const h2 = document.createElement("h2");
  h2.textContent = title;
  logElement.appendChild(h2);
  newParagraph();
}

// Utility to ask a question and handle choices
export function askQuestion(question: string, ...choices: string[]): Promise<number> {

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
    };
    choicesElement.appendChild(button);
  });

  // Return a promise that resolves when a choice is made
  return new Promise<number>((resolve) => {
    resolveChoice = resolve;
  });
}
