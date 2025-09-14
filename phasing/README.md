# Phasing Voices

## Requirements & Setup

* Node.js
* Ableton Live with Max for Live

### Max for Live Setup

See this repository's main [README](../README.md) for notes about how to use the Max for Live device for following Live's transport.

### MIDI Setup

See this repository's main [README](../README.md) for notes about how to configure the `tblswvs.out` MIDI port this JavaScript program uses.

This program requires three voices listening to MIDI channles 1, 2 and 10. Channels 1 and 2 will receive monophonic melodic note data and channel 10 will send kick, snare and hihat MIDI note events for MIDI note numbers 44, 37 and 38, respectively.

## Running the Program

From the Automata Studies repo root directory run the following command in a terminal:

```
$ node main.js phasing
Voice 1:   3 of  6   Sequence: 52  0 55  0 59  0
Voice 2:   2 of  3   Sequence: 59  0 57
----
Voice 1:   3 of  6   Sequence: 52  0 55  0 59  0
Voice 2:   3 of  4   Sequence: 59  0 57 55
----
Voice 1:   5 of  8   Sequence: 52  0 55  0 59 62  0 64
Voice 2:   6 of 11   Sequence: 59  0 57  0 55  0 54  0 50  0 59
...
```

When the script runs, it will print out details for each of its melodic voices:

* Voice ID
* Euclidean rhythm divisor and step count
* Sequence as MIDI note numbers with `0` meaning a rest

At this point it is waiting for the Ableton Live transport to start so the M4L device starts sending 16th note clock numbers. Once the transport is started, the JavaScript program will begin sending MIDI note data to Live. The program will play Live for as long as Live's transport is running.

When the two sequences line up, they are reset with new randomized step lengths and Euclidean divisors.

To stop the program, type `Ctrl+C` in your terminal.
