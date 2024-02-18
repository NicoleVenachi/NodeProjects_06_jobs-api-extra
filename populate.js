require("dotenv").config();

const connectDB = require("./db/connect"); //db to connect to

const JobModel = require("./models/Job"); // data model (jobs)
const mockData = require("./MOCK_DATA.json"); //data

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI); // db connection

    // await JobModel.deleteMany(); // cleanning existing registers
    await JobModel.create(mockData); // create a bunch of data registers  <[{}'s] || {}>

    // throw new Error('just testing ')
    console.log("success!!!!");
    process.exit(0); // finishing the script excecution
  } catch (error) {
    console.log(error);
    process.exit(1); // finishing the script excecution
  }
};

start();
