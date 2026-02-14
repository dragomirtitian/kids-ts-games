#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

// Get spell name from command line args or prompt
const args = process.argv.slice(2);
let spellName: string | undefined = args[0];

async function promptSpellName(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout  
  });

  return new Promise((resolve) => {
    rl.question('Enter spell name: ', (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function forgeSpell(): Promise<void> {
  // Get spell name if not provided
  if (!spellName) {
    spellName = await promptSpellName();
  }

  if (!spellName) {
    console.error('❌ Error: Spell name is required');
    process.exit(1);
  }

  // Sanitize the spell name for file names (remove special characters, replace spaces with dashes)
  const sanitizedName = spellName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  if (!sanitizedName) {
    console.error('❌ Error: Invalid spell name');
    process.exit(1);
  }

  const spellBookDir = path.join(import.meta.dirname, '..', '..', 'spell-book', sanitizedName);
  const templatesDir = path.join(import.meta.dirname, '..', '..', 'templates');
  
  // Create spell-book directory if it doesn't exist
  if (!fs.existsSync(spellBookDir)) {
    fs.mkdirSync(spellBookDir, { recursive: true });
  }

  const tsFilePath = path.join(spellBookDir, `${sanitizedName}.ts`);
  const htmlFilePath = path.join(spellBookDir, `${sanitizedName}.html`);

  // Check if files already exist
  if (fs.existsSync(tsFilePath)) {
    console.error(`❌ Error: TypeScript file already exists: ${tsFilePath}`);
    process.exit(1);
  }

  if (fs.existsSync(htmlFilePath)) {
    console.error(`❌ Error: HTML file already exists: ${htmlFilePath}`);
    process.exit(1);
  }

  // Create TypeScript file with basic template
  const tsTemplate = `// ${spellName}
import { askChoiceQuestion, write, addChapterTitle, newParagraph, askNumberQuestion, clear, writeParagraph, rollDice, exit, writeImage, randomNumber, askTextQuestion } from "../../lib/scratch-text.js";

writeParagraph(\`✨🔮🪄\`)
`;

  fs.writeFileSync(tsFilePath, tsTemplate, 'utf8');
  console.log(`✨ Created TypeScript file: spell-book/${sanitizedName}.ts`);

  // Read and modify the HTML template
  const templatePath = path.join(templatesDir, 'index-text.html');
  
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Error: Template file not found: ${templatePath}`);
    process.exit(1);
  }

  let htmlContent = fs.readFileSync(templatePath, 'utf8');
  
  // Update the title
  htmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>${spellName}</title>`);
  
  // Update the script src to point to the new built JS file
  htmlContent = htmlContent.replace(
    /src="\.\/built\/.*?\.js"/,
    `src="../../built/spell-book/${sanitizedName}/${sanitizedName}.js"`
  );

  fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
  console.log(`✨ Created HTML file: spell-book/${sanitizedName}.html`);

  console.log('\n🎉 Spell forged successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Edit your spell logic in: spell-book/${sanitizedName}/${sanitizedName}.ts`);
  console.log(`2. Summon you Noble Potion Maker to brew the spell: npm run brew`);
  console.log(`3. Preview spell-book/${sanitizedName}/${sanitizedName}.html`);
}

forgeSpell().catch((err: Error) => {
  console.error('❌ Error forging spell:', err.message);
  process.exit(1);
});
