import { delay } from "./index.js";
import { StarterCards, AdvancedCards } from "./cards.js";
import { renderCards } from "./render.js";
import { updateStorage } from "./storage.js"

export const Stage = {
    NOT_STARTED: 1,
    PLAYING: 2,
    END: 4
}

export const state = {
    stage: Stage.NOT_STARTED,
    difficulty: "Advanced",
    players: 1,
    names: [],
    scores: [],
    mode: "Practice",
    cards : AdvancedCards,
    deal : [],
    count : 0,
}

export function newGame(diff, players, mode){
    state.stage = Stage.PLAYING;
    state.difficulty = diff;
    state.players = players;
    state.names = [];
    state.scores = [];
    
    delay(500).then(
        function() {
            const nameValues = document.querySelectorAll(".nameValues");
            
            for(const name of nameValues){
                state.names.push(name.value);
            }
        }
    );

    state.mode = mode;
    state.cards = ((diff === "starter") ? StarterCards : AdvancedCards);
    shuffle(state.cards);
    
    for (const card of state.cards) {
        console.log(card)
    }
    
    state.deal = [];
    for (let i = 0; i < 4; i++){
        const row = [];
        for(let j = 0; j < 3; j++){
            row.push({
                card : state.cards[i*3 + j],
                selected : false
            });
        }
        state.deal.push(row);
    }
    state.count = 12;
    state.extra = 0;
}

function shuffle(cards){
    for (let i = 0; i < cards.length; i++) {  
        const rand = i + Math.floor(Math.random() * state.cards.length - i);
        const temp = cards[rand]; 
        cards[rand] = cards[i]; 
        cards[i] = temp;
    } 
}

export function toggleSelected(card){
    card.selected = !card.selected;
}

export function goBack(){
    state.stage = Stage.NOT_STARTED;
}

export function checkSet(selectedCards){
    const game = document.querySelector("#game");
    const card1 = selectedCards[0].card;
    const card2 = selectedCards[1].card;
    const card3 = selectedCards[2].card;

    const isSet = compareCards(card1,card2,card3);
    
    if(isSet){
        for (const card of selectedCards) {
            game.firstChild.rows[card.yCord].cells[card.xCord].className = "correct";
        }
        setTimeout(function(){ dealMoreCards(selectedCards) }, 500).then;
    }
    else{
        for (const card of selectedCards) {
            game.firstChild.rows[card.yCord].cells[card.xCord].className = "notCorrect";
            setTimeout(function() {
                game.firstChild.rows[card.yCord].cells[card.xCord].className = "selected_hover";
            }, 500);
            toggleSelected(state.deal[card.yCord][card.xCord]);
        }
    }
    return isSet;
}

function compareCards(card1,card2,card3){
    return (((card1.shape === card2.shape && card2.shape === card3.shape) || (card1.shape !== card2.shape && card1.shape !== card3.shape && card2.shape !== card3.shape)) &&
    ((card1.color === card2.color && card2.color === card3.color) || (card1.color !== card2.color && card1.color !== card3.color && card2.color !== card3.color)) &&
    ((card1.number === card2.number && card2.number === card3.number) || (card1.number !== card2.number && card1.number !== card3.number && card2.number !== card3.number)) &&
    ((card1.style === card2.style && card2.style === card3.style) || (card1.style !== card2.style && card1.style !== card3.style && card2.style !== card3.style)));
}

export function checkEndGame(){
    if (state.count === state.cards.length && !checkExistSet().exists){
        state.stage = Stage.END;

        const leftPlayerButtons = document.querySelector("#leftPlayerButtons");
        const rightPlayerButtons = document.querySelector("#rightPlayerButtons");

        if(state.players > 1){
            state.scores = [];
            for (const button of leftPlayerButtons.children){
                const name = button.className;
                state.scores.push( Number(button.innerHTML.slice(name.length+1, button.innerHTML.length)) );
            }
            for (const button of rightPlayerButtons.children){
                const name = button.className;
                state.scores.push( Number(button.innerHTML.slice(name.length+1, button.innerHTML.length)) );
            }
        }
        
        let session = null;
        if(state.players === 1){
            const timer = document.querySelector("#timer").firstChild.textContent;
            const seconds = Number(timer.slice(0, 2)) * 60 + Number(timer.slice(3,5));

            session = {
                singlePlayer : true,
                difficulty : state.difficulty,
                mode : state.mode,
                names : [state.names[0]],
                time : seconds,
                score : 0
            }
        }
        else {
            session = {
                singlePlayer : false,
                difficulty : state.difficulty,
                mode : state.mode,
                names : state.names,
                time : 0,
                score : state.scores
            }
        }
        updateStorage(session);
        return true;
    }
    else return false;
}

export function checkExistSet(){
    let exists = false;
    let i = 0;
    for (let i = 0; i < 3*state.deal.length - 2 ; i++){
        for (let j = i+1; j<3*state.deal.length - 1; j++){
            for (let k = j+1; k<3*state.deal.length; k++){
                const xi = (i % 3);
                const yi = Math.floor(i / 3);

                const xj = (j % 3);
                const yj = Math.floor(j / 3);

                const xk = (k % 3);
                const yk = Math.floor(k / 3);
                exists |= compareCards(state.deal[yi][xi].card, state.deal[yj][xj].card, state.deal[yk][xk].card);
                if (exists) return {
                    exists : true,
                    cards : [{
                        x : xi,
                        y : yi,
                        card : state.deal[yi][xi].card
                    }, 
                    {
                        x : xj,
                        y : yj,
                        card : state.deal[yj][xj].card
                    }, 
                    {
                        x : xk,
                        y : yk,
                        card : state.deal[yk][xk].card
                    }]
                }
            }
        }
    }
    return {
        exists : false,
        cards : []
    }
}

function dealMoreCards(selectedCards){
    const game = document.querySelector("#game");

    if(state.deal.length === 4 && state.count+3 <= state.cards.length){
        for (const card of selectedCards){
            state.deal[card.yCord][card.xCord] = {
                card : state.cards[state.count],
                selected : false
            }
            state.count++;
        }
    }
    else{
        for (const card of selectedCards){
            state.deal[card.yCord][card.xCord] = null;
        }
        
        for (let i = 0; i < 3*(state.deal.length-1); i++){
            let x = i % 3;
            let y = Math.floor(i/3); 
            if(state.deal[y][x] === null){
                let k = 3*state.deal.length - 1;
                let kx = k % 3;
                let ky = Math.floor(k/3);
                
                while (state.deal[ky][kx] === null){
                    k--;
                    kx = k % 3;
                    ky = Math.floor(k/3);
                }
                state.deal[y][x] = state.deal[ky][kx];
                state.deal[ky][kx] = null;
            }
        }
        for(let i = 3*state.deal.length - 1; i > 3*state.deal.length - 4; i--){
            let x = i % 3;
            let y = Math.floor(i/3); 
            game.firstChild.rows[y].cells[x].style.display = "none";
        }
        state.deal.pop();
    } 
    game.innerHTML = renderCards(state.deal);
} 

export function dealExtraCards(){
    if (state.count+3 > state.cards.length) return;
    const row = [];
    for(let j = 0; j < 3; j++){
        const i = state.deal.length;
        row.push({
            card : state.cards[i*3 + j],
            selected : false
        });
    }
    state.deal.push(row)
    state.count += 3;
}