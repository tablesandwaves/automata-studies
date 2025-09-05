/**
 * Shuffle an array in place.
 */
export const shuffle = (array) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}


export const logEvent = (source, name, data, macroSeparator = false) => {
  let message = `${source}: ${name}`;

  if (data !== undefined)
    if (data instanceof Array)
      message += ` ${data.join(" ")}`;
    else
      message += " " + data;

  if (macroSeparator) console.log("---------")
  console.log(message);
}
