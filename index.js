require("dotenv").config();
const cors = require("cors")
const morgan = require("morgan")
const express = require("express");

const app = express();
const Person = require("./models/person");

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(cors())
app.use(express.static("build"));
app.use(express.json());
app.use(morgan(":method :url :response-time ms :body"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

let phonebook = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" },
];

const isDuplicate = (name) => phonebook.find((person) => person.name === name);

app.get("/api/persons", (req, res) => Person.find({}).then(person => res.json(person)));

app.get("/api/persons/:id", (req, res) => {
  Person.findById(res.params.id).then(person => res.json(person))
});

app.get("/info", (req, res) => {
  const date = new Date(Date.now());
  res.send(
    `<p>Phonebook has info for ${phonebook.length} people</p><p>${date}</p>`
  );
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
  .then(result => {
    res.status(204).end()
  }).catch(error => next(error))
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (isDuplicate(body.name)) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
