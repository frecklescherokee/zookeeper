const $animalForm = document.querySelector('#animal-form');

const handleAnimalFormSubmit = event => {
  event.preventDefault();

  // get animal data and organize it
  const name = $animalForm.querySelector('[name="animal-name"]').value;
  const species = $animalForm.querySelector('[name="species"]').value;
  const dietRadioHTML = $animalForm.querySelectorAll('[name="diet"]');
  let diet;

  // loop through array of diet options users can select
  // and if a food is checked, 'diet' variable = that food
  for (let i = 0; i < dietRadioHTML.length; i += 1) {
    if (dietRadioHTML[i].checked) {
      diet = dietRadioHTML[i].value;
    }
  }

  // if there is no food in the diet array, diet = ''
  if (diet === undefined) {
    diet = '';
  }

  // get the traits selected in the form
  const selectedTraits = $animalForm.querySelector('[name="personality"').selectedOptions;
  // make an array to hold personality traits
  const personalityTraits = [];
  // loop through selectedTraits array and push the values to the personalityTraits array
  for (let i = 0; i < selectedTraits.length; i += 1) {
    personalityTraits.push(selectedTraits[i].value);
  }

  // define an animalObject with name, species, diet and personality traits from the form
  const animalObject = { name, species, diet, personalityTraits };

  // use fetch API to POST data
  fetch('/api/animals', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(animalObject)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      alert('Error: ' + response.statusText);
    })
    .then(postResponse => {
      console.log(postResponse);
      alert('Thank you for adding an animal!');
    });

};

$animalForm.addEventListener('submit', handleAnimalFormSubmit);
