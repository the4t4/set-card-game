import { state, newGame, toggleSelected,goBack, checkSet, checkEndGame, checkExistSet, dealExtraCards } from "./state.js"
import { renderPlayerNames, renderPlayerButtons, renderCards, renderBestTimesEasy, renderBestTimesHard, renderLastGames, renderSession } from "./render.js"
import { initStorage, clearStorage, updateLastGames } from "./storage.js";

const game = document.querySelector("#game");
const start = document.querySelector("#start");
const back = document.querySelector("#back");
const again = document.querySelector("#again");
const endgame = document.querySelector("#endgame");
const difficulty = document.querySelector("#difficulty");
const players = document.querySelector("#players");
const names = document.querySelector("#names");
const playerButtons = document.querySelector("#playerButtons");
const mode = document.querySelector("#mode");
const bestTimesEasy = document.querySelector("#BestTimesEasy");
const bestTimesHard = document.querySelector("#BestTimesHard");
const lastTenGames = document.querySelector("#LastTenGames");
const body = document.querySelector("body");
const left = document.querySelector("#left");
const misc = document.querySelector("#misc");
const existsSetButton = document.querySelector("#ITAS");
const p = document.querySelector("#forITAS");
const showSetButton = document.querySelector("#showSet");
const moreCardsButton = document.querySelector("#moreCards");
const timerElement = document.querySelector("#timer");
const finalMessage = document.querySelector("#finalMessage");
const cardsLeft = document.querySelector("#cardsLeft");

let selectedCards = [];
let selectedCardsCount = 0;
let itasButtonActive = false;
let ssButtonActive = false;
let time = -1;
let timer = function(){}
let setFound = false;
let activePlayerButton = null;
let disabledPlayerButtons = [];

function handlePlayerNames(){
    names.innerHTML = renderPlayerNames(Number(players.value));
}

players.addEventListener("change", handlePlayerNames);

function handleStart(){
    const difficultyValue = difficulty.value;
    const playersValue = Number(players.value);
    const modeValue = mode.value;

    selectedCards = [];
    selectedCardsCount = 0;
    p.innerHTML = "";
    itasButtonActive = false;
    ssButtonActive = false;
    setFound = false;
    disabledPlayerButtons = [];
    activePlayerButton = null;

    newGame(difficultyValue, playersValue, modeValue);
    
    left.style.display = "none";
    body.style.display = "block";
    body.style.marginTop = "5px";
    body.className = "no-animate";
    back.className = "back_display";
    cardsLeft.innerHTML = `<p>${state.cards.length - state.count}</p>`;
    cardsLeft.style.display = "block";
    endgame.style.display = "none";
    game.innerHTML = renderCards(state.deal);
    if(modeValue === "practice") enableMisc();
    else disableMisc();
    
    if(state.mode === "competetive"){
        let verdict = checkExistSet();
        while(!verdict.exists && state.count < state.cards.length){
            dealExtraCards();
            verdict = checkExistSet();
        }
        game.innerHTML = renderCards(state.deal);
    }

    if(state.players > 1) delay(500).then(
        function() {
            playerButtons.style.display = "block";
            playerButtons.innerHTML = renderPlayerButtons(state.names);
            game.style.pointerEvents = "none";
        }
    );
    else{
        time = -1;
        startTimer(false);
        timer = setInterval(function(){startTimer(false)},1000);
    } 
}

start.addEventListener("click", handleStart);

function handleBack(){
    goBack();
    body.style.display = "flex";
    body.style.marginTop = "2%";
    body.className = "animate-area";
    back.className = "back_hide";
    left.style.display = "block";
    newGame("Advanced", 1, "Practice");
    game.style.display = "block";
    game.innerHTML = renderCards(state.deal);
    game.style.pointerEvents = "auto";
    selectedCards = [];
    selectedCardsCount = 0;
    p.innerHTML = "";
    itasButtonActive = false;
    ssButtonActive = false;
    setFound = false;
    disabledPlayerButtons = [];
    activePlayerButton = null;
    disableMisc();
    playerButtons.style.display="none";
    if(state.players === 1) stopTimer();
    endgame.style.display = "none";
    cardsLeft.style.display = "none";
    bestTimesEasy.innerHTML = renderBestTimesEasy();
    bestTimesHard.innerHTML = renderBestTimesHard();
    lastTenGames.innerHTML = renderLastGames();
}

back.addEventListener("click", handleBack)

