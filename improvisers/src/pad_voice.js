import { ImprovisingVoice } from "./improvising_voice.js";


// 2n, 2nd, 1n, 1nd, 0.5n
const CHORD_STEP_LENGTHS = [
  4, 4, 4, 4,
  8, 8, 8, 8, 8,
  12, 12, 12,
  16, 16,
  24,
  32
];


export class PadVoice extends ImprovisingVoice {
  // Track chord lengths as sequencer step counts
  #currentChordLength;


  constructor(musicalRole, key, midiOut, midiChannel) {
    super(musicalRole, key, midiOut, midiChannel);
  }


  /**
   * When a PadVoice is a leader, and a new transport step is received:
   *
   * * Increament the internal step count
   *
   * Then determine whether it is an event step:
   *
   * * No note is playing (initial condition)
   * * The current index corresponds to a scheduled note off step
   *
   * If yes:
   *
   * * Send any note off messages
   * * Reset the internal step count
   * * Generate a new chord
   * * Notify any registered followers
   */
  step(index) {
    this.stepCount++;

    if (this.stepCount > 0 && this.stepCount < this.#currentChordLength) return;

    this.stopCurrentChord();
    this.generateNewChord();
    this.notifyFollowers();
  }


  stop() {
    this.stopCurrentChord();
    this.stepCount = -1;
  }


  stopCurrentChord() {
    this.stopActiveNotes();
  }


  generateNewChord() {
    this.#currentChordLength = CHORD_STEP_LENGTHS[Math.floor(Math.random() * CHORD_STEP_LENGTHS.length)];
    const chordRoot = Math.ceil(Math.random() * this.key.scaleNotes.length);
    const currentChord = this.key.chord(chordRoot, "T");

    this.activeNotes = currentChord.midi;
    this.activeNotes.forEach(midiNoteNumber => this.playNote(midiNoteNumber));

    console.log("this.#currentChordLength", this.#currentChordLength, "chordRoot", chordRoot, "currentChord", currentChord);

    this.stepCount = 0;
  }


  notifyFollowers() {
    this.followers.forEach(voice => {
      voice.notify({
        type: "chord",
        notes: this.activeNotes,
        duration: this.#currentChordLength
      });
    });
  }
}
