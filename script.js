// TOOLS
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function show(elmnt){
    var x = document.getElementById(elmnt);
    if (x.style.display === "none"){
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// AUDIOS
var bark = new Audio('sounds/bark.wav');
var notif = new Audio('sounds/notif.mp3');
var press = new Audio('sounds/press.mp3');
var happy = new Audio('sounds/happy.mp3');
var levelup = new Audio('sounds/levelup.wav');

// TIMER
let counter;
let minutes;

let startingMinutes = 25;
let time = startingMinutes * 60;

const playButton = document.getElementById('ppBTN');
const countdownEl = document.getElementById('countdown');

function pauseOrPlay(){
    press.play();
    if (playButton.textContent ==='||'){
        playButton.textContent ='►';
        clearInterval(counter);
    } else {
        playButton.textContent ='||';
        counter = setInterval(updateCountdown, 1000);
    }
}

function changeStartTime(startTime){
    minutes = startTime;
    countdownEl.innerHTML = `${minutes}:00`;
    clearInterval(counter);
    playButton.textContent ='►';
    startingMinutes = startTime;
    time = startingMinutes * 60;
    press.play();
}

function updateCountdown(){
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    countdownEl.innerHTML = `${minutes}:${seconds}`;
    time--;
    if (time<0){
        notif.play();
        clearInterval(counter);
        playButton.textContent ='►';
        countdownEl.innerHTML = `0:00`;
        updateHappyBar(progressfill);
        rub();
    } 
}

/*drag script*/
function dragElement(elmt, handle){
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }

        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmt.style.top = (elmt.offsetTop - pos2) + "px";
        elmt.style.left = (elmt.offsetLeft - pos1) + "px";
    }

    function closeDragElement(){
        document.onmouseup = null;
        document.onmousemove = null;
    }    
}

// CUSTOMIZATION
let dogs = ['c','h','j','l','s'];
let colors = ['blue','pink','yellow','white'];

//check if item exists in local storage
function checkLocally(elemnt){
    const storedValue = localStorage.getItem(elemnt);

    if (storedValue === null || storedValue === undefined || storedValue === '') {
        localStorage.setItem(elemnt, JSON.stringify(0));
    }
}

// updating pet
checkLocally('currentDog');
let currentDog = JSON.parse(localStorage.getItem('currentDog'));

const tailEl = document.getElementById('tail');
const petEl = document.getElementById('pet');

tailEl.src="pets/tails/tail_"+dogs[currentDog]+".png";
petEl.src="pets/dog/dog_"+dogs[currentDog]+".png";

// updating furnitures
checkLocally('currentWall');
let currentWall = JSON.parse(localStorage.getItem('currentWall'));
const wallEl = document.getElementById('wall');
wallEl.style.backgroundImage = 'url("img/wall/wall_'+colors[currentWall]+'.png")';

checkLocally('currentRug');
let currentRug = JSON.parse(localStorage.getItem('currentRug'));
const rugEl = document.getElementById('rug');
rugEl.style.backgroundImage = 'url("img/rug/rug_'+colors[currentRug]+'.png")';

function changePet(){
    if (currentDog===dogs.length -1){
        currentDog = 0;
    } else{
        currentDog++;
    }
    localStorage.setItem('currentDog', currentDog);
    petEl.src="pets/dog/dog_"+dogs[currentDog]+".png";
    tailEl.src="pets/tails/tail_"+dogs[currentDog]+".png";
}

function changeWall(){
    if (currentWall===colors.length -1){
        currentWall = 0;
    } else{
        currentWall++;
    }
    localStorage.setItem('currentWall', currentWall);
    wallEl.style.backgroundImage = 'url("img/wall/wall_'+colors[currentWall]+'.png")';
}

function changeRug(){
    if (currentRug===colors.length -1){
        currentRug = 0;
    } else{
        currentRug++;
    }
    localStorage.setItem('currentRug', currentRug);
    rugEl.style.backgroundImage = 'url("img/rug/rug_'+colors[currentRug]+'.png")';
}

// PET
function closeEyes(){
    petEl.src="pets/dog/dog_"+dogs[currentDog]+"_c.png";
}

function blink(){
    closeEyes();
    sleep(100).then(() => petEl.src="pets/dog/dog_"+dogs[currentDog]+".png");
}

function rub(){
    closeEyes();
    happy.play();
    bark.play();
    sleep(2000).then(() => petEl.src="pets/dog/dog_"+dogs[currentDog]+".png");
}

// MUSIC FORM
document.querySelector(".music form").addEventListener("submit", function(event) {
    event.preventDefault(); 
    const input = document.getElementById("spotify-link").value.trim();
    const spotifyIframe = document.getElementById("spotify-frame");
    spotifyIframe.src = `https://open.spotify.com/embed/playlist/` + input.slice(34) + `?utm_source=generator`;   
});

// FRIENDSHIP-METER
// updating friendship meter
checkLocally('currentlives');
let currentlives = JSON.parse(localStorage.getItem('currentlives'));
const livesEl = document.getElementById('lives');
livesEl.textContent = parseInt(currentlives);

checkLocally('progressfill');
let progressfill = JSON.parse(localStorage.getItem('progressfill'));
const progressfillEl = document.getElementById('progress');
progressfillEl.style.width = parseInt(progressfill) + "%";

function updateHappyBar(){
    let currentWidth = parseInt(progressfillEl.style.width) || 0;
    newWidth = currentWidth + 20;

    if (newWidth >100) {
        newWidth = 20;
        livesEl.textContent = parseInt(livesEl.textContent) + 1;
        localStorage.setItem('currentlives', livesEl.textContent);
        levelup.play();
        show('levelup');
    }

    progressfillEl.style.width = `${newWidth}%`;
    localStorage.setItem('progressfill', newWidth);
}

// TO-DO
let addToDoButton = document.getElementById('addToDo');
let toDoContainer = document.getElementById('toDoContainer');
let inputfield = document.getElementById('inputfield');
addToDoButton.addEventListener('click', function(){
    var paragraph = document.createElement('div');
    paragraph.innerText = "🦴   "+ inputfield.value;
    if (!(paragraph.innerText === "🦴   ")){
        toDoContainer.appendChild(paragraph);
        press.play();
    }
    inputfield.value = "";
    paragraph.addEventListener('click', function(){
        if (paragraph.style.backgroundColor === "grey"){
            paragraph.style.backgroundColor = "white";
        } else {
            paragraph.style.backgroundColor = "grey";
            updateHappyBar();
            rub();
        }
        
    })
    paragraph.addEventListener('contextmenu', function(){
        toDoContainer.removeChild(paragraph);
    })
})

// INITIALIZATION
// blink every 4 seconds
setInterval(
    function(){ 
        blink();
    }, 
    4000
);

// set up draggable elements
dragElement(document.getElementById("music-draggable"), document.getElementById("music-drag-handle"));
dragElement(document.getElementById("custom-draggable"), document.getElementById("custom-drag-handle"));
dragElement(document.getElementById("todo-draggable"), document.getElementById("todo-drag-handle"));