import { randomInt } from "crypto";
import { readFileSync } from "fs";

const dict = readFileSync("dictionary.txt", "utf-8").split('\n');

function randomWord(dict: string[]) {
    return dict[randomInt(dict.length)];
}

function bestWord(dict: string[]) {
    const letterCounter: Map<string, number> = new Map();
    for (const w of dict) {
        for (const l of w) {
            const v = letterCounter.get(l);
            if (v) {
                letterCounter.set(l, v + 1);
            } else {
                letterCounter.set(l, 1);
            }
        }
    }
    let word = "";
    let value = 0;
    for (const w of dict) {
        let curValue = 0;
        for (const l of new Set(w)) {
            curValue += letterCounter.get(l) || 1;
        }
        if (curValue >= value) {
            word = w;
            value = curValue;
        }
    }
    return word;
}

function checkWord(givenWord: string, targetWord: string, constraintSet: ConstraintSet) {
    const givenSet = new Set(givenWord)
    const targetSet = new Set(targetWord);

    // First pass to remove all exact same letters
    for (let i = 0; i < givenWord.length; i++) {
        const letter = givenWord[i];
        if (letter === targetWord[i]) {
            constraintSet[i] = new Set([letter]);
        }
    }

    // second pass to compare the givenSet and targetSet
    for (const [l] of givenSet) {
        if (targetSet.has(l)) {
            for (let i = 0; i < givenWord.length; i++) {
                if (givenWord[i] === l && givenWord[i] !== targetWord[i]) {
                    constraintSet[i].delete(l);
                }
            }
            constraintSet.letterSet.add(l);
        } else {
            for (const s of constraintSet) {
                s.delete(l);
            }
        }
    }
}

function constrainDict(constraints: ConstraintSet, dict: string[]): string[] {
    const availableWords = [];
    for (const w of dict) {
        let wordStays = true;

        for (let i = 0; i < w.length; i++) {
            if (!constraints[i].has(w[i])) {
                wordStays = false;
            }
        }

        const thisSet = new Set(w);

        if (!Array.from(constraints.letterSet).every(l => thisSet.has(l))) {
            wordStays = false;
        }

        if (wordStays) {
            availableWords.push(w);
        }
    }
    return availableWords;
}

function createConstraints() {
    const letters: string[] = [];
    for (let i = 0; i < 26; i++) {
        letters.push(String.fromCharCode(i + 97));
    }
    return new Set(letters);
}

class ConstraintSet extends Array<Set<string>> {
    letterSet: Set<string> = new Set();
}

function createConstraintSet(len: number) {
    const constraintSet = new ConstraintSet();
    for (let i = 0; i < len; i++) {
        constraintSet.push(createConstraints());
    }
    return constraintSet;
}

function runThing(randomizer: (d: string[]) => string, targetWord: string) {
    let newDict = dict;
    const constraints = createConstraintSet(5);
    
    let guesses = 0;
    while (newDict.length > 1) {
        const givenWord = randomizer(newDict);
        // console.log(givenWord);
        guesses++;
    
        checkWord(givenWord, targetWord, constraints);
        newDict = constrainDict(constraints, newDict);
    }
    if (newDict.length < 1) {
        throw new Error("OWNED");
    }

    return guesses;
}

function runThings(randomizer: (d: string[]) => string, randomList: string[]) {
    const gs = [];
    for (const w of randomList) {
        gs.push(runThing(randomizer, w));
    }
    console.log("Avg guesses: " + gs.reduce((p, c) => p + c, 0) / gs.length);
    console.log("Success rate: " + (gs.length - gs.filter(i => i > 6).length) / gs.length);
}

const runs = 10000;

const randomList = [];
for (let i = 0; i < runs; i++) {
    randomList.push(randomWord(dict));
}

console.log("Random Word");
runThings(randomWord, randomList);

console.log("Best Word");
runThings(bestWord, randomList);
