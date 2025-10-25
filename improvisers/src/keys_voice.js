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


export class KeysVoice extends ImprovisingVoice {
  melody;
  rhythm;
  melodyIndex;


  constructor(musicalRole, key, midiOut, midiChannel) {
    super(musicalRole, key, midiOut, midiChannel);

    this.melody = new Array();
    this.melodyIndex = 0;
  }


  step(index) {
    this.stepCount++;

    if (this.rhythm[this.stepCount] === 0) return;

    let midiNoteNumber = this.melody[this.melodyIndex % this.melody.length];
    if (Math.random() > 0.75) {
      midiNoteNumber += Math.random() > 0.5 ? -5 : 7;
    }
    this.melodyIndex++;

    this.playNote(midiNoteNumber);
    setTimeout(() => this.stopNote(midiNoteNumber), 100);
  }


  stop() {
    this.stepCount = -1;
  }


  notify(data) {
    if (data.type === "chord" && this.musicalRole === "MimickingListener") {
      this.accompanyChord(data.notes, data.duration);
    }
  }


  accompanyChord(notes, duration) {
    this.stepCount = -1;
    this.melodyIndex = 0;
    this.rhythm = DURATION_MELODY_RHYTHM_MAP[duration];
    this.melody = notes;
  }
}
