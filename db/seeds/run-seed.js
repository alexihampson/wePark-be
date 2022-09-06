const data = require("../data/test-data/index");
const seed = require("./seed");
const db = require("../connection");

const runSeed = () => {
  return seed(data).then(() => db.end());
};

runSeed();
