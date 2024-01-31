const mongoose = require('mongoose')

const password = process.argv[2];
const url = `mongodb+srv://dbUser:${password}@cluster0.xwgm7ge.mongodb.net/phoneApp?retryWrites=true&w=majority`;

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

mongoose.set("strictQuery", false);
mongoose.connect(url);

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
} else if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length > 3) {
    person.save().then((result) => {
      console.log(
        `added ${process.argv[3]} number ${process.argv[4]} to phonebook`
      );
      mongoose.connection.close();
    });
}