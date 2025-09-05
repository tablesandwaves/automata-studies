# Guessing Game

## Requirements & Setup

* Node.js
* Ableton Live with Max for Live

### Install Node Dependencies

You will need to install three packages and their dependencies. From the `guessing-game` directory run:

```bash
$ npm install
```

* `easymidi`: a simple JavaScript MIDI library
* `osc-receiver`: a simple Open Sound Control (OSC) message receiving library, used for receiving 16th note clock ticks
* `tblswvs`: my own library for processing musical patterns

See the NPM website for details and links to source code.

### Install Max for Live Device

Inside the `m4l` directory of this sub-project is a simple Max for Live (M4L) library that listens to the Live transport and sends 16th note clock ticks to the JavaScript program. It sends the data as UDP messages using the Max `[udpsend]` object. It communicates over a localhost connection on port 33334.

Create a MIDI track in Live and simply add the M4L device to it. This device should not be added one of the synth voices because it does not pass through MIDI data.

These 16th note clock ticks are the timing triggering event source for the JavaScript program.

### MIDI Setup

See this repository's main [README](../README.md) for notes about how to configure the `tblswvs.out` MIDI port this JavaScript program uses.

This program requires two voices listening to MIDI channles 1 and 2. Each voice will receive monophonic melodic note data.

## Running the Program

From the `guessing-game` directory run the following command in a terminal:

```bash
$ node main.js
```

When the script runs, it will first print out details for the initial state for its lead and accompaniment voices. Example:

```
$ node main.js
---------
LeadVoice: resetting sequence 60 -1 0 0 60 -1 0 -1 0 0 60 -1 60 -1 0 0
LeadVoice: next answer selected Step: 6, MIDI Note: 67
AccompanimentVoice: resetting 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
AccompanimentVoice: next guess selected Step: 15, MIDI Note: 65
```

At this point it is waiting for the Ableton Live transport to start so the M4L device starts sending 16th note clock numbers. Once the transport is started, the JavaScript program will begin sending MIDI note data to Live. The program will play Live for as long as Live's transport is running.

To stop the program, type `Ctrl+C` in your terminal.
