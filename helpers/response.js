exports.writeResponse = function writeResponse(res, response, status) {
  res.status(status || 200).send(JSON.stringify(response));
};