function handleAgain(){
    selectedCards = [];
    selectedCardsCount = 0;
    p.innerHTML = "";
    itasButtonActive = false;
    ssButtonActive = false;
    setFound = false;
    disabledPlayerButtons = [];
    activePlayerButton = null;

    newGame(state.difficulty, state.players, state.mode);
    if(state.mode === "practice") enableMisc();
    
    endgame.style.display = "none";
    cardsLeft.innerHTML = `<p>${state.cards.length - state.count}</p>`;
    cardsLeft.style.display = "block";
    game.style.display = "block";
    game.innerHTML = renderCards(state.deal);
    if(state.players === 1 ){
        stopTimer();
        time = -1;
        startTimer(false);
        timer = setInterval(function(){startTimer(false)},1000);
    }
    else {
        updateLastGames(null);
        game.style.pointerEvents = "none";  
    }
}
again.addEventListener("click", handleAgain);

async function handleCardClick(playerButton){
    const card = this;
    const row = card.parentNode;

    const x = card.cellIndex;
    const y = row.rowIndex;

    toggleSelected(state.deal[y][x]);

    if(state.deal[y][x].selected) {
        card.className = "selected";
        selectedCardsCount++;
        selectedCards.push({
            xCord : x, 
            yCord : y,
            card : state.deal[y][x].card
        });
    }
    else{
        card.className = "selected_hover";
        selectedCardsCount--;
        selectedCards = selectedCards.filter(card => card.card !== state.deal[y][x].card);
        
    }
    
    if(selectedCardsCount === 3){
        if (state.players > 1) game.style.pointerEvents = "none";
        const isSet = checkSet(selectedCards);
        let ended = checkEndGame();
        if (isSet) {
            setFound = true;
            delay(500).then(function(){
                if(state.mode === "competetive"){
                    let verdict = checkExistSet();
                    while(!verdict.exists && state.count < state.cards.length){
                        dealExtraCards();
                        verdict = checkExistSet();
                    }
                    game.innerHTML = renderCards(state.deal);
                    
                    if(!ended) ended = checkEndGame();
                }
                cardsLeft.innerHTML = `<p>${state.cards.length - state.count}</p>`;
                handleExistsSetButtonClick(false);
                }
            );
        }
        else if (!isSet && state.players > 1){            
            stopTimer();
            for(const button of leftPlayerButtons.children){
                button.disabled = false;
            }
            for(const button of rightPlayerButtons.children){
                button.disabled = false;
            }
            disabledPlayerButtons.push(activePlayerButton);
            if(disabledPlayerButtons.length === state.players) {
                disabledPlayerButtons = [];
                if(state.mode === "competetive"){
                    dealExtraCards();
                    game.innerHTML = renderCards(state.deal);
                }
            }
            for(const button of disabledPlayerButtons){
                button.disabled = true;
            }
            
            const name = activePlayerButton.className;
            const score = Number(activePlayerButton.innerHTML.slice(name.length+1, activePlayerButton.innerHTML.length)) - 1;
            activePlayerButton.innerHTML = name + ": " + score;
        }
        
        delay(500).then(function(){handleShowSetButtonClick(false);});
        
        selectedCardsCount = 0;
        selectedCards = [];
        
        delay(1000).then(
            function(){
                let delayed = false;
                if(!ended) {
                    ended = checkEndGame()
                    delayed = true;
                };
                if (ended) {
                    disableMisc();
                    game.style.display = "none";
                    endgame.style.display = "block";
                    if(state.players === 1){
                        stopTimer();
                        const timer = document.querySelector("#timer").firstChild.textContent;
                        const seconds = Number(timer.slice(0, 2)) * 60 + Number(timer.slice(3,5));
                        finalMessage.innerHTML = `<p>Elapsed time: ${seconds- (delayed ? 1 : 0) }s</p>`;
                    }
                    else{
                        finalMessage.innerHTML = renderSession();
                    }
                }
            }
        );
    }
}

delegate(game, "click", "td", handleCardClick);

export function handleExistsSetButtonClick(clicked){
    if (clicked){
        itasButtonActive = !itasButtonActive;
        if(itasButtonActive) 
            p.innerHTML = ((checkExistSet().exists) ? " Yes" : " No");
        else p.innerHTML = "";
    }
    else if (!clicked && itasButtonActive) p.innerHTML = ((checkExistSet().exists) ? " Yes" : " No");
}

existsSetButton.addEventListener("click", function() {handleExistsSetButtonClick(true);});

