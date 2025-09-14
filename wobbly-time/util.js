/**
 * Generate a Euclidean sequence of on/off gates as an Array of 1's and 0's
 *
 * @param {integer} divisor Euclidean divisor for steps
 * @param {integer} numSteps number of clock steps
 * @returns {Array} an array of on/off (1/0) gates
 */
export const bresenhamAlgorithm = (divisor, numSteps) => {
    const slope = divisor / numSteps;
    let steps = new Array();
    let previous = undefined;
    for (let i = 0; i < numSteps; i++) {
        let current = Math.floor(i * slope);
        steps.push(current != previous ? 1 : 0);
        previous = current;
    }
    return steps;
}
