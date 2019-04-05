exports.ages = (age) => {
  if(age == "all" || age == null)
    return "";
  else
    return " and a1.age = '"+age+"'"
}