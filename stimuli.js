
const MIN_DIGITS = 3;       // The minimum number of numbers in one sequence
const MAX_DIGITS = 14;      // The maximum number
const MIN_PRACTICE = 2;     // The minimum number in the practice fase
const MAX_PRACTICE = 3;     // The maximum number in the practice
const NUM_REPEATS = 2;      // The number of times a sequence of n items repeats

let PRACTICE_LIST = [];

let TEST_ITEMS = [];

const SOUND_FILES = Array.from([0,1,2,3,4,5,6,7,8,9], x => {
    return "sounds/" + x + ".wav";
});

/**
 * returns the path of the sound stimuli
 */
function getAudioStimuli() {
    return SOUND_FILES;
}

/**
 * returns whether or not the experiment uses audio.
 */
function experimentUsesAudio() {
    return getAudioStimuli().length > 0;
}

/**
 * Creates a sequence of integers in the range [0, 10).
 *
 * @Returns {Array<number>}
 */
function randomSequence(n) {
    let seq = []
    while (seq.length < n) {
        let random_int = Math.floor(Math.random() * 10)
        seq.push(random_int);
    }
    return seq;
}

/**
 * Checks whether the sequence is correct.
 * It is considered correct if:
 *   - there no repeating numbers.
 *   - the sequence is not consecutive if forward or backward direction.
 *
 * @returns {boolean} true if the 
 */
function validateSequence(sequence) {
    function has_doubles(seq) {
        let found_double = false;
        for (let i = 1; i < seq.length && !found_double; i++) {
            if (seq[i] === seq[i-1])
                found_double = true;
        }
        return found_double;
    }

    // sequences such as [1,2,3] are invalid
    function is_consecutive(seq) {
        let all_consecutive = true;
        if (seq.length <= 1)
            return false;
        for (let i = 1; i < seq.length && all_consecutive ; i++) {
            if (seq[i] - seq[i-1] !== 1)
                all_consecutive = false;
        }
        return all_consecutive;
    }

    // sequences such as [3,2,1] are invalid
    function is_consecutive_rev(seq) {
        return is_consecutive(Array.from(seq).reverse());
    }

    if (has_doubles(sequence)) {
        console.debug("has_doubles");
        return false;
    }
    if (is_consecutive(sequence)) {
        console.debug("is_consecutive");
        return false;
    }
    if (is_consecutive_rev(sequence)) {
        console.debug("is_rev_consecutive");
        return false;
    }

    return true;
}

class ParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "ParameterError";
    }
}

/**
 * Generate a set of stimuli.
 * @param {number} min an integer of the minimum number of stimuli in a sequence
 * @param {number} max an integer of the maximum number of stimuli in a sequence
 * @param {number} n_repeats The number of repeats of a sequence with the same
 *                           length.
 *
 * This function creates an array of trials of the digitspan. In each trial
 * a number of digits is presented. The number of digits increases over time.
 * n_repeats controls how many repetitions of sequences of the same length
 * appears in a row.
 *
 * @returns {Array<Array<integer>>} An array with arrays of digits per trial.
 */
function generateStimuli(min, max, n_repeats) {

    if (max < min) {
        throw new ParameterError("Max should be greater than min")
    }
    if (max <= 0 || min <= 0 || n_repeats <= 0) {
        throw new ParameterError("min, max and n_repeats should be larger than 0");
    }

    let sequences = []

    for (let i = min; i <= max; i++) {
        let valid_sequences = [];
        while (valid_sequences.length < n_repeats) {
            let sequence = randomSequence(i);
            if (validateSequence(sequence)) {
                valid_sequences.push(sequence);
            }
        }

        valid_sequences.forEach(function (seq) {sequences.push(seq);});
    }

    return sequences;
}

/**
 * Generates an array of object that is useful as timeline variables
 *
 * The input is an array of sequences. This is turned in an output array
 * where each input sequence is added to object with the sequence and the
 * expected answer for this sequence
 * Each object contains the numbers as wav file and a string that is the
 * expected result of the trial 
 *
 * @return {Array<Object>}
 */
function sequencesToTimeline(input, path="./sounds/", suffix=".wav") {
    let output = []
    input.forEach((sequence) => {
        let trial_params = {
            stimuli : [],
            answer : ""
        };
        sequence.forEach((number) => {
            trial_params.stimuli.push(path + number + suffix);
            trial_params.answer += number;
        });
        output.push(trial_params);
    });
    return output;
}

/**
 * Generates and returns the list of practice stimuli
 *
 * @return {Array<string>}
 */
function getPracticeItems() {
    let temp = generateStimuli(MIN_PRACTICE, MAX_PRACTICE, 1);
    PRACTICE_LIST = sequencesToTimeline(temp);
    return PRACTICE_LIST; 
}

/**
 * Generates and returns the list of test stimuli
 *
 * @return {Array<string>}
 */
function getTestItems() {
    let temp = generateStimuli(MIN_DIGITS, MAX_DIGITS, NUM_REPEATS);
    TEST_ITEMS  = sequencesToTimeline(temp);
    return TEST_ITEMS;
}

