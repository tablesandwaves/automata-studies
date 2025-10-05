export class ImprovisingVoice {
  musicalRole;
  key;
  midiOut;
  midiChannel;

  // The last notes played as MIDI note numbers
  activeNotes;


  constructor(musicalRole, key, midiOut, midiChannel) {
    this.musicalRole = musicalRole;
    this.key = key;
    this.midiOut = midiOut;
    this.midiChannel = midiChannel - 1;

    this.activeNotes = new Array();
  }


  stopActiveNotes() {
    console.log(`ImprovisingVoice.stopActiveNotes()`);
    this.activeNotes.forEach(midiNoteNumber => this.stopNote(midiNoteNumber));
  }


  playNote(midiNoteNumber) {
    console.log(`ImprovisingVoice.playNote()`);

    this.midiOut.send("noteon", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.midiChannel
    });
  }


  stopNote(midiNoteNumber) {
    console.log(`ImprovisingVoice.stopNote()`);

    this.midiOut.send("noteoff", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.midiChannel
    });
  }
}
