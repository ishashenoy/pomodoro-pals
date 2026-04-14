// TOOLS
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function show(elmnt){
    let x = document.getElementById(elmnt);
    if (x.style.display === "none"){
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

let currentSettingsPage = 'appearance';
let currentMusicPage = 'spotify';
let isDesktopSettingsVisible = true;

function isDesktopSettingsLayout(){
    return window.matchMedia('(min-width: 1024px)').matches;
}

function syncSettingsLayout(){
    const backdrop = document.getElementById('custom-modal-backdrop');
    const settingsPanel = document.getElementById('custom-draggable');
    if (!backdrop || !settingsPanel) return;

    if (isDesktopSettingsLayout()) {
        backdrop.style.display = 'none';
        settingsPanel.style.display = isDesktopSettingsVisible ? 'block' : 'none';
    } else {
        backdrop.style.display = 'none';
        settingsPanel.style.display = 'none';
    }
}

function setSettingsPage(page){
    const pages = ['appearance', 'timer'];
    if (!pages.includes(page)) return;

    pages.forEach((pageId) => {
        const tabEl = document.getElementById(`settings-tab-${pageId}`);
        const pageEl = document.getElementById(`settings-page-${pageId}`);
        const isActive = pageId === page;

        if (tabEl) {
            tabEl.classList.toggle('is-active', isActive);
            tabEl.setAttribute('aria-selected', String(isActive));
        }

        if (pageEl) {
            pageEl.classList.toggle('is-active', isActive);
        }
    });

    currentSettingsPage = page;
}

function openCustomizeModal() {
    setSettingsPage(currentSettingsPage || 'appearance');
    if (isDesktopSettingsLayout()) {
        isDesktopSettingsVisible = !isDesktopSettingsVisible;
        document.getElementById('custom-modal-backdrop').style.display = 'none';
        document.getElementById('custom-draggable').style.display = isDesktopSettingsVisible ? 'block' : 'none';
        return;
    }
    document.getElementById('custom-modal-backdrop').style.display = 'block';
    document.getElementById('custom-draggable').style.display = 'block';
}

function closeCustomizeModal() {
    if (isDesktopSettingsLayout()) {
        isDesktopSettingsVisible = false;
        document.getElementById('custom-draggable').style.display = 'none';
        return;
    }
    document.getElementById('custom-modal-backdrop').style.display = 'none';
    document.getElementById('custom-draggable').style.display = 'none';
}

function setMusicPage(page){
    const pages = ['spotify', 'youtube'];
    if (!pages.includes(page)) return;

    pages.forEach((pageId) => {
        const tabEl = document.getElementById(`music-tab-${pageId}`);
        const pageEl = document.getElementById(`music-page-${pageId}`);
        const isActive = pageId === page;

        if (tabEl) {
            tabEl.classList.toggle('is-active', isActive);
            tabEl.setAttribute('aria-selected', String(isActive));
        }

        if (pageEl) {
            pageEl.classList.toggle('is-active', isActive);
        }
    });

    currentMusicPage = page;
}

function checkLocally(elemnt, vValue){
    const storedValue = localStorage.getItem(elemnt);

    if (storedValue === null || storedValue === undefined || storedValue === '') {
        localStorage.setItem(elemnt, JSON.stringify(vValue));
    }

    return JSON.parse(localStorage.getItem(elemnt));
}

// AUDIOS
const bark = new Audio('sounds/bark.wav');
const notif = new Audio('sounds/notif.mp3');
const press = new Audio('sounds/press.mp3');
const happy = new Audio('sounds/happy.mp3');
const levelup = new Audio('sounds/levelup.wav');

// TIMER
let counter;
let minutes;

let pomodoroMinutes = checkLocally('pomodoroMinutes', 25);
let breakMinutes = checkLocally('breakMinutes', 5);
let startingMinutes = pomodoroMinutes;
let time = startingMinutes * 60;

const playButton = document.getElementById('ppBTN');
const countdownEl = document.getElementById('countdown');
countdownEl.innerHTML = `${startingMinutes}:00`;

const pomodoroMinutesInput = document.getElementById('pomodoro-minutes');
const breakMinutesInput = document.getElementById('break-minutes');
pomodoroMinutesInput.value = pomodoroMinutes;
breakMinutesInput.value = breakMinutes;

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

function startPomodoroSession(){
    changeStartTime(pomodoroMinutes);
}

function startBreakSession(){
    changeStartTime(breakMinutes);
}

function clampTimerMinutes(value, min, max, fallback){
    let n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

function saveTimerDurations(){
    const p = clampTimerMinutes(pomodoroMinutesInput.value, 1, 120, 25);
    const b = clampTimerMinutes(breakMinutesInput.value, 1, 60, 5);
    pomodoroMinutesInput.value = p;
    breakMinutesInput.value = b;
    pomodoroMinutes = p;
    breakMinutes = b;
    localStorage.setItem('pomodoroMinutes', JSON.stringify(p));
    localStorage.setItem('breakMinutes', JSON.stringify(b));
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
    let isDragging = false;
    let activePointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    function positionElement(clientX, clientY){
        elmt.style.left = (clientX - offsetX) + "px";
        elmt.style.top = (clientY - offsetY) + "px";
    }

    function startDrag(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }

        const rect = elmt.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        isDragging = true;
        e.preventDefault();

        if (e.pointerId !== undefined) {
            activePointerId = e.pointerId;
            handle.setPointerCapture(e.pointerId);
        }
    }

    function elementDrag(e){
        if (!isDragging) return;
        if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

        e.preventDefault();
        positionElement(e.clientX, e.clientY);
    }

    function closeDragElement(e){
        if (!isDragging) return;
        if (e && activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

        if (e && e.pointerId !== undefined && handle.hasPointerCapture(e.pointerId)) {
            handle.releasePointerCapture(e.pointerId);
        }

        isDragging = false;
        activePointerId = null;
    }

    if (window.PointerEvent) {
        handle.addEventListener('pointerdown', startDrag);
        window.addEventListener('pointermove', elementDrag);
        window.addEventListener('pointerup', closeDragElement);
        window.addEventListener('pointercancel', closeDragElement);
    } else {
        handle.onmousedown = function(e) {
            startDrag(e || window.event);
            document.onmousemove = elementDrag;
            document.onmouseup = function(mouseUpEvent){
                closeDragElement(mouseUpEvent || window.event);
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }
}

// CUSTOMIZATION
let dogs = ['c','h','j','l','s'];
let colors = ['blue','pink','yellow','white'];

// updating pet
let currentDog = checkLocally('currentDog',0);

tailEl = document.getElementById('tail');
petEl = document.getElementById('pet');

tailEl.src="pets/tails/tail_"+dogs[currentDog]+".png";
petEl.src="pets/dog/dog_"+dogs[currentDog]+".png";

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


// updating furnitures
let currentWall = checkLocally('currentWall',0);
const wallEl = document.getElementById('wall');
wallEl.style.backgroundImage = 'url("img/wall/wall_'+colors[currentWall]+'.png")';

let currentRug = checkLocally('currentRug',0);
const rugEl = document.getElementById('rug');
rugEl.style.backgroundImage = 'url("img/rug/rug_'+colors[currentRug]+'.png")';

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
    document.querySelector(".happyHeart").style.display = "block";
    happy.play();
    bark.play();
    sleep(2000).then(
        () => {petEl.src="pets/dog/dog_"+dogs[currentDog]+".png";
        document.querySelector(".happyHeart").style.display = "none";}
    );

}

// MUSIC FORM
function getSpotifyEmbedUrl(input){
    if (!input) return null;

    if (input.includes('open.spotify.com/embed/')) {
        return input.includes('?') ? `${input}&utm_source=generator` : `${input}?utm_source=generator`;
    }

    const match = input.match(/open\.spotify\.com\/(playlist|track)\/([a-zA-Z0-9]+)/);
    if (!match) return null;

    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
}

function getYouTubeEmbedUrl(input){
    if (!input) return null;

    let parsedUrl;
    try {
        parsedUrl = new URL(input);
    } catch (error) {
        return null;
    }

    const host = parsedUrl.hostname.replace('www.', '');
    const listId = parsedUrl.searchParams.get('list');
    const videoId = parsedUrl.searchParams.get('v');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (listId) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(listId)}`;
        if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    }

    if (host === 'youtu.be') {
        const shortId = parsedUrl.pathname.replace('/', '');
        if (shortId) return `https://www.youtube.com/embed/${encodeURIComponent(shortId)}`;
    }

    return null;
}

const spotifyFormEl = document.getElementById('spotify-form');
if (spotifyFormEl) {
    spotifyFormEl.addEventListener('submit', function(event) {
        event.preventDefault();
        const input = document.getElementById('spotify-link').value.trim();
        const spotifyIframe = document.getElementById('spotify-frame');
        const embedUrl = getSpotifyEmbedUrl(input);
        if (!embedUrl) return;
        spotifyIframe.src = embedUrl;
    });
}

const youtubeFormEl = document.getElementById('youtube-form');
if (youtubeFormEl) {
    youtubeFormEl.addEventListener('submit', function(event) {
        event.preventDefault();
        const input = document.getElementById('youtube-link').value.trim();
        const youtubeIframe = document.getElementById('youtube-frame');
        const embedUrl = getYouTubeEmbedUrl(input);
        if (!embedUrl) return;
        youtubeIframe.src = embedUrl;
    });
}

// FRIENDSHIP METER
// updating friendship meter
let currentlives = checkLocally('currentlives',0);
const livesEl = document.getElementById('lives');
livesEl.textContent = parseInt(currentlives);

let progressfill = checkLocally('progressfill',0);
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

function toDoButtonFunctionality(elmnt){
    elmnt.addEventListener('click', function(){
        if (elmnt.style.backgroundColor === "grey"){
            elmnt.style.backgroundColor = "white";
        } else {
            elmnt.style.backgroundColor = "grey";
            updateHappyBar();
            rub();
        }
    })
    elmnt.addEventListener('contextmenu', function(){
        toDoContainer.removeChild(elmnt);
    })

}

// check for to-do list items in local storage
let savedTodos = checkLocally('currentTodo',[[]]);

for(let i in savedTodos){
    let paragraph = document.createElement('div');
    paragraph.className = 'currentToDoItem';
    paragraph.innerText = "🦴 "+ savedTodos[i][0];
    if(savedTodos[i][1] === true){
        paragraph.style.backgroundColor = "grey";
    } else {
        paragraph.style.backgroundColor = "white";
    }

    if (!(savedTodos[i][0] === undefined)){
        toDoContainer.appendChild(paragraph);
        toDoButtonFunctionality(paragraph);
    }
}

addToDoButton.addEventListener('click', function(){
    let paragraph = document.createElement('div');
    paragraph.className = 'currentToDoItem';
    paragraph.innerText = "🦴 "+ inputfield.value;
    if (!(paragraph.innerText === "🦴 ")){
        toDoContainer.appendChild(paragraph);
        press.play();
    }
    inputfield.value = "";
    toDoButtonFunctionality(paragraph);
});

addEventListener("beforeunload", () => {
    const currentToDoItems = Array.from(document.querySelectorAll(".currentToDoItem"))
    let todosToSave = [[]];
    for(let i = 0; i < currentToDoItems.length; i++){
        todosToSave[i] = [];
        todosToSave[i][0] =currentToDoItems[i].innerText.trim().slice(3);
        if(currentToDoItems[i].style.backgroundColor === "grey"){
            todosToSave[i][1] = true;
        } else {
            todosToSave[i][1] = false;
        }
    }
    localStorage.setItem('currentTodo', JSON.stringify(todosToSave));
});

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
dragElement(document.getElementById("todo-draggable"), document.getElementById("todo-drag-handle"));

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeCustomizeModal();
    }
});

syncSettingsLayout();
window.addEventListener('resize', syncSettingsLayout);