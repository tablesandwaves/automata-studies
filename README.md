# Automata Studies

A collection of musical automatons.

## About

This repository is a collection of automaton studies. Each study is an independent sub-project within its own directory and will explore one or more methods for developing musical automatons that can interact with each other. Each of these sub-projects will function like a simple sketch that can play two or more synthesizers, typically by communicating using MIDI and/or OSC messages to Ableton Live.

## Installation

Clone this repository and install its package dependencies.

```bash
$ git clone git@github.com:tablesandwaves/automata-studies.git
$ npm install
```

Package dependencies are kept to a minimum and the direct dependencies include:

* `easymidi`: a simple JavaScript MIDI library
* `js-yaml`: a YAML parsing library for reading the config files
* `osc-receiver`: a simple Open Sound Control (OSC) message receiving library, used for receiving 16th note clock ticks
* `tblswvs`: my own library for processing musical patterns

See the NPM website for details and links to source code.

Note that some of these studies will require using Ableton Live and the custom Max for Live device found in the `m4l` directory of this repo.

## Running an Experiment

See the `README` file for the experiment you wish to run for instructions on how to prepare any synthesizers, MIDI targets or Ableton Live.

Run an individual experiment using the `main.js` script from the repository root and passing the experiment's directory/folder name as a command line argument. For example:

```bash
$ node main.js guessing-game
```

## Automata Experiments

### Phasing Voices

**Added:** September 14, 2025

Like the Guessing Game, this follow's Ableton Live's transport. It sends MIDI data to Live for two melodic voices and one drum voice. The melodic voices use Euclidean rhythms that will usually have different sequence lengths and Euclidean step divisors. The program will let the melodic lines phase against each other until they resync their first sequence steps. At that point the sequences will be re-randomized and the process starts over.

The melodic voices also report back to a sequencer object that coordinates their activity. This sequencer will use info from the melodic voices to play the drum voice.

### Guessing Game

**Added:** September 5, 2025

This program listens to a 16th note clock from Ableton Live and responds by generating MIDI note data for two voices. The voices assume the roles of a leader and a follower, or accompaniment. The leader has a fixed rhythm but may vary its note pitches at different times.

The leader begins playing and chooses a sequence note that it wants the follower to guess. Once per 4/4 bar, the follower guesses a note and sequence position for the current iteration. The follower plays its guessed sequence note and then asks the leader if the guess was correct. The leader will respond by indicating whether or not both the sequence step position and note pitch are correct. Once the follower has guessed correctly, the leader is allowed to modify its own sequence pitches (random scale degrees) and the process starts over.

There are a limited number of sequences steps that are available for guessing. The available steps are defined by a starting sequence rhythm for the leader voice. As the follower correctly guesses sequence notes, it fixes the correct guesses into its own sequence and they are removed from future iterations. Once all available steps for guessing have been identified, the process resets itself to the beginning by clearing the follower's sequence and starting completely over.

### Chord/Melody Interaction

**Added:** September 4, 2025

This program generates MIDI data for three voices, a chord voice, a melodic voice and a drum voice. The chord notes constrain which melodic note is selected. Subsequently, the next chord root note will be based on the previous MIDI accompaniment note. If no melodic note was played during a cycle, a random scale note wil be selected as a chord root. Drum hits are based a simple combination of a kick for each chord and optionally another snare or hihat hit within the current duration if the duration is long enough.

This sketch is intended to work out a minimal amount of interaction between two automaton voices. It is a trivially simple harmonic/melodic interaction in which each of the corresponding voices influences the other from one iteration to the next.

These interactive automatons are implemented using Node.js's `MessageChannel` system from the `node:worker_threads` module. Each voice passes a message to the other one to share data about what it did as a way of influencing the other voice's subsequent action.

## Common Technical Notes

Each sub-directory in this project is an independent study/experiment. The following describes some common/shared technical configurations used by multiple studies.

### Max for Live Device Setup

Inside the `m4l` directory of this repo is a simple Max for Live (M4L) device that listens to the Live transport and sends 16th note clock ticks as step integers 0-15 to some of these JavaScript programs. It sends the data as UDP messages using the Max `[udpsend]` object as Open Sound Control (OSC) style messages. It communicates over a localhost connection on port 33334.

When an automata study requires this device, create a MIDI track in Live and simply add the M4L device to it. This device should not be added one of the synth voices because it does not pass through MIDI data.

These 16th note clock ticks are the timing triggering event source for some of the JavaScript programs.

### JavaScript MIDI Setup

Many of the sub-directory projects use the same basic MIDI congiguration using the `easymidi` NPM package.

When running, the JavaScript program will create a MIDI port named `tblswvs.out` that should show up as a MIDI input source for your DAW (or potentially other MIDI destinations if you hack the code in these experiments).

Note that the MIDI port name may not persist when the script is not running. In Ableton Live, for example, you can run the script for the first time (see each particular experiment's README for details) and while it is running configure the `tblswvs.out` MIDI port so that it receives note data by enabling the **Track** option in the input port of Live's MIDI configuration. You may want to adjust the MIDI Clock Sync Delay setting to keep the timing in sync with other tracks playing in Live.

In Live, while it is running you can then select the MIDI port and channel numbers in the **MIDI From** menus for a given track. After the script is configured for the first time, the `tblswvs.out` MIDI port will be saved with a Live Set but will be grayed out while the node/JavaScript program is not running.
