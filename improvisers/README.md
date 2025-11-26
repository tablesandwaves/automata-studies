# Improvisers

## Requirements & Setup

* Node.js
* Ableton Live with Max for Live

### Max for Live Setup

See this repository's main [README](../README.md) for notes about how to use the Max for Live device for following Live's transport.

### MIDI Setup

See this repository's main [README](../README.md) for notes about how to configure the `tblswvs.out` MIDI port this JavaScript program uses.

This program requires two voices listening to MIDI channles 1 and 2. Channel 1 will receive polypohonic chord data and channel 2 will receive monophonic melodic note data.

## Running the Program

From the Automata Studies repo root directory run the following command in a terminal:

```bash
$ node main.js improvisers
```

At this point it is waiting for the Ableton Live transport to start so the M4L device starts sending 16th note clock numbers. Once the transport is started, the JavaScript program will begin sending MIDI note data to Live. The program will play Live for as long as Live's transport is running.

To stop the program, type `Ctrl+C` in your terminal.

### Terminal Output Example

When the script runs and Live's transport starts, with each iteration it will out information about what note data is being sent to Live. Example:

```
$ node main improvisers

Leader: Keys (1)

C3 F4 Eb3 Eb4 F3 C4 G3 Bb3
*_*_____*_*_*___*_______*_*_____
Duration: 32 Accompaniment Chord: Eb4 F4 F3 C3

C3 F4 Eb3 Eb4 F3 C4 G3 Bb3
*___*___*___*___*___*_____*_*___
Duration: 32 Accompaniment Chord: Eb4 F3 C3 F4

C3 F4 Eb3 Eb4 F3 C4 G3 Bb3
*_____*_*_*_________*___*___*_*_
Duration: 32 Accompaniment Chord: F3 C4 G3 Eb3

C3 Bb4 F4 G3 Bb3 C4 F3 Eb5 C5 G4 Eb3 Eb4
*_*_*_____*___*_*_*___________*___*___*_*___*___
Duration: 48 Accompaniment Chord: Eb3 G3 F4 C5


Leader: Keys (2)

C3 Bb4 F4 G3 Bb3 C4 F3 Eb5 C5 G4 Eb3 Eb4
*_*_*_*_*_*_*_*_______*_________*___*___*_______
Duration: 48 Accompaniment Chord: Eb4 G4 F3 C4

C3 Bb3 C3 Eb2 C3 F4 Eb4 G3 Bb2
*_______*_____*_*_*_____*___*_*_*___
Duration: 36 Accompaniment Chord: Bb2 Eb2 Eb4 G3

C3 Bb3 C3 Eb2 C3 F4 Eb4 G3 Bb2
*_________*_*___*_______*_*_*_*___*_
Duration: 36 Accompaniment Chord: F4 Bb3 Eb4 Bb2

C3 Bb3 G3 F4 Bb4 C4 Eb4 F4 Eb5 C5 Bb4 G4 F5 Eb5 C5 Bb4
*_______*_______*___*_*_*_*___*_*___*_*_____*___*_*_*___*_______
Duration: 64 Accompaniment Chord: C5 C4 Eb5 Bb3


Leader: Pad (1)

Duration 8 Chord: F IVsus2/2
Duration 8 Chord: C ii/3
Duration 12 Chord: Bb Isus2/2
Duration 8 Chord: F IVsus2/2
Duration 12 Chord: Bb Isus2/2
Duration 12 Chord: F IVsus2/2
Duration 16 Chord: Bb Isus2/2
Duration 16 Chord: F IVsus2/2

Leader: Pad (2)

Duration 12 Chord: C ii/3
Duration 24 Chord: Eb IIIsus2/2
Duration 4 Chord: Eb V/5
Duration 4 Chord: C ii/3
Duration 4 Chord: Eb V/5
Duration 32 Chord: C ii/3
Duration 4 Chord: Bb Isus2/2
Duration 4 Chord: Eb IIIsus2/2
Duration 12 Chord: Eb V/5

Leader: Keys (1)

C3 Bb4 F4 G3 Bb3 C4 F3 Eb5 C5 G4 Eb3 Eb4
*_*___*_*___*_*_*_______*_____*___*_______*___*_
Duration: 48 Accompaniment Chord: Eb3 C5 G4 Eb5

...
```

In this example, the program randomly chose to begin by setting the keys (melody) voice as the leader. It randomly chooses a melody from a predefined set of melodies. It then randomly chooses a rhythm as a gate pattern to serve as the melody's rhythm. Gate patterns are based on the melody's length. The note sequence and gate pattern are displayed.

When it starts a new melodic cycle, it also notifies the pad (chords) voice for generating an accompanying chord. The chord is randomly constructed from the melodic notes passed from the keys voice. The accompaniment chord and its duration are displayed with the melody.

The keys voice will play a melodic line four times, each time notifying its parent sequencer when a new cycle has begun. When four cycles have completed, the sequencer chooses a new leader voice for the next round. A voice may repeat its role for up to three leader cycles. If the same voice has been randomly selected three times in a row, the leader/follower roles will be swapped.

In this example, the keys voice was selected for the first two leader cycles and then the pad voice was selected for the next two cycles and the fifth cycle went back to the keys voice.

When the pad voice is acting as the leader, it selects a random chord and duration (measured in 16th notes). It then notifies the keys voice of what chord and duration were selected and the keys voice will provide chord arpegiation as accompaniment.
