export class ImprovisingVoice {
  stepCount;

  // Current role: Leader or Follower
  musicalRole;

  midiChannel;
  sequencer;

  // The last notes played as MIDI note numbers
  activeNotes;

  // Other voices following this voice to be notified when this voice has the Leader role
  followers;


  constructor(musicalRole, midiChannel, sequencer) {
    this.stepCount = -1;

    this.musicalRole = musicalRole;
    this.midiChannel = midiChannel - 1;
    this.sequencer = sequencer;

    this.activeNotes = new Array();
    this.followers = new Array();
  }


  stopActiveNotes() {
    this.activeNotes.forEach(midiNoteNumber => this.stopNote(midiNoteNumber));
  }


  playNote(midiNoteNumber, velocityMin = 70) {
    this.sequencer.midiOut.send("noteon", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + velocityMin,
      channel: this.midiChannel
    });
  }


  stopNote(midiNoteNumber) {
    this.sequencer.midiOut.send("noteoff", {
      note: midiNoteNumber,
      velocity: Math.floor(Math.random() * 30) + 70,
      channel: this.midiChannel
    });
  }
}
