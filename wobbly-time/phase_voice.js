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


  constructor(midiOut, channel, key, melodyPattern, sequencer) {
    super(midiOut, channel, key);

    this.voiceId = channel;
    this.melodyPattern = melodyPattern;
    this.sequencer = sequencer;
    this.pulseRate = 2;
    this.currentStep = 0;

    this.initializeSequence();
  }


  tick(step) {
    if (step % this.pulseRate == 0) {
      // console.log(`Voice ${this.voiceId}: ${this.currentStep}`)
      if (this.sequence[this.currentStep] > 0)
        this.playNote(this.sequence[this.currentStep], 250);

      this.sequencer.setLastStep(this.voiceId, this.currentStep == this.numSteps - 1);

      this.currentStep = (this.currentStep + 1) % this.numSteps;
    }
  }


  // evolve() {
  //   this.numSteps = this.numSteps + (Math.ceil(Math.random() * 3) * Math.random() > 0.5 ? 1 : -1);
  //   this.numSteps = this.numSteps < MIN_SEQUENCE_STEPS ? MIN_SEQUENCE_STEPS : this.numSteps;
  //   this.numSteps = this.numSteps > MAX_SEQUENCE_STEPS ? MAX_SEQUENCE_STEPS : this.numSteps;

  //   this.euclideanDivisor = this.euclideanDivisor + (Math.random() > 0.5 ? 1 : -1);
  //   this.euclideanDivisor = this.euclideanDivisor < MIN_EUCLIDEAN_DIVISOR ? MIN_EUCLIDEAN_DIVISOR : this.euclideanDivisor;

  //   this.#updateSequence();
  // }


  initializeSequence() {
    this.numSteps = MIN_SEQUENCE_STEPS + Math.floor(Math.random() * (MAX_SEQUENCE_STEPS - MIN_SEQUENCE_STEPS));

    let lowerBound = Math.floor(this.numSteps * 0.125);
    lowerBound = lowerBound < MIN_EUCLIDEAN_DIVISOR ? MIN_EUCLIDEAN_DIVISOR : lowerBound;
    const upperBound = Math.floor(this.numSteps * 0.75);
    this.euclideanDivisor = lowerBound + Math.floor(Math.random() * (upperBound - lowerBound));

    this.#updateSequence();
  }


  #updateSequence() {
    this.sequencer.setLastStep(this.voiceId, false);

    let noteStepIndex = 0;
    this.sequence = bresenhamAlgorithm(this.euclideanDivisor, this.numSteps).map((step, i) => {
      if (step == 1) {
        const midiNoteNumber = this.key.degree(this.melodyPattern[noteStepIndex]).midi;
        noteStepIndex = (noteStepIndex + 1) % this.melodyPattern.length;
        return midiNoteNumber;
      }

      return step;
    });

    console.log(`Num Steps: ${this.numSteps}; Divisor: ${this.euclideanDivisor}; ${this.sequence.join(" ")}`);
  }
}
