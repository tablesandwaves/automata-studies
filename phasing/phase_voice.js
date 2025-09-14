import { Voice } from "../common/voice.js";
import { bresenhamAlgorithm } from "./util.js";


const MIN_SEQUENCE_STEPS    = 3;
const MAX_SEQUENCE_STEPS    = 16;
const MIN_EUCLIDEAN_DIVISOR = 3;


export class PhaseVoice extends Voice {
  voiceId;
  numSteps;
  euclideanDivisor;
  melodyPattern;
  sequencer;
  pulseRate;
  currentStep;
  currentStepNote;


  constructor(midiOut, channel, key, melodyPattern, sequencer) {
    super(midiOut, channel, key);

    this.voiceId = channel;
    this.melodyPattern = melodyPattern;
    this.sequencer = sequencer;
    this.pulseRate = 2;
    this.currentStep = 0;
    this.currentStepNote = 0;

    this.initializeSequence();
  }


  tick(step) {
    if (step % this.pulseRate === 0) {
      if (this.sequence[this.currentStep] > 0) {
        this.playNote(this.sequence[this.currentStep], 250);
        this.sequencer.reportNotePlayed(this.voiceId, this.currentStepNote);
        this.currentStepNote = (this.currentStepNote + 1) % this.numSteps;
      }

      this.sequencer.setLastStep(this.voiceId, this.currentStep === this.numSteps - 1);

      this.currentStep = (this.currentStep + 1) % this.numSteps;
    }
  }


  initializeSequence() {
    this.numSteps = MIN_SEQUENCE_STEPS + Math.floor(Math.random() * (MAX_SEQUENCE_STEPS - MIN_SEQUENCE_STEPS));

    let lowerBound = Math.floor(this.numSteps * 0.125);
    lowerBound = lowerBound < MIN_EUCLIDEAN_DIVISOR ? MIN_EUCLIDEAN_DIVISOR : lowerBound;
    const upperBound = Math.floor(this.numSteps * 0.75);
    this.euclideanDivisor = lowerBound + Math.floor(Math.random() * (upperBound - lowerBound));

    this.#resetSequence();
  }


  #resetSequence() {
    this.sequencer.setLastStep(this.voiceId, false);

    let noteStepIndex = 0;
    this.sequence = bresenhamAlgorithm(this.euclideanDivisor, this.numSteps).map((step, i) => {
      if (step === 1) {
        const midiNoteNumber = this.key.degree(this.melodyPattern[noteStepIndex]).midi;
        noteStepIndex = (noteStepIndex + 1) % this.melodyPattern.length;
        return midiNoteNumber;
      }

      return step;
    });

    console.log(
      `Voice ${this.voiceId}:  ` +
      `${(this.euclideanDivisor + "").padStart(2)} of ${(this.numSteps + "").padStart(2)}   ` +
      `Sequence: ${this.sequence.map(n => (n + "").padStart(2)).join(" ")}`
    );
  }
}
