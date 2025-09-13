import { MessageChannel } from "node:worker_threads";
import { Output as MidiOutput } from "easymidi";
import { Voice } from "../common/voice.js";
import { ratios } from "./src/util.js";
import { Configuration } from "./src/configuration.js";


export class ChordMelodySequencer {
  #configuration;
  chords;
  accompaniment;
  beat;
  channel;
  maxCount;
  count;


  constructor(configFilepath) {
    this.#configuration = new Configuration(configFilepath);

    const midiPort     = new MidiOutput("tblswvs.out", true);
    this.chords        = new Voice(midiPort, 1);
    this.accompaniment = new Voice(midiPort, 2);
    this.beat          = new Voice(midiPort, 10);

    this.channel  = new MessageChannel();
    this.maxCount = this.#configuration.iterations;
    this.count    = 0;

    this.#configureChannelPorts();
    this.#printConfiguration();
  }


  run() {
    // Start the sequencer by posting the scale degree 1 to the chords voice.
    this.channel.port2.postMessage(1);
  }


  #printConfiguration() {
    console.log(`Scale:         ${this.#configuration.key.name}`);
    console.log(`Chords:        ${ratios(this.#configuration.chordTypes)}`);
    console.log(`Scale degrees: ${ratios(this.#configuration.scaleDegrees)}`);
    console.log(`Note lengths:  ${ratios(this.#configuration.durations)}\n`);
  }


  randomChord(root) {
    return this.#configuration.key.chord(
      root === undefined ? this.#configuration.key.degree(this.randomScaleDegree()).scaleDegree : root,
      this.#configuration.chordTypes[Math.floor(Math.random() * this.#configuration.chordTypes.length)]
    );
  }


  randomKick() {
    return this.#configuration.drumPads.kicks[Math.floor(Math.random() * this.#configuration.drumPads.kicks.length)];
  }


  randomSnare() {
    return this.#configuration.drumPads.snares[Math.floor(Math.random() * this.#configuration.drumPads.snares.length)];
  }


  randomPerc() {
    return this.#configuration.drumPads.percs[Math.floor(Math.random() * this.#configuration.drumPads.percs.length)];
  }


  randomDuration() {
    return this.#configuration.durations[Math.floor(Math.random() * this.#configuration.durations.length)];
  }


  randomScaleDegree() {
    return this.#configuration.scaleDegrees[Math.floor(Math.random() * this.#configuration.scaleDegrees.length)];
  }


  midiToScaleDegree(midiNoteNumber) {
    const scaleOffsetIndex = this.#configuration.key.mode.scaleOffsets.indexOf(
      midiNoteNumber % 12 - this.#configuration.key.midiTonic
    );
    return scaleOffsetIndex === -1 ? undefined : scaleOffsetIndex + 1;
  }


  logEvent(count, chord, note, duration) {
    console.log(
      ` ${count.toString().padStart(4)}.`,
      "chord:", (`${chord.root}${chord.quality} ` +
                `(${chord.midi.map(n => this.#configuration.key.midi2note(n)).join(", ")})`).padEnd(27),
      "melody:", note === undefined ? "    " : this.#configuration.key.midi2note(note).padEnd(4),
      "duration:", duration.toString().padStart(4)
    );
  }


  #configureChannelPorts() {
    /**
     * Port 1 represents the chord progression. Choose a random duration and chord,
     * then tell Port 2 what you played so it can accompany.
     */
    this.channel.port1.on("message", (chordRoot) => {
      this.count++;

      if (this.count > this.maxCount) {
        setTimeout(() => {
          this.channel.port1.close();
          this.channel.port2.close();
        }, 3000);

        return;
      }

      const duration = this.count < 5 || this.count > this.maxCount - 4 ? 1500 : this.randomDuration();
      const chord    = this.randomChord(chordRoot);

      this.beat.playNote(this.randomKick(), 100);
      chord.midi.forEach(note => this.chords.playNote(note, duration));

      this.channel.port1.postMessage({chord: chord, duration: duration});
    });

    /**
     * Port 2 represents the accompanying melody. Based on the chord played, choose
     * a random chord note to play in another voice.
     */
    this.channel.port2.on("message", (data) => {
      // Decide whether or not to play a melodic note. If yes, choose one of the chord notes.
      const note = this.count >= 5 && Math.random() < 0.7 ?
                   data.chord.midi[Math.floor(Math.random() * data.chord.midi.length)] :
                   undefined;

      if (data.duration >= 500) {
        setTimeout(() => {
          this.beat.playNote(Math.random() > 0.5 ? this.randomPerc() : this.randomSnare(), 100);
        }, data.duration / 4);
      }


      // If a note was chose for this cycle iteration, play it after half the duration amount.
      if (note !== undefined)
        setTimeout(() => {
          if (data.duration >= 250)
            this.beat.playNote(Math.random() > 0.5 ? this.randomPerc() : this.randomSnare(), 100);

          this.accompaniment.playNote(note, data.duration);
        }, data.duration / 2);

      // After the current duration wraps up, tell Port 1 what note you chose (which may
      // be undefined) so it can use it when choosing the next chord to play.
      setTimeout(() => this.channel.port2.postMessage(this.midiToScaleDegree(note)), data.duration);

      // Finally log the chord, accompaniment note and duration for the current cycle iteration.
      this.logEvent(this.count, data.chord, note, data.duration);
    });
  }
}
