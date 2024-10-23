interface GameElementProtected {
    readonly element: HTMLElement;
    readonly matrix?: boolean[][] | undefined
}
abstract class GameElement {
    #x = 0;
    #y = 0;
    #htmlElement!: HTMLElement;
    #rotation = 0;
    #onUpdate: (target: GameElement) => void;
    #isVisible: boolean =  true;
    protected get element() { return this.#htmlElement }
    get x() { return this.#x; }
    get y() { return this.#y; }
    get rotation() { return this.#rotation; }
    rotateTo(degrees: number) {
        this.#rotation = degrees;
        this.update();
    }
    rotateLeft(degrees: number) {
        this.#rotation -= degrees;
        this.update();
    }
    rotateRight(degrees: number) {
        this.#rotation += degrees;
        this.update();
    }
    protected update() {
        this.#htmlElement.style.display = this.#isVisible ? "block": "none";
        this.#htmlElement.style.opacity = this.#isVisible ? "1": "0";
        this.#htmlElement.style.left = `${this.#x}px`;
        this.#htmlElement.style.top = `${this.#y}px`;
        this.#htmlElement.style.transform = `rotate(${this.#rotation}deg)`;
        this.#onUpdate?.(this);
    }
    moveTo(x: number, y: number) {
        this.#x = x;
        this.#y = y;
        this.update();
    }

    moveBy(dx: number, dy: number) {
        this.#x += dx;
        this.#y += dy;
        this.update();
    }
    moveUp(dy = 1) {
        this.#y -= dy;
        this.update();

    }
    
    moveDown(dy = 1) {
        this.#y += dy; 
        this.update();

    }

    
    moveLeft(dx = 1) {
        this.#x -= dx;
        this.update();

    }
    
    moveRight(dx = 1) {
        this.#x += dx;
        this.update();

    }
    moveByRandomXY() {
        this.moveByRandomX();
        this.moveByRandomY();
    }
    moveByRandomX() {
        const rect = this.#htmlElement.getBoundingClientRect();
        const max = rect.width * 0.25;
        this.#x += Math.random() * max - max/2;
        this.update(); 
    }
    
    moveByRandomY() {
        const rect = this.#htmlElement.getBoundingClientRect();
        const max = rect.height * 0.25;
        this.#y += Math.random() * max - max/2;
        this.update(); 
    }
    moveToRandomX() {
        const rect = this.#htmlElement.getBoundingClientRect();
        this.#x = Math.random() * (stageWidth - rect.width);
        this.update(); 
    }
    
    moveToRandomY() {
        const rect = this.#htmlElement.getBoundingClientRect();
        this.#y = Math.random() * (stageHeight - rect.height);
        this.update();
    }
    get width() { return this.#htmlElement.getBoundingClientRect().width; }
    get height() { return this.#htmlElement.getBoundingClientRect().height; }

    moveToRandomXY() {
        this.moveToRandomX();
        this.moveToRandomY();
    }
    hide() {
        this.#isVisible = false;
        this.update();
    }
    show() {
        this.#isVisible = true;
        this.update();
    }

    onClick(cb: () => void) {
        this.#htmlElement.addEventListener("click", cb);
    }

    onHit(element: GameElement, cb: () => void) {
        onCollisionBetween(this, element, cb);
    }

    constructor(createElement: () => HTMLElement, onUpdate: (target: GameElement) => void, style: Partial<CSSStyleDeclaration>) {
        const element = createElement();
        this.#onUpdate = onUpdate;
        copyStyle(element.style, style);
        element.style.position = "absolute"
        // element.style.outlineStyle = "solid"
        // element.style.outlineColor = "red"
        // element.style.outlineWidth = "0.1px"
        
        stage.appendChild(element)
        this.#htmlElement = element;
    }
}  

function isOverlapping(element1: GameElementProtected, element2:  GameElementProtected) {
    const rect1 = element1.element.getBoundingClientRect();
    const rect2 = element2.element.getBoundingClientRect();
    if (rect1.right < rect2.left ||
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom) {
        return false;
    }

    const matrix1 = element1.matrix;
    const matrix2 = element2.matrix;
    if(!matrix1 || !matrix2) return true;
    // Now, check pixel-perfect transparency collision
    const xOverlapStart = Math.floor(Math.max(rect1.left, rect2.left));
    const xOverlapEnd = Math.floor(Math.min(rect1.right, rect2.right));
    const yOverlapStart = Math.floor(Math.max(rect1.top, rect2.top));
    const yOverlapEnd = Math.floor(Math.min(rect1.bottom, rect2.bottom));

    const x1 = Math.floor(rect1.x);
    const y1 = Math.floor(rect1.y);
    const x2 = Math.floor(rect2.x);
    const y2 = Math.floor(rect2.y);

    for (let x = xOverlapStart; x < xOverlapEnd; x++) {
        for (let y = yOverlapStart; y < yOverlapEnd; y++) {
            const img1X = x - x1;
            const img1Y = y - y1;
            const img2X = x - x2;
            const img2Y = y - y2;
            if (!matrix1[img1Y]?.[img1X] && !matrix2[img2Y]?.[img2X]) {
                return true; // Non-transparent pixels overlap
            }
        }
    }
    return false;
}

function delayNoPause(time: number): Promise<void> {
    return new Promise(r => setTimeout(r, time));
}

export function randomDelay(maxTime: number) {
    return delay(maxTime / 2 + Math.random() * (maxTime / 2))
}
export async function delay(time: number): Promise<void> {
    await delayNoPause(time);
    while(isPause) {
        await delayNoPause(500);
    }
}
function addCollisionListener(target: GameElement, other: GameElement, state: { lastResult: boolean }, cb: () => void) {
    let existing = collisionListeners.get(target);
    if(!existing) {
        collisionListeners.set(target, existing = []);
    }
    existing.push({
        target: other,
        handler: cb,
        state,
    })
}
export function onCollisionBetween(a: GameElement, b: GameElement, cb: () => void) {
    const state = { lastResult: false };
    addCollisionListener(a, b, state, cb);
    addCollisionListener(b, a, state, cb);
}
const stage = document.getElementById('stage') as HTMLElement;
(async function () {
    await delay(100);
    while(true) {
        const stageRect = stage.getBoundingClientRect();
        stageHeight = stageRect.height;
        stageWidth = stageRect.width;
        await delay(5000);
    }
})()
export let stageHeight = 100;
export let stageWidth = 100;

const collisionListeners = new Map<GameElement, Array<{
    target: GameElement,
    handler: () => void,
    state: { lastResult: boolean }
}>>();
async function executeCollisionHandlers(target: GameElement) {
    const collisionListenersForTarget = collisionListeners.get(target);
    if(!collisionListenersForTarget) return;
    await delay(100);
    for (let other of collisionListenersForTarget) {
        const isOverlappingNow = isOverlapping(target as any as GameElementProtected, other.target as any as GameElementProtected);
        if(isOverlappingNow 
           && isOverlappingNow !== other.state.lastResult
        ) {
            other.handler();
        }
        other.state.lastResult = isOverlappingNow;
    }
}

export function createCircle(size: number, color: string) {
    return new DivElement(executeCollisionHandlers, {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${size / 2}px`,
        backgroundColor: color, 
    })
}
export function createSquare(size: number, color: string) {
    return new DivElement(executeCollisionHandlers, {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color, 
    })
}
export function createElement(image: string, width = 100) {
    return new ImageElement(executeCollisionHandlers, "./images/" + image, {
        width: `${width}px`
    });
}

function copyStyle(target: CSSStyleDeclaration, src: Partial<CSSStyleDeclaration>) {
    for(const prop of Object.keys(src) as Array<keyof CSSStyleDeclaration>) {
        (target as any)[prop] = src[prop]
    }
}

class ImageElement extends GameElement {
    constructor(onUpdate: (target: GameElement) => void, src: string, style: Partial<CSSStyleDeclaration>){
        super(() => {
            const element = document.createElement("img");
            element.src = src;
            return element;
        }, onUpdate, style);
    }
    #matrix: boolean[][] | undefined
    protected get matrix() {
        return (this.#matrix ??=this.#createTransparencyMatrix())
    }
    // Create a transparency matrix for the image
    #createTransparencyMatrix(): boolean[][] {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not create canvas context");

        ctx.drawImage(this.element as HTMLImageElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const transparencyMatrix: boolean[][] = [];

        for (let y = 0; y < canvas.height; y++) {
            const row: boolean[] = [];
            for (let x = 0; x < canvas.width; x++) {
                const alphaIndex = (y * canvas.width + x) * 4 + 3; // Alpha is the fourth value in RGBA
                row.push(imageData.data[alphaIndex] === 0); // true if transparent
            }
            transparencyMatrix.push(row);
        }
        return transparencyMatrix;
    }
}

class DivElement extends GameElement {
    
    #color: string;
    color(color: string) {
        this.#color = color;
        this.update();
    }
    constructor(onUpdate: (target: GameElement) => void, style: Partial<CSSStyleDeclaration>){
        super(() => document.createElement("div"), (x) => {
            this.element.style.backgroundColor = this.#color;
            onUpdate(x);
        }, style);
        this.#color = style.backgroundColor!;
    }
}



export function showQuestionBox(config: {
    title?: string,
    question?: string,
    placeholder?: string,
    showInput?: boolean,
    showCancel?: boolean,
}) {
    return new Promise<string | null>((resolve) => {
        pauseAll();
        const questionTitle = document.getElementById('questionTitle') as HTMLElement;
        const questionText = document.getElementById('questionText') as HTMLElement;
        const questionBox = document.getElementById('questionBox') as HTMLElement;
        const input = document.getElementById('answerInput') as HTMLInputElement;
        const btnOk = document.getElementById('btnOk') as HTMLButtonElement;
        const btnCancel = document.getElementById('btnCancel') as HTMLButtonElement;

        btnCancel.style.display = !config.showCancel ? "none": "";
        questionTitle.innerText = config.title ??"";
        questionText.innerText = config.question ??"";
        questionBox.style.display = 'flex'; // Show the question box
        input.style.display = !config.showInput? "none": "";
        input.value = ''; // Clear previous input
        input.placeholder = config.placeholder ?? "";


        // Handle answer submission
        btnOk.onclick = () => {
            questionBox.style.display = 'none'; // Hide the question box after submission
            const answer = input.value.trim();
            continueAll();
            resolve(answer); // Return the user's input as the result
        };

        btnCancel.onclick = () => {
            questionBox.style.display = 'none'; // Hide the question box after submission
            continueAll();
            resolve(null);
        }
    });
}

export function showMessage(message:string, title?: string) {
    return showQuestionBox({
        title,
        question: message,
        showCancel: false,
        showInput: false
    })
}

export function showAnswer(value: string | number, message?:string, title?: string) {
    return showQuestionBox({
        title,
        question: `${message??""}${value}`,
        showCancel: false,
        showInput: false
    })
}
export async function askForANumber(question: string, title?: string) {
    while(true) {
        const value = await showQuestionBox({
            title,
            question,
            showInput: true,
            showCancel: false,
        });
        
        if(value === null || isNaN(+value)) {
            await showMessage(`Value '${value}' is not a number`)
        } else {
            return +value;
        }

    }
}
export function start(cb: () => Promise<void>) {
    cb();
}
export function showInDebug(...value: any[]) {
    document.getElementById("debug")!.innerText = value.join(", ");
}
export function showInTop(...value: any[]) {
    document.getElementById("top")!.innerText = value.join("");
}
export function showInBottom(...value: any[]) {
    document.getElementById("bottom")!.innerText = value.join("");
}

export function onAnyKeyDown(cb: (key: string) => void) {
    stage.focus();
    window.addEventListener("keydown", e => {
        e.preventDefault();
        if(isPause) return;
        cb(e.key)
    })
}

export function onArrowLeft(cb: () => void) {
    onKeyDown("ArrowLeft", cb);
}

export function onArrowRight(cb: () => void) {
    onKeyDown("ArrowRight", cb);
}

export function onKeyDown(key: string, cb: () => void) {
    onAnyKeyDown(k => {
        if(k.toLowerCase() === key.toLowerCase()) {
            cb();
        }
    });
}

export function onArrowUp(cb: () => void) {
    onKeyDown("ArrowUp", cb);
}

export function onArrowDown(cb: () => void) {
    onKeyDown("ArrowDown", cb);
}
export async function repeatForever(cb: () => Promise<void> | void) {
    while(true) {
        await cb();
        await delay(50)
    }
}

interface Timer {
    isActive: boolean;
    onActivate(): Promise<void>
    reset(): Promise<void>;
}
export function createTimer(total: number) {
    let resolveActivation: () => void = undefined!;
    let activation = new Promise<void>(r => resolveActivation = r);
    const timer: Timer = {
        isActive: false,
        onActivate() {
            return activation;
        },
        reset() {
            resolveActivation();
            this.isActive = true;
            return new Promise(r => setTimeout(() => { 
                this.isActive = false;
                activation = new Promise<void>(r => resolveActivation = r);
                r()
            }, total ));
        },
    }
    return timer;
}

export function repeatWhileTimer(timer: Timer, cb: () => Promise<void> | void) {
    repeatForever(async () => {
        if(timer.isActive) {
            await cb();
        } else {
            await timer.onActivate();
        }
    })
}

export async function repeatEvery(everyMilliseconds: number, cb: () => Promise<void> | void) {
    while(true) {
        await cb();
        await delay(everyMilliseconds)
    }
}

export async function repeatNTimes(count: number, cb: () => Promise<void> | void) {
    for(let i = 0; i< count; i++) {
        let r = cb();
        if(typeof r !== "undefined") {
            await r;
        }
    }
}

export function setBackground(color: string) {
    stage.style.backgroundColor = color;
}

let isPause = false;
export function pauseAll() {
    isPause = true
}

export function continueAll(){
    isPause = false;
}