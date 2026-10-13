//Util Funcs
function parseUrl (url) {
    return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1)
  }

// Elements
const $pokemons = document.getElementById('pokemons')
const $more = document.getElementById('more')
const $dialog = document.getElementById('dialog')
const $dialogInner = document.getElementById('dialog-inner')
const $manage = document.getElementById('manage')
const $close = document.getElementById('close')


// Data
const field = []
const pc = localStorage.getItem('pc')==null ? [] : localStorage.getItem('pc').split(',')


// Functions

//updates the array of grabbed pokemon and calls the html update
function addMons(pokemons){
  field.push(...pokemons.results)
  displayMons()
}

//looks at the array of shown pokemon and creates html to display them
function displayMons(){
  $pokemons.innerHTML = field.reduce((html,mon)=>html +  
   `<div class="pokemon" data-id='${parseUrl(mon.url)}'>
      <h2 class="mon-name">${mon.name}</h2>
      <img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(mon.url)}.png' class="mon-image">
    </div>`,'')
      
  checkPC()
}

//grabs the pokemon displayed and marks them as caught if their id is in the pc array
function checkPC(){
  const foundMon = document.getElementsByClassName('pokemon')
  for(mon of foundMon){
    if (pc.includes(mon.dataset.id)){
      mon.classList.add('caught')
    }else{
      mon.classList.remove('caught')
    }
  }
}

// Listeners
//grabs the id of the div clicked on and generates html for the dialog box dynamically
$pokemons.addEventListener('click', async function (e) {
  const $mon = e.target.closest('.pokemon')
  if($mon){
    $mon.classList.contains('caught') ? $manage.textContent = 'Release' : $manage.textContent = 'Catch'
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${$mon.dataset.id}`)
    const json = await response.json()

    const typeList = json.types.reduce((html,type)=>html + 
    `<li>${type.type.name}</li>
    `,'')

    console.log(json.moves.slice(0,4))
    const moveList = json.moves.slice(0,4).reduce((html,move)=>html + 
    `<li>${move.move.name}</li>
    `,'')

    $dialogInner.innerHTML = 
    `
    <h2 id='big-name'> ${json.name} </h2>
    <img id = 'big-mon-image'src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${json.id}.png' >
    <ul id='type-list'>Types:
      ${typeList}
    </ul>
    <ul id='move-list'>Moves:
      ${moveList}
    </ul>
    `
    $manage.dataset.id = json.id
    $dialogInner.classList.add('display')
    
    
    
    $dialog.showModal()
  }
  
  
})

//closes the dialog box by changing it;s css
$close.addEventListener('click', function () {
  $dialog.classList.remove('display')
  $dialog.close();
})

//grabs the next 20 pokemon and adds them to the field array
$more.addEventListener('click',async function (e){
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${field.length}`)
  const json = await response.json()
  addMons(json)
})

//adds the pokemon to the pc or removes it if it is already there
$manage.addEventListener('click', function (e) {
  if (pc.includes($manage.dataset.id)){
    pc.pop(pc.indexOf($manage.dataset.id))
  }else{
    pc.push($manage.dataset.id)
  }
  localStorage.setItem("pc", pc);
  displayMons()
  document.querySelector(`div[data-id*="${$manage.dataset.id}"]`).classList.contains('caught') ? $manage.textContent = 'Release' : $manage.textContent = 'Catch'
  
})

//fetch the initial pokemon
fetch('https://pokeapi.co/api/v2/pokemon/')
  .then (response => response.json())
  .then (json=> addMons(json))