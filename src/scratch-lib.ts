interface GameElementProtected {
    readonly element: HTMLElement;
    readonly matrix?: boolean[][] | undefined
}
abstract class GameElement<T extends HTMLElement = HTMLElement> {
    #x = 0;
    #y = 0;
    #htmlElement!: T;
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
    destroy() {
        stage.removeChild(this.element);
    }
    [Symbol.dispose]() {
        this.destroy()
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

    onHit(element: GameElement, cb: (x: number, y: number) => void) {
        onCollisionBetween(this, element, cb);
    }

    constructor(createElement: () => T, onUpdate: (target: GameElement) => void, style: Partial<CSSStyleDeclaration>) {
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
        return null;
    }

    const matrix1 = element1.matrix;
    const matrix2 = element2.matrix;
    // Now, check pixel-perfect transparency collision
    const xOverlapStart = Math.floor(Math.max(rect1.left, rect2.left));
    const xOverlapEnd = Math.floor(Math.min(rect1.right, rect2.right));
    const yOverlapStart = Math.floor(Math.max(rect1.top, rect2.top));
    const yOverlapEnd = Math.floor(Math.min(rect1.bottom, rect2.bottom));

    if(!matrix1 || !matrix2) return [xOverlapStart, yOverlapStart] as const;

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
            const m1 = matrix1[img1Y]?.[img1X];
            const m2 = matrix2[img2Y]?.[img2X]
            if (m1 === false && m2 === false) {
                return [x, y] as const; // Non-transparent pixels overlap
            }
        }
    }
    return null;
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
function addCollisionListener(target: GameElement, other: GameElement, state: { lastResult: boolean }, cb: (x: number, y: number) => void) {
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
export function onCollisionBetween(a: GameElement, b: GameElement, cb: (x: number, y: number) => void) {
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
    handler: (x: number, y: number) => void,
    state: { lastResult: boolean }
}>>();
async function executeCollisionHandlers(target: GameElement) {
    const collisionListenersForTarget = collisionListeners.get(target);
    if(!collisionListenersForTarget) return;
    await delay(100);
    for (let other of collisionListenersForTarget) {
        const isOverlappingNow = isOverlapping(target as any as GameElementProtected, other.target as any as GameElementProtected);
        if(isOverlappingNow 
           && !!isOverlappingNow !== other.state.lastResult
        ) {
            other.handler(...isOverlappingNow);
        }
        other.state.lastResult = !!isOverlappingNow;
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

class ImageElement extends GameElement<HTMLImageElement> {
    constructor(onUpdate: (target: GameElement) => void, src: string, style: Partial<CSSStyleDeclaration>){
        super(() => {
            const element = document.createElement("img");
            element.src = src;
            return element;
        }, onUpdate, style);
    }
    #matrix: boolean[][] | undefined
    protected get matrix() {
        return (this.#matrix ??= createTransparencyMatrix(this.element))
    }
}

function createTransparencyMatrix(element: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const bound = element.getBoundingClientRect();
    canvas.width = bound.width;
    canvas.height = bound.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Could not create canvas context");

    ctx.drawImage(element, 0, 0, canvas.width, canvas.height);

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
/**
 * Create paths with https://boxy-svg.com/app
 * @param fileName 
 * @param totalSteps 
 * @returns 
 */
export function createPath(fileName: string, totalSteps = 100) {
    return new AnimationPath("./images/" + fileName, totalSteps);
}
class AnimationPath {
    #pathElements: SVGPathElement[] = [];
    #pathPromise: Promise<void>;
    #totalSteps: number;

    constructor(fileName: string, totalSteps: number) {
        this.#pathPromise = this.#loadPaths(fileName);
        this.#totalSteps = totalSteps;
    }

    async #loadPaths(fileName: string) {
        const response = await fetch(fileName);
        const svgContent = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const elements = Array.from(doc.querySelectorAll('path, ellipse, line, rect, circle')) as SVGGeometryElement[];


        if (elements.length === 0) {
            throw new Error('No paths found in the SVG');
        }
        // Convert primitive shapes to paths, and keep normal paths as they are
        this.#pathElements = elements.map(convertToPath);
        function convertToPath(el: SVGGeometryElement): SVGPathElement {
            let pathData = '';
    
            switch (el.tagName.toLowerCase()) {
                case 'path': 
                    return el as SVGPathElement;
                case 'ellipse': {
                    const cx = el.getAttribute('cx') || '0';
                    const cy = el.getAttribute('cy') || '0';
                    const rx = el.getAttribute('rx') || '0';
                    const ry = el.getAttribute('ry') || '0';
                    pathData = `M${+cx - +rx},${cy} A${rx},${ry} 0 1,0 ${+cx + +rx},${cy} A${rx},${ry} 0 1,0 ${+cx - +rx},${cy}`;
                    break;
                }
                case 'circle': {
                    const cx = el.getAttribute('cx') || '0';
                    const cy = el.getAttribute('cy') || '0';
                    const r = el.getAttribute('r') || '0';
                    pathData = `M${+cx - +r},${cy} A${r},${r} 0 1,0 ${+cx + +r},${cy} A${r},${r} 0 1,0 ${+cx - +r},${cy}`;
                    break;
                }
                case 'line': {
                    const x1 = el.getAttribute('x1') || '0';
                    const y1 = el.getAttribute('y1') || '0';
                    const x2 = el.getAttribute('x2') || '0';
                    const y2 = el.getAttribute('y2') || '0';
                    pathData = `M${x1},${y1} L${x2},${y2}`;
                    break;
                }
                case 'rect': {
                    const x = el.getAttribute('x') || '0';
                    const y = el.getAttribute('y') || '0';
                    const width = el.getAttribute('width') || '0';
                    const height = el.getAttribute('height') || '0';
                    pathData = `M${x},${y} H${+x + +width} V${+y + +height} H${x} Z`;
                    break;
                }
            }
    
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('d', pathData);
            return pathElement;
        }
    }

    #getTotalLength(): number {
        return this.#pathElements.reduce((total, path) => total + path.getTotalLength(), 0);
    }

    #getPathSegments(): { path: SVGPathElement, length: number }[] {
        return this.#pathElements.map(path => ({
            path,
            length: path.getTotalLength(),
        }));
    }
    async moveAlong(
        moveCallback: (dx: number, dy: number) => Promise<void>
    ) {
        await this.#pathPromise;

        const pathSegments = this.#getPathSegments();
        const totalLength = this.#getTotalLength();
        
        let previousPoint: DOMPoint | null = null;  // This will hold the last point from the previous path

        for (const { path, length } of pathSegments) {
            const stepsForPath = Math.round((length / totalLength) * this.#totalSteps);
            const stepLength = length / stepsForPath;

            for (let step = 0; step <= stepsForPath; step++) {
                const currentLength = step * stepLength;
                const currentPoint = path.getPointAtLength(currentLength);

                if (previousPoint === null) {
                    // If it's the first point of the first path, no need to calculate dx/dy
                    previousPoint = currentPoint;
                }

                // Calculate the relative movement dx and dy
                const dx = currentPoint.x - previousPoint.x;
                const dy = currentPoint.y - previousPoint.y;

                // Move by the relative difference
                await moveCallback(dx, dy);

                // Update the previous point to the current one
                previousPoint = currentPoint;
            }

            // After finishing a path, set the next path's first point as the new starting point
            previousPoint = path.getPointAtLength(0);  // Reset to the starting point of the next path
        }
    }
}

