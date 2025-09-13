# Chord / Melody Interaction

## Requirements & Setup

* Node.js
* A DAW that can configure a custom MIDI port

### MIDI Setup

See this repository's main [README](../README.md) for notes about how to configure the `tblswvs.out` MIDI port this JavaScript program uses.

This program requires three voices listening to MIDI channles 1, 2 and 10. The first two voices will receive chords and melodic accompaniment respectively. The third voice should be a drum kit that uses MIDI note numbers described below.

### MIDI Voices

**Pad/chords:**

* MIDI channel 1
* Polyphonic

**Lead/melody:**

* MIDI channel 2
* Monophonic

**Drum kit:**

* MIDI channel 10
* Drum kit (e.g., Ableton Drum Rack)
* Default mappings:
  * Kick hits: 36, 48
  * Snare hits: 37, 38, 47
  * HiHat hits: 43, 46

## Running the Program

From the Automata Studies repo root directory run the following command in a terminal:

```bash
$ node main.js chord-melody-interaction
```

When the script runs, it will first print out some configuration data. Next it waits 2 seconds for the DAW to register the MIDI port and then starts sending MIDI data.

```
$ node main.js chord-melody-interaction
Scale:         E MinPentatonic
Chords:        T: 33.3% m: 8.3% oct: 16.7% pow: 25% sus2: 8.3% sus4: 8.3%
Scale degrees: 1: 21.1% 2: 5.3% 3: 10.5% 4: 10.5% 5: 15.8% 6: 5.3% 7: 5.3% 8: 10.5% 10: 5.3% -3: 5.3% -1: 5.3%
Note lengths:  125: 21.4% 250: 21.4% 500: 7.1% 750: 14.3% 1000: 14.3% 1500: 21.4%

    1. chord: Esus2 (E2, F#2, B2)         melody:      duration: 1500
    2. chord: Am (A2, C3, E3)             melody:      duration: 1500
    3. chord: GM/5 (D3, G3, B3)           melody:      duration: 1500
    4. chord: Am (A2, C3, E3)             melody:      duration: 1500
    5. chord: Dsus2 (D4, E4, A4)          melody: A4   duration:  125
    6. chord: Aoct (A2, A3)               melody:      duration: 1500
    7. chord: Doct (D3, D4)               melody:      duration: 1500
    8. chord: Boct (B2, B3)               melody:      duration:  250
    9. chord: Doct (D3, D4)               melody: D3   duration:  125
   10. chord: Em (E2, G2, B2)             melody: B2   duration:  250
   11. chord: Asus2/2 (B2, E3, A3)        melody:      duration: 1000
   12. chord: Bpow (B2, F#3)              melody: B2   duration:  500
   13. chord: Asus2/2 (B2, E3, A3)        melody: B2   duration:  125
   14. chord: Asus2/2 (B2, E3, A3)        melody: E3   duration:  250
   15. chord: Dsus2/2 (E2, A2, D3)        melody: A2   duration:  750
   16. chord: Apow (A2, E3)               melody:      duration: 1500
   17. chord: Doct (D3, D4)               melody:      duration:  250
   ...
```

When playing, it will log event data displaying the chord, melodic note and duration between each event. By default the script will stop after 100 iterations.

## Customizing the Output

The program uses a default configuration defined in the YAML file at `config/defaults.yml`. You can customize the values by saving this example file under a new name and then passing the new file's path as a command line argument.

```bash
$ cp config/defaults.yml config/alternative.yml
$ node main.js chord-melody-interaction chord-melody-interaction/config/alternative.yml
```

Note that all `.yml` files not named `defaults.yml` in the config directory will be git-ignored.

* Chord types must be [`tblswvs` chord types](https://github.com/tablesandwaves/tblswvs.js/blob/main/src/note_data.ts#L64).
* Durations are millisecond values
* Scale degrees determine chord roots. They are integers passed to the `tblswvs` library and are relative to the `tblswvs.Key` tonic. Negative numbers are allowed, but zero is not.
* Drum pads are MIDI note numbers for each drum hit type.

When multiple values are present, they are chosen at random. Repeating a value is used to weight that value as proportionally more likely to occur.
