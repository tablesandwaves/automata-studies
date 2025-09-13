import { LiveStepFollower } from "../common/live_step_follower.js";


export class WobbleSequencer {
  #transport;


  constructor() {
    this.#transport = new LiveStepFollower();

    this.#transport.onStep((step) => {
      console.log(`Step ${step} for event reciever 1.`);
    });

    this.#transport.onStep((step) => {
      console.log(`Step ${step} for event reciever 2.`);
    });
  }
}
