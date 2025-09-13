import { EventEmitter } from "node:events";
import OscReceiver from "osc-receiver";


/**
 * Follow 16n step integers from Live.
 *
 * This class acts as a kind of clock follower for signals coming from Ableton Live via the custom
 * Max for Live device `tblswvs.16n-beat-transport.amxd` (see the `m4l` folder for this repo). The
 * class is used to coordinate timing among automata with Live's transport.
 *
 * The M4L device will send step numbers between 0 and 15 for 16th note divisions of a bar as OSC
 * style messages. Messages are sent over the localhost:33334 network as `/live/transport {step}`.
 * This class will catch those messages so it can forward each sequence step index to other objects
 * that want to respond to Live's transport as sequencer steps.
 *
 * The class is a simple extension of the Node `EventEmitter` class. Event recievers/followers
 * simply need to register a call back with this class's `onStep()` method.
 */
export class LiveStepFollower extends EventEmitter {
  #receiver;


  constructor() {
    super();

    // Clock Step From Live
    this.#receiver = new OscReceiver();
    this.#receiver.bind(33334, "localhost");
    this.#receiver.on("/live/transport", (step) => this.emit("step", step));
  }


  /**
   * Register a call back for Live 16n transport steps.
   */
  onStep(callback) {
    this.on("step", callback);
  }
}
