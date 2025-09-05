import OscReceiver from "osc-receiver";
import { Output as MidiOutput } from "easymidi";
import { Key, Scale } from "tblswvs";
import { LeadVoice } from "./src/lead_voice.js";
import { AccompanimentVoice } from "./src/accompaniment_voice.js";


// Clock Step From Live
const receiver = new OscReceiver();
receiver.bind(33334, "localhost");
receiver.on("/live/transport", (step) => transport(step % 16));

// Notes To Live
const midiOut = new MidiOutput("tblswvs.out", true);

const key                = new Key(60, Scale.MinPentatonic);
const leadVoice          = new LeadVoice(key, midiOut, 1);
const accompanimentVoice = new AccompanimentVoice(key, midiOut, 2, leadVoice);
leadVoice.subscribe(accompanimentVoice);

const transport = (step) => leadVoice.tick(step);
