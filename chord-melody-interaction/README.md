# Random Chords & Melody

## Requirements & Setup

* Node.js
* A DAW that can configure a custom MIDI port

### Install Node Dependencies

You will need to install two packages and their dependencies:

```bash
$ npm install
```

* `easymidi`: a simple JavaScript MIDI library
* `tblswvs`: my own library for processing musical patterns

See the NPM website for details and links to source code.

### MIDI Setup

When running, this program will create a MIDI port named `tblswvs.out` that should show up as a MIDI input source for your DAW. It requires three voices listening to MIDI channles 1, 2 and 10. The first two voices will receive chords and melodic accompaniment respectively. The third voice should be a drum kit that uses MIDI note numbers described below.

Note that the MIDI port name may not persist when the script is not running. In Ableton Live, for example, you can run the script (see below) and while it is running configure the MIDI port so that it receives note data by enabling the **Track** option in the input port of the MIDI configuration. You may want to adjust the MIDI Clock Sync Delay setting to keep the timing in sync with other tracks playing in Live.

In Live, while it is running you can then select the MIDI port and channel numbers in the **MIDI From** menus. After the script is configured for the first time, the `tblswvs.out` MIDI port will be saved with a Live Set but will be grayed out while the node/JavaScript program is not running.

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

From the `chord-melody-interaction` directory run the following command in a terminal:

```bash
$ node main.js
```

When the script runs, it will first print out some configuration data. Next it waits 2 seconds for the DAW to register the MIDI port and then starts sending MIDI data.

```
$ node main.js
Scale:         E WholeTone
Chords:        T: 33.3% m: 8.3% oct: 16.7% pow: 25% sus2: 8.3% sus4: 8.3%
Scale degrees: 1: 21.1% 2: 5.3% 3: 10.5% 4: 10.5% 5: 15.8% 6: 5.3% 7: 5.3% 8: 10.5% 10: 5.3% -3: 5.3% -1: 5.3%
Note lengths:  125: 21.4% 250: 21.4% 500: 7.1% 750: 14.3% 1000: 14.3% 1500: 21.4%

    1. chord: Eoct (E2, E3)               melody:      duration: 1500
    2. chord: Esus4 (E2, A♮2, B♮2)        melody:      duration: 1500
    3. chord: Em (E2, G♮2, B♮2)           melody:      duration: 1500
    4. chord: F#sus4 (F#2, B♮2, C#♮3)     melody:      duration: 1500
    5. chord: A#aug (A#2, D3, F#3)        melody: A#2  duration: 1500
    6. chord: A#m (A#2, C#♮3, F♮3)        melody: C#♮3 duration:  250
    7. chord: G#pow (G#2, D#3)            melody: D#3  duration: 1500
    8. chord: Epow (E3, B♮3)              melody: B♮3  duration:  250
    9. chord: Epow (E2, B♮2)              melody: E2   duration:  750
   10. chord: Eoct (E2, E3)               melody: E3   duration: 1000
   11. chord: Eoct (E2, E3)               melody: E3   duration:  125
   12. chord: Eoct (E2, E3)               melody: E3   duration: 1500
   13. chord: Epow (E2, B♮2)              melody: E2   duration:  250
   14. chord: Eaug (E2, G#2, C♮3)         melody: E2   duration:  250
   15. chord: Eoct (E2, E3)               melody: E2   duration:  125
   16. chord: Epow (E2, B♮2)              melody:      duration:  500
   17. chord: Em (E3, G♮3, B♮3)           melody: B♮3  duration: 1000
   ...
```

When playing, it will log event data displaying the chord, melodic note and duration between each event. By default the script will stop after 100 iterations.

## Customizing the Output

The program uses a default configuration defined in the YAML file at `config/defaults.yml`. You can customize the values by saving this example file under a new name and then passing the new file's path as a command line argument.

```bash
$ cp config/defaults.yml config/alternative.yml
$ node main.js config/alternative.yml
```

Note that all other `.yml` files in the config directory will be git-ignored.

* Chord types must be [`tblswvs` chord types](https://github.com/tablesandwaves/tblswvs.js/blob/main/src/note_data.ts#L64).
* Durations are millisecond values
* Scale degrees determine chord roots. They are integers passed to the `tblswvs` library and are relative to the `tblswvs.Key` tonic. Negative numbers are allowed, but zero is not.
* Drum pads are MIDI note numbers for each drum hit type.

When multiple values are present, they are chosen at random. Repeating a value is used to weight that value as proportionally more likely to occur.
