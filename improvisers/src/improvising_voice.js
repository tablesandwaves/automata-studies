export class ImprovisingVoice {
  stepCount;

  musicalRole;
  key;
  midiOut;
  midiChannel;

  // The last notes played as MIDI note numbers
  activeNotes;

  // Other voices following this voice to be notified when this voice has the Leader role
  followers;


  constructor(musicalRole, key, midiOut, midiChannel) {
    this.stepCount = -1;

    this.musicalRole = musicalRole;
    this.key = key;
    this.midiOut = midiOut;
    this.midiChannel = midiChannel - 1;

    this.activeNotes = new Array();
    this.followers = new Array();
  }


  stopActiveNotes() {
    this.activeNotes.forEach(midiNoteNumber => this.stopNote(midiNoteNumber));
  }


  playNote(midiNoteNumber) {
    this.midiOut.send("noteon", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.midiChannel
    });
  }


  stopNote(midiNoteNumber) {
    this.midiOut.send("noteoff", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.midiChannel
    });
  }
}
