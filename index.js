const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');

const app = express();

let data = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39445323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "1243234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39236423122"
  }
];

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
}


app.use(express.json());
// app.use(morgan((tokens, req, res) => {
//   let log = [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](req, res), 'ms'
//   ].join(' ');
//
//   if (req.method === 'POST') {
//     return `${log} ${JSON.stringify(req.body)}`;
//   }
//
//   return log;
// }));
app.use(cors());
app.use(express.static('build', options));


app.route('/api/persons')
  .get((req, res) => {
    console.log("GET /api/persons -- 200 OK");
    res.json(data);
  })
  .post((req, res) => {
    const body = req.body;
    const hasDuplicate = data.find((entry) => entry.name === body.name);

    if (!body.name || !body.number) {
      console.log("POST /api/persons -- 400 name or number missing");
      return res.status(400).json({error: 'Name or number missing'});
    }


    if (hasDuplicate) {
      console.log("POST /api/persons -- 400 duplicate name");
      return res.status(400).json({error: `Name ${body.name} already exists in phonebook`});
    }


    const person = {
      id: Math.floor((Math.random() * 100) + 1),
      ...body
    };

    data = data.concat(person);

    console.log("POST /api/persons -- 200 OK");
    res.json(person);
  });

app.route('/api/persons/:id')
  .get((req, res) => {
    const id = Number(req.params.id);
    const resource = data.find((entry) => entry.id === id);

    if (resource) {
      res.json(resource);
    } else {
      res.sendStatus(404);
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const newList = data.filter((entry) => entry.id !== id);

    if (data.length === newList.length) {
      res.sendStatus(404);
    } else {
      data = newList;
      res.sendStatus(204);
    }
  });


app.get('/api/info', (req, res) => {
  res.send(new Date().toString() + `<p>Phonebook has ${data.length} person(s) in it</p>`);
});

const unknownEndpoint = (req, res) => {
  res.status(404).json({error: 'Unknown endpoint'});
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}...`);
});