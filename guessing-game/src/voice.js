export class Voice {
  sequence;
  key;
  #midiOut;
  #channel;


  constructor(key, midiOut, channel) {
    this.key = key;
    this.#midiOut = midiOut;
    this.#channel = channel - 1; // Easy MIDI uses 1-indexing for MIDI channels
  }


  tick(step) {
    if (this.sequence[step] > 0)
      this.playNote(this.sequence[step], 250);
  }


  playNote(midiNoteNumber, duration) {
    this.#midiOut.send("noteon", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.#channel
    });

    setTimeout(() => {
      this.#midiOut.send("noteoff", {
        note: midiNoteNumber,
        velocity: 100,
        channel: this.#channel
      });
    }, duration);
  }
}