interface SpritePose<T extends string>{ name : T, frames: SpriteFrame[], isReady?:Promise<void> }

interface SpriteFrame {
    imageUrl: string;
    width: number;
    height: number;
}


/**
 * https://www.gamedevmarket.net
 * https://craftpix.net/
 * https://opengameart.org/
 * https://itch.io/
 */
export function createSprite<T extends string>(width: number, ...poses: SpritePose<T>[]): SpriteElement<T> {
    return new SpriteElement<T>(poses, executeCollisionHandlers, {
        width: `${width}px`
    });
}

const spriteCache = new Map<string, SpritePose<any>>();
export function fromSingleImage<T extends string>(fileName: `${T}.png`, framesPerRow: number, framesPerColumn: number): SpritePose<T> {
    const imageUrl = "./images/"+fileName;
    const image = new Image();
    image.src = imageUrl;
    const pose = fileName.split('.')[0];
    const frames: SpriteFrame[] = [];
    let result: SpritePose<T> | undefined = spriteCache.get(imageUrl + "|" + pose);
    if(result === undefined){
        result =  {
            name:  pose as T,
            frames,
            isReady: doLoad(), 
        };
        spriteCache.set(imageUrl + "|" + pose, result)
    }
    return result;
    async function doLoad(): Promise<void> {
        return new Promise((resolve, reject) => {
            image.onload = () => {
                const frameWidth = Math.floor(image.width / framesPerRow);
                const frameHeight = Math.floor(image.height / framesPerColumn);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d',{
                    willReadFrequently: true,
                });
                if (!ctx) {
                    reject(new Error("Could not get 2D context"));
                    return;
                }

                for (let row = 0; row < framesPerRow; row++) {
                    for (let col = 0; col < framesPerColumn; col++) {
                        canvas.width = frameWidth;
                        canvas.height = frameHeight;

                        ctx.clearRect(0, 0, frameWidth, frameHeight);
                        ctx.drawImage(image, col * frameWidth, row * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                        
                        // Convert canvas to data URL (PNG format) and store it
                        const frameUrl = canvas.toDataURL('image/png');

                        frames.push({
                            imageUrl: frameUrl,  // Use the data URL
                            width: frameWidth,
                            height: frameHeight,
                        });
                    }
                }
                delete result!.isReady
                resolve();
            };
            image.onerror = reject;
        });
    }
}

