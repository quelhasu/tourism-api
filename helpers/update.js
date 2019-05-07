/**
 * Formats age for query process
 * @param {String} age - String to modify
 * 
 * @return {String} formated string 
 */
exports.ages = (age) => {
  if(age == "all" || age == null || age == "-")
    return "";
  else
    return " and a1.age = '"+age+"'"
};

/**
 * Formats region for query process
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.region = (region) => {
  return ' a0.name_1 = \''+region+'\' AND a2.name_1 = \''+region+'\' '
};

/**
 * Create differential array to compare ingoing/outgoig values over years
 * @param {String} region - String to modify
 * 
 * @return {String} formated string 
 */
exports.diffGoing = (array) => {
  for (var region in array) {
    for (var year in array[region]) {
      ingoing = Number(array[region][eval(year) + 1]['Ingoing'] - array[region][year]['Ingoing']);
      outgoing = Number(array[region][eval(year) + 1]['Outgoing'] - array[region][year]['Outgoing']);
      array[region]['diff'] = {
        'Ingoing': ingoing.roundDecimal(2),
        'Outgoing': outgoing.roundDecimal(2)
      }
      break;
    }
  }
  return array;
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
  for (var country in array) {
    for (var year in array[country]) {
      array[country]['diff'] =
        {
          'value': Number(array[country][eval(year) + 1]['value'] - array[country][year]['value']).roundDecimal(2)
        }
      break;
    }
  }
  return array;
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
    obj[`NB${i}`] = (((newV[`NB${i}`]-oldV[`NB${i}`])/oldV[`NB${i}`])*100).roundDecimal(2)
  })
  return obj;
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
  return +(Math.round(this + "e+" + nbDec)  + "e-" + nbDec);
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
  return "name_"+this;
};