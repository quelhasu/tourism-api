exports.ages = (age) => {
  if(age == "all" || age == null)
    return "";
  else
    return " and a1.age = '"+age+"'"
};

exports.region = (region) => {
  return ' a0.name_1 = \''+region+'\' AND a2.name_1 = \''+region+'\' '
};

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

Number.prototype.roundDecimal = function (nbDec) {
  return +(Math.round(this + "e+" + nbDec)  + "e-" + nbDec);
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};