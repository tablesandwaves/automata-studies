export const ratios = (arr) => {
  return Object.entries(
    arr.reduce((percentages, element) => {
      if (!Object.hasOwn(percentages, element)) percentages[element] = 0;
      percentages[element]++;
      return percentages;
    }, {})
  ).map(e => [e[0], (Math.round(e[1] / arr.length * 1000) / 10) + "%"].join(": ")).join(" ");
}


export const playNote = (instrument, midiNoteNumber, duration) => {
  instrument.synth.send("noteon", {
    note: midiNoteNumber,
    velocity: Math.floor(Math.random() * 30) + 70,
    channel: instrument.channel - 1
  });

  setTimeout(() => {
    instrument.synth.send("noteoff", {
      note: midiNoteNumber,
      velocity: 100,
      channel: instrument.channel - 1
    });
  }, duration);
}
