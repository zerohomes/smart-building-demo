const convertUnitsTo = {
  kelvinToFahrenheit: (value: number) => roundOff((value * 9 / 5 - 459.67), 2),
  celciusToFahrenheit: (value: number) => roundOff((value * 9 / 5 + 32), 2),
  fahrenheitToKelvin: (value: number) => roundOff((value + 459.67) * 5 / 9, 2),
  fahrenheitToCelcius: (value: number) => roundOff((value - 32) * 5 / 9, 2),
  mSecToMPH: (value: number) => roundOff(value * 2.237, 2),
  mmphToInph: (value: number) => roundOff(value / 25.4, 2)
};

function roundOff(num: number, places: number) {
  const x = Math.pow(10, places);
  return Math.round(num * x) / x;
}

export { convertUnitsTo };