function handleShowSetButtonClick(clicked){
    const verdict = checkExistSet();

    if(clicked){
        ssButtonActive = !ssButtonActive;
        if(ssButtonActive){
            for(let i = 0; i < state.deal.length; i++){
                for(let j = 0; j < 3; j++){
                    const card = state.deal[i][j];
                    if(card !== null && card.selected){
                        toggleSelected(card);
                        game.firstChild.rows[i].cells[j].className = "selected_hover";
                        selectedCards = [];
                        selectedCardsCount = 0;
                    }
                }
            }
            if (verdict.exists){
                for (const card of verdict.cards) {
                    if (game.firstChild.rows[card.y].cells[card.x].className !== "selected")
                        game.firstChild.rows[card.y].cells[card.x].className = "hint";
                }
            }
            else {
                ssButtonActive = !ssButtonActive;
                const tds = document.querySelectorAll("#game td")
                for (const td of tds){
                    td.className = "notCorrect";
                    setTimeout(function() {
                        td.className = "selected_hover";
                    }, 500);
                }
            }
        }
        else if (!ssButtonActive && verdict.exists) {
            for (const card of verdict.cards) {
                if (game.firstChild.rows[card.y].cells[card.x].className !== "selected")
                    game.firstChild.rows[card.y].cells[card.x].className = "selected_hover";
            }
        }
    }
    else if (!clicked){
        ssButtonActive = false;
        if(verdict.exists){
            for (const card of verdict.cards) {
                if (game.firstChild.rows[card.y].cells[card.x].className !== "selected")
                    game.firstChild.rows[card.y].cells[card.x].className = "selected_hover";
            }
        }
    }
}

showSetButton.addEventListener("click", function(){handleShowSetButtonClick(true)});

function handleMoreCardsButtonClick(){
    dealExtraCards();
    game.innerHTML = renderCards(state.deal);
    cardsLeft.innerHTML = `<p>${state.cards.length - state.count}</p>`;
}

moreCardsButton.addEventListener("click", handleMoreCardsButtonClick);

function handlePlayerNameClick(){
    game.style.pointerEvents = "auto";
    activePlayerButton = this;
    setFound = false;
    const leftPlayerButtons = document.querySelector("#leftPlayerButtons");
    const rightPlayerButtons = document.querySelector("#rightPlayerButtons");
    for(const button of leftPlayerButtons.children){
        button.disabled = true;
    }
    for(const button of rightPlayerButtons.children){
        button.disabled = true;
    }

    time = 11;
    startTimer(true);
    timer = setInterval(function(){startTimer(true)},1000);
}

delegate(playerButtons, "click", "button", handlePlayerNameClick)

window.onload = () => {
    initStorage();
    back.className = "back_hide";
    newGame("Advanced", 1, "Practice");
    names.innerHTML = renderPlayerNames(Number(players.value));
    game.innerHTML = renderCards(state.deal);
    bestTimesEasy.innerHTML = renderBestTimesEasy();
    bestTimesHard.innerHTML = renderBestTimesHard();
    lastTenGames.innerHTML = renderLastGames();
    disableMisc();
}

function disableMisc(){
    misc.style.display = "none";
}

function enableMisc(){
    misc.style.display = "block";
}

function startTimer(countdown){
    timerElement.style.display = "block";
    let seconds = 0;
    let minutes = 0;
    
    if (!countdown){
        time++;
        seconds = time % 60;
        minutes = Math.floor(time / 60);
    }
    else{
        if(setFound){
            stopTimer();
            for(const button of leftPlayerButtons.children){
                button.disabled = false;
            }
            for(const button of rightPlayerButtons.children){
                button.disabled = false;
            }
            const name = activePlayerButton.className;
            const score = Number(activePlayerButton.innerHTML.slice(name.length+1, activePlayerButton.innerHTML.length)) + 1;
            activePlayerButton.innerHTML = name + ": " + score;
        }

        time--;
        seconds = time;

        if(time <= 0){

            for(const card of selectedCards){
                game.firstChild.rows[card.yCord].cells[card.xCord].className = "selected_hover";
                toggleSelected(state.deal[card.yCord][card.xCord]);
            }
            selectedCards = [];
            selectedCardsCount = 0;

            game.style.pointerEvents = "none";

            stopTimer();
            for(const button of leftPlayerButtons.children){
                button.disabled = false;
            }
            for(const button of rightPlayerButtons.children){
                button.disabled = false;
            }
            disabledPlayerButtons.push(activePlayerButton);
            if(disabledPlayerButtons.length === state.players) disabledPlayerButtons = [];
            for(const button of disabledPlayerButtons){
                button.disabled = true;
            }
            
            const name = activePlayerButton.className;
            const score = Number(activePlayerButton.innerHTML.slice(name.length+1, activePlayerButton.innerHTML.length)) - 1;
            activePlayerButton.innerHTML = name + ": " + score;
        }
    }
    timerElement.innerHTML = `<p>${ ((minutes < 10) ? "0" : "") + minutes}:${ ((seconds < 10) ? "0" : "") + seconds}</p>`;
}

function stopTimer(){
    timerElement.style.display = "none";
    clearInterval(timer);
}

function delegate(parent, type, selector, handler) {
    parent.addEventListener(type, function (event) {
      const targetElement = event.target.closest(selector);
  
      if (this.contains(targetElement)) {
        handler.call(targetElement, event);
      }
    });
}

export function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }