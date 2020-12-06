// add fs functions to be able to write updates to animals.json when users POST data
const fs = require('fs');
const path = require('path');

// do this to use express.js
const express = require('express');
// require the animals.json data
const { animals } = require('./data/animals');

// tell heroku we're using port 3001 instead of the default of 80
const PORT = process.env.PORT || 3001;
// instantiate a server
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
// make CSS and other files in the 'public' folder available
app.use(express.static('public'));

// accepts a query object and an array of animals
function filterByQuery(query, animalsArray) {
    // make an array called personalityTraitsArray
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    // if the query includes the personalityTraits parameter
    if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } 
      // if query.personalityTraits is not a string, then it must be an array
      // so just set the personalityTraitsArray equal to it
      else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
        // Check the trait against each animal in the filteredResults array.
        // Remember, filteredResults is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
  }


// add a function called findById() that takes in the id and array of animals 
// and returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  }

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}


function createNewAnimal(body, animalsArray) {
    const animal = body;
    // add the posted animal to the animalsArray
    animalsArray.push(animal);
    fs.writeFileSync(
    // select the file we want to overwrite
    path.join(__dirname, './data/animals.json'),
    // turn the animalsArray (now with new animal) into
    // JSON and overwrite the 'animals' JSON list in
    // the file specified above with this new JSON list
    JSON.stringify({ animals: animalsArray }, null, 2)
    );
    return animal;
}

// add the route to the animals json file
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });

// add a route for the parameter "id"
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    // if the result exists (if the requested animal ID exists)
    if (result) {
        // respond with (res) the json of the result, in this case, 
        // the details of the animal whose id was given, which will
        // be displayed on the web page
      res.json(result);
    } else {
      // send a 404 error if the thing requested doesn't exist
      res.send(404);
    }
  });

// add a route to post new animals to the server
app.post('/api/animals', (req, res) => {
    // req.body is where our incoming content will be
    console.log(req.body);
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        // add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);
        // respond with the json of the req.body, which is
        // the incoming content
        res.json(animal);
    }
  });

// add route to run index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// add route for animals page
app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
  });

// add route for the zookeepers page
app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
  });

// make the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });