import { MessageChannel } from "node:worker_threads";
import { Output as MidiOutput } from "easymidi";
import { Configuration } from "./configuration.js";


const configFilepath = process.argv[2];
const CONFIGURATION  = new Configuration(configFilepath);

const randomKick        = () => CONFIGURATION.drumPads.kicks[Math.floor(Math.random() * CONFIGURATION.drumPads.kicks.length)];
const randomSnare       = () => CONFIGURATION.drumPads.snares[Math.floor(Math.random() * CONFIGURATION.drumPads.snares.length)];
const randomPerc        = () => CONFIGURATION.drumPads.percs[Math.floor(Math.random() * CONFIGURATION.drumPads.percs.length)];
const randomDuration    = () => CONFIGURATION.durations[Math.floor(Math.random() * CONFIGURATION.durations.length)];
const randomScaleDegree = () => CONFIGURATION.scaleDegrees[Math.floor(Math.random() * CONFIGURATION.scaleDegrees.length)];

const randomChord = (root) => {
  return CONFIGURATION.key.chord(
    root === undefined ? CONFIGURATION.key.degree(randomScaleDegree()).scaleDegree : root,
    CONFIGURATION.chordTypes[Math.floor(Math.random() * CONFIGURATION.chordTypes.length)]
  );
}

const midiToScaleDegree = (midiNoteNumber) => {
  const scaleOffsetIndex = CONFIGURATION.key.mode.scaleOffsets.indexOf(midiNoteNumber % 12 - CONFIGURATION.key.midiTonic);
  return scaleOffsetIndex === -1 ? undefined : scaleOffsetIndex + 1;
}

const logEvent = (count, chord, note, duration) => {
  console.log(
    ` ${count.toString().padStart(4)}.`,
    "chord:", (`${chord.root}${chord.quality} ` +
              `(${chord.midi.map(n => CONFIGURATION.key.midi2note(n)).join(", ")})`).padEnd(27),
    "melody:", note === undefined ? "    " : CONFIGURATION.key.midi2note(note).padEnd(4),
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
const maxCount = CONFIGURATION.iterations;
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


console.log(`Scale:         ${CONFIGURATION.key.name}`);
console.log(`Chords:        ${ratios(CONFIGURATION.chordTypes)}`);
console.log(`Scale degrees: ${ratios(CONFIGURATION.scaleDegrees)}`);
console.log(`Note lengths:  ${ratios(CONFIGURATION.durations)}\n`);
setTimeout(() => channel.port2.postMessage(1), 2000);
