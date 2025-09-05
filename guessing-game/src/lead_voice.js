import { logEvent } from "./util.js";
import { Voice } from "./voice.js";


// const STARTING_STEPS = [ 1, 0, 0, 1,  0, 0, 1, 0,  0, 0, 1, 0,  1, 0, 0, 0 ];
const STARTING_STEPS = [ 1, -1, 0, 0,  1, -1, 0, -1,  0, 0, 1, -1,  1, -1, 0, 0 ];

export class LeadVoice extends Voice {
  observingVoices;
  evolve;
  desiredAccompanimentIndex;
  desiredAccompanimentMidiNumber;
  availableIndices;


  constructor(key, midiOut, channel) {
    super(key, midiOut, channel);

    this.observingVoices = [];
    this.evolve = false;

    this.#resetSequence();
    this.generateDesiredAccompanimentData();
  }


  /**
   * Add an observing/accopmanying voice to the observers.
   */
  subscribe(accompanyingVoice) {
    this.observingVoices.push(accompanyingVoice);
  }


  /**
   * Process the next sequencer step.
   */
  tick(step) {
    // Play observing voices first since this will result in their call to verify harmony, which will
    // determine whether or not it is time to evolve. Note that the order is very important to avoid
    // race conditions regarding the need to evolve and the last step index in the sequence.
    this.observingVoices.forEach(voice => voice.tick(step));

    // Play any notes in the sequence as needed
    super.tick(step);

    // On the last step of the sequence loop, check whether it is time to evolve. The verify harmony
    // call from observing/accompanying voices sets the evolve flag to true when an evolving voice has
    // guessed the correct note.  Then select a new
    if (step === this.sequence.length - 1 && this.evolve) {
      // Under these conditions, first update the MIDI notes for this lead voice to random scale notes
      // (the lead voice rhythm stays fixed).
      this.sequence.forEach((s, i) => {
        this.sequence[i] = s > 0 ? this.key.degree(Math.ceil(Math.random() * this.key.scaleNotes.length)).midi : s;
      });
      logEvent("LeadVoice", "evolving sequence", this.sequence, true);

      // Then select a new random sequence step for accompanying voices to guess.
      this.generateDesiredAccompanimentData();
      this.evolve = false;
    }
  }


  /**
   * Verify whether a random accompaniment sequence step chosen by an observing voice is the one that this
   * lead voice is waiting for.
   */
  verifyHarmony(stepIndex, stepMidiNumber) {
    const indexMatches   = stepIndex      === this.desiredAccompanimentIndex;
    const midiNumMatches = stepMidiNumber === this.desiredAccompanimentMidiNumber;

    // Remove a correctly guessed index from the next list of available indices
    if (indexMatches) this.sequence[stepIndex] = -1;

    // Prepare to update for the next cycle
    if (indexMatches && midiNumMatches) this.evolve = true;

    return [indexMatches, midiNumMatches];
  }


  /**
   * Generate the next accompaniment sequence step that observing/accompanying voices should attempt to guess.
   */
  generateDesiredAccompanimentData() {
    // Regenerate the list of available indices that have not been filled in. These will be given to the
    // observing/accompanying tracks to select from when guessing the next harmonic accompaniment step
    // desired by this lead voice.
    this.#generateAvailableIndices();

    // Note that if all steps have been filled in, reset everything.
    if (this.availableIndices.length === 0) this.#resetSequence();

    // Pick a random accompaniment index from an unused step index.
    this.desiredAccompanimentIndex = this.availableIndices[Math.floor(Math.random() * this.availableIndices.length)];

    // Then pick a random scale note
    this.desiredAccompanimentMidiNumber = this.key.degree(Math.ceil(Math.random() * this.key.scaleNotes.length)).midi;

    logEvent(
      "LeadVoice", "next answer selected",
      `Step: ${this.desiredAccompanimentIndex}, MIDI Note: ${this.desiredAccompanimentMidiNumber}`
    );
  }


  /**
   * Cache the unused sequencer steps, defined as those that have a value of 0 in this voice's sequence array.
   */
  #generateAvailableIndices() {
    this.availableIndices = this.sequence.reduce((availableIndices, stepValue, i) => {
      if (stepValue === 0) availableIndices.push(i);
      return availableIndices;
    }, []);
  }


  /**
   * Reset all state. Set this voice's sequence to its starting point, the current key's tonic note for all
   * on (1 valued) steps in the starting steps rhythm array.
   */
  #resetSequence() {
    const midiTonic = this.key.degree(1).midi;
    this.sequence = STARTING_STEPS.slice().map(step => step === 1 ? midiTonic : step);
    this.#generateAvailableIndices();

    this.observingVoices.forEach(voice => voice.notify("reset"));

    logEvent("LeadVoice", "resetting sequence", this.sequence, true);
  }
}
