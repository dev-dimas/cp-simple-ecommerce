const bcrypt = require("bcrypt");

const getHashBcrypt = async (data) => {
  try {
    const saltRounds = 10;
    const hashedData = await bcrypt.hash(data, saltRounds);
    return hashedData;
  } catch (error) {
    throw {status: 500};
  }
};

const compareBcrypt = async (data, hashedData) => {
  try {
    const isMatch = await bcrypt.compare(data, hashedData);
    return isMatch;
  } catch (error) {
    throw {status: 500};
  }
};

module.exports = {getHashBcrypt, compareBcrypt};
