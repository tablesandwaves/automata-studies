export const ratios = (arr) => {
  return Object.entries(
    arr.reduce((percentages, element) => {
      if (!Object.hasOwn(percentages, element)) percentages[element] = 0;
      percentages[element]++;
      return percentages;
    }, {})
  ).map(e => [e[0], (Math.round(e[1] / arr.length * 1000) / 10) + "%"].join(": ")).join(" ");
}
