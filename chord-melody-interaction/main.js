import { MessageChannel } from "node:worker_threads";
import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";


const KEY           = new Key(52, Scale.WholeTone);
const CHORD_TYPES   = ["T", "T", "T", "T", "m", "oct", "oct", "pow", "pow", "pow", "sus2", "sus4"];
const DURATIONS     = [125, 125, 125, 250, 250, 250, 500, 750, 750, 1000, 1000, 1500, 1500, 1500];
const SCALE_DEGREES = [1, 1, 1, 1, 5, 5, 5, 3, 3, 4, 4, 8, 8, 2, 6, 7, 10, -3, -1];
const DRUM_PADS     = { kicks:  [36, 48], snares: [37, 38, 47], percs:  [43, 46] };

const randomKick        = () => DRUM_PADS.kicks[Math.floor(Math.random() * DRUM_PADS.kicks.length)];
const randomSnare       = () => DRUM_PADS.snares[Math.floor(Math.random() * DRUM_PADS.snares.length)];
const randomPerc        = () => DRUM_PADS.percs[Math.floor(Math.random() * DRUM_PADS.percs.length)];
const randomDuration    = () => DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
const randomScaleDegree = () => SCALE_DEGREES[Math.floor(Math.random() * SCALE_DEGREES.length)];

const randomChord = (root) => {
  return KEY.chord(
    root === undefined ? KEY.degree(randomScaleDegree()).scaleDegree : root,
    CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)]
  );
}

const midiToScaleDegree = (midiNoteNumber) => {
  const scaleOffsetIndex = KEY.mode.scaleOffsets.indexOf(midiNoteNumber % 12 - KEY.midiTonic);
  return scaleOffsetIndex === -1 ? undefined : scaleOffsetIndex + 1;
}

const logEvent = (count, chord, note, duration) => {
  console.log(
    ` ${count.toString().padStart(4)}.`,
    "chord:", (`${chord.root}${chord.quality} ` +
              `(${chord.midi.map(n => KEY.midi2note(n)).join(", ")})`).padEnd(27),
    "melody:", note === undefined ? "    " : KEY.midi2note(note).padEnd(4),
    "duration:", duration.toString().padStart(4)
  );
}

const ratios = (arr) => {
  return Object.entries(
    arr.reduce((percentages, element) => {
      if (!Object.hasOwn(percentages, element)) percentages[element] = 0;
      percentages[element]++;
      return percentages;
    }, {})
  ).map(e => [e[0], (Math.round(e[1] / arr.length * 1000) / 10) + "%"].join(": ")).join(" ");
}

const playNote = (instrument, midiNoteNumber, duration) => {
  instrument.synth.send("noteon", {
    note: midiNoteNumber,
    velocity: Math.floor(Math.random() * 30) + 70,
    channel: instrument.channel - 1
  });

  setTimeout(() => {
    instrument.synth.send("noteoff", {
      note: midiNoteNumber,
      velocity: 100,
      channel: instrument.channel - 1
    });
  }, duration);
}


const midiPort      = new MidiOutput("tblswvs.out", true);
const chords        = {synth: midiPort, channel: 1};
const accompaniment = {synth: midiPort, channel: 2};
const beat          = {synth: midiPort, channel: 10};

const channel  = new MessageChannel();
const maxCount = 100;
let   count    = 0;


/**
 * Port 1 represents the chord progression. Choose a random duration and chord,
 * then tell Port 2 what you played so it can accompany.
 */
channel.port1.on("message", function (chordRoot) {
  count++;

  if (count > maxCount) {
    setTimeout(() => {
      channel.port1.close();
      channel.port2.close();
    }, 3000);

    return;
  }

  const duration = count < 5 || count > maxCount - 4 ? 1500 : randomDuration();
  const chord    = randomChord(chordRoot);

  playNote(beat, randomKick(), 100);
  chord.midi.forEach(note => playNote(chords, note + 0, duration));

  this.postMessage({chord: chord, duration: duration});
});


/**
 * Port 2 represents the accompanying melody. Based on the chord played, choose
 * a random chord note to play in another voice.
 */
channel.port2.on("message", function (data) {
  // Decide whether or not to play a melodic note. If yes, choose one of the chord notes.
  const note = count >= 5 && Math.random() < 0.7 ?
               data.chord.midi[Math.floor(Math.random() * data.chord.midi.length)] :
               undefined;

  if (data.duration >= 500)
    setTimeout(() => playNote(
      beat,
      Math.random() > 0.5 ? randomPerc() : randomSnare(),
      100
    ), data.duration / 4);

  // If a note was chose for this cycle iteration, play it after half the duration amount.
  if (note !== undefined)
    setTimeout(() => {
      if (data.duration >= 250)
        playNote(beat, Math.random() > 0.5 ? randomPerc() : randomSnare(), 100);
      playNote(accompaniment, note + 0, data.duration);
    }, data.duration / 2);

  // After the current duration wraps up, tell Port 1 what note you chose (which may
  // be undefined) so it can use it when choosing the next chord to play.
  setTimeout(() => this.postMessage(midiToScaleDegree(note)), data.duration);

  // Finally log the chord, accompaniment note and duration for the current cycle iteration.
  logEvent(count, data.chord, note, data.duration);
});


console.log(`Scale:         ${KEY.name}`);
console.log(`Chords:        ${ratios(CHORD_TYPES)}`);
console.log(`Scale degrees: ${ratios(SCALE_DEGREES)}`);
console.log(`Note lengths:  ${ratios(DURATIONS)}\n`);
setTimeout(() => channel.port2.postMessage(1), 2000);