export function fromMultipleImages<T extends string>(fileNameTemplate: string, poseName: T, frames: number): SpritePose<T> {
    const spriteFrames: SpriteFrame[] = [];
    let result: SpritePose<T> | undefined = spriteCache.get(fileNameTemplate + "|" + poseName);
    if(!result) {
        result = {
            name: poseName,
            frames: spriteFrames,
            isReady: doLoad()
        };
        spriteCache.set(fileNameTemplate + "|" + poseName, result);
    }
    return result;
    async function doLoad(): Promise<void> {
        for (let i = 1; i <= frames; i++) {
            const frameNumber = i.toString().padStart(2, '0');
            const imageUrl = "./images/" + fileNameTemplate.replace('NN', frameNumber);
            const img = new Image();
            img.src = imageUrl;

            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d', {
                        willReadFrequently: true,
                    })!;
                    ctx?.drawImage(img, 0, 0);

                    // Convert canvas to data URL (PNG format) and store it
                    const frameUrl = canvas.toDataURL('image/png');

                    spriteFrames.push({
                        imageUrl: frameUrl,
                        width: img.width,
                        height: img.height,
                    });
                    delete result!.isReady;
                    resolve()
                };
                img.onerror = reject;
            });
        }
    }
}

interface SpritePose<T extends string> { 
    name: T; 
    frames: SpriteFrame[];
    isReady?: Promise<void>;
}

interface SpriteFrame {
    imageUrl: string;
    width: number;
    height: number;
    collisionMatrix?: boolean[][]
}

class SpriteElement<T extends string> extends GameElement<HTMLImageElement> {
    
    #poses: Map<T, SpritePose<T>>;
    #currentPose!: SpritePose<T>;
    #currentFrameIndex: number = 0;

    constructor(poses: SpritePose<T>[], onUpdate: (target: GameElement) => void, style: Partial<CSSStyleDeclaration>) {
        super(() => document.createElement("img"), onUpdate, style);

        this.#poses = new Map(poses.map(pose => [pose.name, pose]));
        this.selectPose(poses[0].name); // Default to the first pose after loading frames

    }

    // Select a new pose to run
    selectPose(pose: T): void {
        if (!this.#poses.has(pose)) {
            console.error(`Pose "${pose}" not found.`);
            return;
        }
        this.#currentPose = this.#poses.get(pose)!;
        this.#currentFrameIndex = 0;
        if(this.#currentPose.isReady) {
            this.#currentPose.isReady.then(() => this.update());
        }else{
            this.update();
        }
    }

    // Update the current frame image
    protected update() {
        super.update()
        const frame = this.#currentPose.frames[this.#currentFrameIndex];
        this.element.src = frame?.imageUrl;
    }

    resetFrame(): void {
        this.#currentFrameIndex = 0;
    }
    // Move to the next frame in the current pose
    nextFrame(): void {
        if(isNaN(this.#currentFrameIndex)) {
            this.#currentFrameIndex = 0;
        }
        this.#currentFrameIndex = (this.#currentFrameIndex + 1) % this.#currentPose.frames.length;
        this.update();
    }

    protected get matrix() {
        const frame = this.#currentPose.frames[this.#currentFrameIndex];
        if(!frame) return null;
        return frame.collisionMatrix ??= createTransparencyMatrix(this.element);
    } 
    // Run the current pose's sequence for a specified duration (in ms)
    async run(duration: number, pose?: T): Promise<void> {
        if(pose) {
            this.selectPose(pose);
        }
        if(this.#currentPose.isReady) {
            await this.#currentPose.isReady;
        }
        const totalFrames = this.#currentPose.frames.length;
        const frameTime = duration / totalFrames;
        
        for (let i = 0; i < totalFrames; i++) {
            this.nextFrame();
            await new Promise(resolve => setTimeout(resolve, frameTime));
        }
    }
}
