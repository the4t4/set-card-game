export function renderPlayerNames(n){
    let players = "<ul>";
    for(let i = 1; i < n + 1; i++){
        players += `<li><input type=text class=nameValues maxlength=8 value=${"Player" + i}></li>`;
    }
    players += "</ul>";
    return players;
}

export function renderPlayerButtons(names){
    let playerButtons = "<div id=leftPlayerButtons>";
    for(let i = 0; i < Math.ceil(names.length/2); i++){
        playerButtons += `<button class=${names[i]}>${names[i]}: 0</button>`;
    }
    playerButtons += "</div>";

    playerButtons += "<div id=rightPlayerButtons>";
    for(let i = Math.ceil(names.length/2); i < names.length; i++){
        playerButtons += `<button class=${names[i]}>${names[i]}: 0</button>`;
    }
    playerButtons += "</div>";

    return playerButtons;
}

export function renderCards(deal){
    let table = "<table>";
    for(let i = 0; i < deal.length; i++){
        table += "<tr>"
        for(let j = 0; j < 3; j++){
            if (deal[i][j] !== null)
                table += `<td class=selected_hover><img src = ${deal[i][j].card.path}></td>`
        }
        table += "</tr>"
    }
    table += "</table>"
    return table;
}

export function renderBestTimesEasy() {
    let table = "<table>";
    const bestTimesEasy = JSON.parse(localStorage.getItem("TenBestTimesEasy"));
    for (let i = 0; i < 10; i++) {
        if(bestTimesEasy[i].time === 0) table += `<td>${i+1}. Player: 00:00 </td>`;
        else {
            const minutes = Math.floor(bestTimesEasy[i].time / 60);
            const seconds = bestTimesEasy[i].time % 60;
            let whitespace = ""
            for(let j = bestTimesEasy[i].names[0].length; j < 8; j++){
                whitespace += "&nbsp";
            }
            table +=`<td>${i+1}. ${bestTimesEasy[i].names[0] + ":" + whitespace} ${((minutes < 10) ? "0" : "") + minutes}:${((seconds < 10) ? "0" : "") + seconds} </td>`
        }
    }
    table +="</table>";
    return table;
}

export function renderBestTimesHard() {
    let table = "<table>";
    const bestTimesHard = JSON.parse(localStorage.getItem("TenBestTimesHard"));
    for (let i = 0; i < 10; i++) {
        if(bestTimesHard[i].time === 0) table += `<td>${i+1}. Player: 00:00 </td>`;
        else {
            const minutes = Math.floor(bestTimesHard[i].time / 60);
            const seconds = bestTimesHard[i].time % 60;
            let whitespace = ""
            for(let j = bestTimesHard[i].names[0].length; j < 8; j++){
                whitespace += "&nbsp";
            }
            table +=`<td>${i+1}. ${bestTimesHard[i].names[0] + ":" + whitespace} ${((minutes < 10) ? "0" : "") + minutes}:${((seconds < 10) ? "0" : "") + seconds} </td>`
        }
    }
    table +="</table>";
    return table;
}

export function renderLastGames() {
    let table = "<table>";
    const LastTenGames = JSON.parse(localStorage.getItem("LastTenGames"));
    for (let i = 0; i < 10; i++) {
        if(LastTenGames[i] === null) table += `<td>1. Players: scores </td>`;
        else {
            table += "<td>";
            for(let j = 0; j < LastTenGames[i].names.length; j++){
                table +=`<p>${j+1}. ${LastTenGames[i].names[j] + ": "}${LastTenGames[i].score[j]}<p>`
            }
            table += "</td>";
        }
    }
    table +="</table>";
    return table;
}

export function renderSession(){
    const lastGame = JSON.parse(localStorage.getItem("LastTenGames"))[0];
    let session = "";
    for (let i = 0; i < lastGame.names.length; i++){
        session += `<p>${i+1}. ${lastGame.names[i] + ": "}${lastGame.score[i]}<p>`
    }
    return session;
}