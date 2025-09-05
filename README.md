# Automata Studies

A collection of musical automatons.

## About

This repository is a collection of automaton studies. The focus of each sub-project within its own directory will explore one or more methods for developing musical automatons that can interact with each other. Each of these sub-projects will function like a simple sketch that can play two or more synthesizers, typically by communicating using MIDI and/or OSC messages to Ableton Live.

## Chord/Melody Interaction

**Added:** September 4, 2025

This program generates MIDI data for three voices, a chord voice, a melodic voice and a drum voice. The chord notes constrain which melodic note is selected. Subsequently, the next chord root note will be based on the previous MIDI accompaniment note. If no melodic note was played during a cycle, a random scale note wil be selected as a chord root. Drum hits are based a simple combination of a kick for each chord and optionally another snare or hihat hit within the current duration if the duration is long enough.

This sketch is intended to work out a minimal amount of interaction between two automaton voices. It is a trivially simple harmonic/melodic interaction in which each of the corresponding voices influences the other from one iteration to the next.

These interactive automatons are implemented using Node.js's `MessageChannel` system from the `node:worker_threads` module. Each voice passes a message to the other one to share data about what it did as a way of influencing the other voice's subsequent action.

## Common Technical Notes

Each sub-directory in this project is an independent study/experiment. The following describes some common/shared technical configurations used by multiple studies.

### JavaScript MIDI Setup

Many of the sub-directory projects use the same basic MIDI congiguration using the `easymidi` NPM package.

When running, the JavaScript program will create a MIDI port named `tblswvs.out` that should show up as a MIDI input source for your DAW (or potentially other MIDI destinations if you hack the code in these experiments).

Note that the MIDI port name may not persist when the script is not running. In Ableton Live, for example, you can run the script for the first time (see each particular experiment's README for details) and while it is running configure the `tblswvs.out` MIDI port so that it receives note data by enabling the **Track** option in the input port of Live's MIDI configuration. You may want to adjust the MIDI Clock Sync Delay setting to keep the timing in sync with other tracks playing in Live.

In Live, while it is running you can then select the MIDI port and channel numbers in the **MIDI From** menus for a given track. After the script is configured for the first time, the `tblswvs.out` MIDI port will be saved with a Live Set but will be grayed out while the node/JavaScript program is not running.
