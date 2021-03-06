export function initStorage(){
    if (!localStorage.getItem("TenBestTimesEasy")){
        const TenBestTimesEasy = [];
        const TenBestTimesHard = [];
        const LastTenGames = [];

        const game = {
            name : "Player",
            time : 0,
        }

        for(let i = 0; i < 10; i++){
            TenBestTimesEasy.push(game);
            TenBestTimesHard.push(game);
            LastTenGames.push(null);
        }

        localStorage.setItem("TenBestTimesEasy", JSON.stringify(TenBestTimesEasy));
        localStorage.setItem("TenBestTimesHard", JSON.stringify(TenBestTimesHard));
        localStorage.setItem("LastTenGames", JSON.stringify(LastTenGames));
    }
}

export function clearStorage(){
    localStorage.clear();
}

export function updateStorage(game){
    updateBestTimesEasy(game);
    updateBestTimesHard(game);
    updateLastGames(game);
}

function updateBestTimesEasy(game) {
    if(!game.singlePlayer || game.difficulty !== "starter" || game.mode !== "competetive") return;
    const TenBestTimesEasy = JSON.parse(localStorage.getItem("TenBestTimesEasy"));
    if(TenBestTimesEasy[9] !== 0 && TenBestTimesEasy[9] < game.time) return;
    let i = 0;
    while(TenBestTimesEasy[i].time !== 0 && game.time > TenBestTimesEasy[i].time) i++;
    if(TenBestTimesEasy[i].time === 0) TenBestTimesEasy[i] = game;
    else{
        for(let j = 9; j > i; j--){
            TenBestTimesEasy[j] = TenBestTimesEasy[j-1];
        }
        TenBestTimesEasy[i] = game;
    }
    localStorage.setItem("TenBestTimesEasy", JSON.stringify(TenBestTimesEasy));
}

function updateBestTimesHard(game) {
    if(!game.singlePlayer || game.difficulty !== "advanced" || game.mode !== "competetive") return;
    const TenBestTimesHard = JSON.parse(localStorage.getItem("TenBestTimesHard"));
    let i = 0;
    while(TenBestTimesHard[i].time !== 0 && game.time > TenBestTimesHard[i].time) i++;
    if(TenBestTimesHard[i].time === 0) TenBestTimesHard[i] = game;
    else{
        for(let j = 9; j > i; j--){
            TenBestTimesHard[j] = TenBestTimesHard[j-1];
        }
        TenBestTimesHard[i] = game;
    }
    localStorage.setItem("TenBestTimesHard", JSON.stringify(TenBestTimesHard));
}

export function updateLastGames(game) {
    const LastTenGames = JSON.parse(localStorage.getItem("LastTenGames"));
    if(game === null){
        LastTenGames[0] = null;
    }
    else{
        if(game.singlePlayer) return;
        for(let i = 0; i < game.names.length; i++){
            for(let j = i+1; j < game.names.length; j++){
                if(game.score[i] < game.score[j]){
                    const tempName = game.names[i];
                    const tempScore = game.score[i];
                    game.names[i] = game.names[j];
                    game.score[i] = game.score[j];
                    game.names[j] = tempName;
                    game.score[j] = tempScore;
                }
            }
        }
        
        let i = 0;
        while(LastTenGames[i] !== null) i++;
        for (let j = Math.min(9,i); j > 0; j--){
            LastTenGames[j] = LastTenGames[j-1];
        }
        LastTenGames[0] = game;
        
    }
    localStorage.setItem("LastTenGames", JSON.stringify(LastTenGames));
}