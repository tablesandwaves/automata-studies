import { logEvent, shuffle } from "./util.js";
import { Voice } from "./voice.js";


const STARTING_SEQUENCE = [ 0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0 ];


export class AccompanimentVoice extends Voice {
  leadVoice;
  randomStepIndex;
  randomStepMidi;
  indexMatches;
  midiNumMatches;
  availableIndices;
  availableMidiNoteNumbers;


  constructor(key, midiOut, channel, leadVoice) {
    super(key, midiOut, channel);
    this.leadVoice = leadVoice;

    this.#resetAccompaniment();
  }


  /**
   * Register a message from the lead voice.
   */
  notify(message) {
    if (message === "reset") {
      this.#resetAccompaniment();
    }
  }


  /**
   * Process the next sequencer step.
   */
  tick(step) {
    // Play any notes in the sequence as needed
    super.tick(step);

    // If we are on the current iteration's random step to try...
    if (step === this.randomStepIndex) {
      // Play the current random step MIDI number guess
      super.playNote(this.randomStepMidi, 250);
      // Then check whether the current guess is correct for the index and the MIDI note number.
      // Store the result in the appropriate fields so we know whether or not to pick new values
      // for the next round.
      [this.indexMatches, this.midiNumMatches] = this.leadVoice.verifyHarmony(step, this.randomStepMidi);
    }

    // When both portions of the guess match...
    if (this.indexMatches && this.midiNumMatches) {
      // Record the guess in the accompaniment's sequence
      this.sequence[step] = this.randomStepMidi;
      logEvent("AccompanimentVoice", "correct guess made", this.sequence)

      // Reset state tracking so new values are picked
      this.indexMatches   = false;
      this.midiNumMatches = false;
      this.#resetAvailableChoices();
    }

    if (step === this.sequence.length - 1) {
      this.#generateNewRandomStepData();
    }
  }


  /**
   * Start over because the lead voice has told us to.
   */
  #resetAccompaniment() {
    this.indexMatches   = false;
    this.midiNumMatches = false;

    this.sequence = STARTING_SEQUENCE.slice();
    logEvent("AccompanimentVoice", "resetting", this.sequence);
    this.#resetAvailableChoices();
    this.#generateNewRandomStepData();
  }


  /**
   * The correct accompaniment note the lead voice is looking for has not been found yet, so generate
   * new guesses.
   */
  #generateNewRandomStepData() {
    // The next random step will be one not played by the lead voice.
    if (!this.indexMatches) this.randomStepIndex = this.availableIndices.pop();

    // Guess the next random MIDI note the lead voice is looking for.
    if (!this.midiNumMatches) this.randomStepMidi = this.availableMidiNoteNumbers.pop();

    logEvent(
      "AccompanimentVoice", "next guess selected",
      `Step: ${this.randomStepIndex}, MIDI Note: ${this.randomStepMidi}`
    );

    if (this.randomStepIndex === undefined || this.randomStepMidi === undefined) {
      console.log(this);
      throw new Error("something was undefined")
    }
  }


  /**
   * After a correct guess has been made, reestablish the next set of guesses as randomly shuffled
   * arrays that generateNewRandomStepData() can pull from.
   */
  #resetAvailableChoices() {
    this.availableIndices = this.leadVoice.availableIndices.slice();
    shuffle(this.availableIndices);

    this.availableMidiNoteNumbers = this.key.scaleNotes.map((_, i) => this.key.degree(i + 1).midi);
    shuffle(this.availableMidiNoteNumbers);
  }
}
