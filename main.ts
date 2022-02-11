import { randomInt } from "crypto";
import { readFileSync } from "fs";

const dict = readFileSync("dictionary.txt", "utf-8").split('\n');

function randomWord(dict: string[]) {
    return dict[randomInt(dict.length)];
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

function runThing() {
    let newDict = dict;
    const constraints = createConstraintSet(5);
    const targetWord = randomWord(dict);
    
    let guesses = 0;
    while (newDict.length > 1) {
        const givenWord = randomWord(newDict);
        guesses++;
    
        checkWord(givenWord, targetWord, constraints);
        newDict = constrainDict(constraints, newDict);
    }
    if (newDict.length < 1) {
        throw new Error("OWNED");
    }

    return guesses;
}

const runs = 1000;
const gs = [];
for (let i = 0; i < runs; i++) {
    gs.push(runThing());
}
console.log(gs.reduce((p, c) => p + c, 0) / gs.length);
console.log((gs.length - gs.filter(i => i > 6).length) / gs.length);