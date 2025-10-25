import { shuffle } from "tblswvs";
import { ImprovisingVoice } from "./improvising_voice.js";


const DURATION_MELODY_RHYTHM_MAP = {
  "4":  [1, 0, 1, 0],                                        // 8n's
  "8":  [1, 0, 0, 1,  0, 0, 1, 0],                           // Tressilo
  "12": [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],              // 4n's
  "16": [1, 0, 0, 1,  0, 0, 1, 0,  0, 0, 1, 0,  1, 0, 0, 0], // Son Clave
  "24": [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,               // 4n's + 8n's
         1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
  "32": [1, 0, 0, 0,  1, 0, 1, 0,  0, 0, 0, 0,  1, 0, 0, 0,  // Electro
         1, 0, 0, 0,  1, 0, 1, 0,  0, 0, 1, 0,  1, 0, 1, 0]
}


// These numbers are tblswvs scale degrees.
const MELODY_SET = [
  [ 1,  8, 2,  7,   3, 6, 4,  5 ],
  [ 1,  5, 1, -4,   1, 8, 7,  4,  -1 ],
  [ 1, 10, 8,  4,   5, 6, 3, 12,  11,  9,  2, 7 ],
  [ 1,  5, 4,  8,  10, 6, 7,  8,  12, 11, 10, 9,  13, 12, 11, 10 ]
];


export class KeysVoice extends ImprovisingVoice {
  melody;
  rhythm;
  melodyIndex;


  constructor(musicalRole, midiChannel, sequencer) {
    super(musicalRole, midiChannel, sequencer);

    this.melody = new Array();
    this.melodyIndex = 0;

    if (this.musicalRole === "Leader") {
      this.generateMelody();
      this.notifyFollowers();
    }
  }


  step(index) {
    this.stepCount++;

    if (this.rhythm[this.stepCount] === 0) {
      if (this.musicalRole === "Leader" && this.stepCount === this.rhythm.length - 1) {
        this.stepCount = -1;
        this.melodyIndex = 0;
        this.generateMelody();
        this.notifyFollowers();
      }
      return;
    }

    let midiNoteNumber = this.melody[this.melodyIndex % this.melody.length];
    if (this.musicalRole !== "Leader" && Math.random() > 0.75) {
      midiNoteNumber += Math.random() > 0.5 ? -5 : 7;
    }
    this.melodyIndex++;

    this.playNote(midiNoteNumber, 40);
    setTimeout(() => this.stopNote(midiNoteNumber), 100);
  }


  stop() {
    this.stepCount = -1;
  }


  notifyFollowers() {
    this.followers.forEach(voice => {
      voice.notify({
        type: "melody",
        notes: this.melody,
        duration: this.rhythm.length
      });
    });
  }


  notify(data) {
    if (data.type === "chord" && this.musicalRole === "Follower") {
      this.accompanyChord(data.notes, data.duration);
    }
  }


  accompanyChord(notes, duration) {
    this.stepCount = -1;
    this.melodyIndex = 0;
    this.rhythm = DURATION_MELODY_RHYTHM_MAP[duration];
    this.melody = notes;
  }


  generateMelody() {
    this.sequencer.leaderCycles++;

    if (this.sequencer.leaderCycles >= 4) {
      this.sequencer.reloadRoles = true;
    }

    const scaleDegrees = MELODY_SET[Math.floor(Math.random() * MELODY_SET.length)];
    this.melody = scaleDegrees.map(d => this.sequencer.key.degree(d).midi);
    this.rhythm = Array.from(new Array(this.melody.length * 2), (_, i) => i % 2 === 0 ? 1 : 0);

    const rhythm = new Array(this.melody.length - 1).fill(1).concat(new Array(this.melody.length).fill(0));
    shuffle(rhythm);
    this.rhythm = [1, 0].concat(Array.from(new Array(rhythm.length * 2), (_, i) => i % 2 === 0 ? rhythm[i / 2] : 0));
  }
}
