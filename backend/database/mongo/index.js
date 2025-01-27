const mongoose = require("mongoose");

const connectToMongo = async ({ dbOptions, callback }) => {
  try {
    await mongoose.connect(dbOptions.url, {
      dbName: dbOptions.databaseName,
    });
    process.nextTick(() => {
      callback();
    });
  } catch (error) {
    console.log(error?.message);
    throw new Error("Internal server error, can't connect to mongodb");
  }
};

module.exports.DATABASE = {
  connectToMongo,
};
