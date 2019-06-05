exports.yearArray = (year, to) => {
  let yearArr = [];
  while (year >= to && year >= 2013) {
    yearArr.push(year);
    year--;
  }
  return yearArr;
}

/**
 * Formats age for query process
 * @param {String} age - String to modify
 * 
 * @return {String} formated string 
 */
exports.ages = (age) => {
  if (age == "all" || age == null || age == "-")
    return "";
  else
    return " and a1.age = '" + age + "'"
};

/**
 * Formats region for query process
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.region = (region) => {
  return ' a0.name_1 = \'' + region + '\' AND a2.name_1 = \'' + region + '\' '
};

/**
 * Create differential array to compare ingoing/outgoig values over years
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.diffGoing = (array) => {
  try {
    let i = 0;
    for (var region in array) {
      i = 0;
      for (var year in array[region]) {
        if (i == (Object.keys(array[region]).length) - 2) {
          ingoing = Number(array[region][eval(year) + 1]['Ingoing'] - array[region][year]['Ingoing']);
          outgoing = Number(array[region][eval(year) + 1]['Outgoing'] - array[region][year]['Outgoing']);
          array[region]['diff'] = {
            'Ingoing': ingoing.roundDecimal(2),
            'Outgoing': outgoing.roundDecimal(2)
          }
          break;
        }
        i++;
      }
    }
    return array;
  }
  catch (e) {
    console.log("ERR on diff:" + e);
    return null;
  }
};

/**
 * Format number to process query
 * @param {Number} num - String to modify
 * 
 * @return {String} formated string 
 */
exports.formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}

/**
 * Create differential array to compare values over years
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.diff = (array) => {
  try {
    let i = 0;
    for (var country in array) {
      i = 0;
      for (var year in array[country]) {
        if (i == (Object.keys(array[country]).length) - 2) {
          if (array[country] && array[country][year] && array[country][eval(year) + 1]) {
            array[country]['diff'] =
              {
                'value': Number(array[country][eval(year) + 1]['value'] - array[country][year]['value']).roundDecimal(2)
              }
            break;
          }
        }
        i++
      }
    }
    return array;
  }
  catch (e) {
    console.log("ERR on diff:" + e);
    return null;
  }
}

/**
 * Get evolution over two years (Y/Y-1)
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.percentDiff = (oldV, newV, nbVal = [1]) => {
  let obj = {};
  nbVal.forEach(i => {
    if (newV[`NB${i}`] && oldV[`NB${i}`]) {
      obj[`NB${i}`] = (((newV[`NB${i}`] - oldV[`NB${i}`]) / oldV[`NB${i}`]) * 100).roundDecimal(2)
    }
  })
  return obj;
}

exports.verifyNames = (from, groupby) => {
  return (from >= 0 && from <= 4 && groupby >= 0 && groupby <= 4 && from < groupby);
}

/**
 * Round decimal according a given number of decimal
 * @param {Number} nbDec - Number of decimal
 * 
 * @class Number
 * @function roundDecimal
 * @return {Number} formated decimal 
 */
Number.prototype.roundDecimal = function (nbDec) {
  // +(val) => string converted to a Number
  return +(Math.round(this + "e+" + nbDec) + "e-" + nbDec);
};

/**
 * Capitalize a given string
 * 
 * @class String
 * @function capitalize
 * @return {String} formated string 
 */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Formats string for process query
 * 
 * @class String
 * @function nameQuery
 * @return {String} formated string 
 */
String.prototype.nameQuery = function () {
  return "name_" + this;
};

/**
 * Formats string for process destination query
 * 
 * @class String
 * @function nameQueryFrom
 * @return {String} formated string 
 */
String.prototype.nameQueryFrom = function () {
  let destination = null;
  switch (Number(this)) {
    case 0:
      destination = 'France';
      break;
    case 1:
      destination = 'Nouvelle-Aquitaine';
      break;
    case 2:
      destination = 'Gironde';
      break;
    case 3:
      destination = 'Bordeaux';
      break;
    default:
      break;
  }
  return `name_${this}=\'${destination}\'`;
};