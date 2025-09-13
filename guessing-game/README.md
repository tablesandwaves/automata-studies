# Guessing Game

## Requirements & Setup

* Node.js
* Ableton Live with Max for Live

### Max for Live Setup

See this repository's main [README](../README.md) for notes about how to use the Max for Live device for following Live's transport.

### MIDI Setup

See this repository's main [README](../README.md) for notes about how to configure the `tblswvs.out` MIDI port this JavaScript program uses.

This program requires two voices listening to MIDI channles 1 and 2. Each voice will receive monophonic melodic note data.

## Running the Program

From the Automata Studies repo root directory run the following command in a terminal:

```bash
$ node main.js guessing-game
```

When the script runs, it will first print out details for the initial state for its lead and accompaniment voices. Example:

```
$ node main.js guessing-game
---------
LeadVoice: resetting sequence 60 -1 0 0 60 -1 0 -1 0 0 60 -1 60 -1 0 0
LeadVoice: next answer selected Step: 6, MIDI Note: 67
AccompanimentVoice: resetting 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
AccompanimentVoice: next guess selected Step: 15, MIDI Note: 65
```

At this point it is waiting for the Ableton Live transport to start so the M4L device starts sending 16th note clock numbers. Once the transport is started, the JavaScript program will begin sending MIDI note data to Live. The program will play Live for as long as Live's transport is running.

To stop the program, type `Ctrl+C` in your terminal.
