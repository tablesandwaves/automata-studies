# Automata Studies

A collection of musical automatons.

## About

This repository is a collection of automaton studies. The focus of each sub-project within its own directory will explore one or more methods for developing musical automatons that can interact with each other. Each of these sub-projects will function like a simple sketch that can play two or more synthesizers, typically by communicating using MIDI and/or OSC messages to Ableton Live.

## Chord/Melody Interaction

**Added:** September 4, 2025

This program generates MIDI data for three voices, a chord voice, a melodic voice and a drum voice. The chord notes constrain which melodic note is selected. Subsequently, the next chord root note will be based on the previous MIDI accompaniment note. If no melodic note was played during a cycle, a random scale note wil be selected as a chord root. Drum hits are based a simple combination of a kick for each chord and optionally another snare or hihat hit within the current duration if the duration is long enough.

This sketch is intended to work out a minimal amount of interaction between two automaton voices. It is a trivially simple harmonic/melodic interaction in which each of the corresponding voices influences the other from one iteration to the next.

These interactive automatons are implemented using Node.js's `MessageChannel` system from the `node:worker_threads` module. Each voice passes a message to the other one to share data about what it did as a way of influencing the other voice's subsequent action.
