import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import playerHTML from './text/playerDetailPage.html!text'

var players = [];
var player;

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata-test/10WUlJVnZ23A1JmMESn7sOGm0s3WwKHynz-ptV_8b8uQ.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => {
        	if(!resp){
        		console.error('no response')
        		return false
        	}

        	for(var key in resp.sheets){
        		if(key !== "Teams"){
        			resp.sheets[key].forEach(function(p){
        				players.push(p);
        			})
        		}
        	}

            findPlayer(el,config);
        }
    });
};

function findPlayer(el,config){
	var meta = window.location.search;
	var embedInfo = {};


    if(meta){
    	var info = meta.replace('?','').split('&');
    	info.forEach(function(v){
    		embedInfo[v.split('=')[0]] = v.split('=')[1];
    	})
    	if(embedInfo.player){
    		embedInfo.player = decodeURIComponent(embedInfo.player);
    	}

    	var selectedPlayers = players.filter(function(player){
    		return player.name.toLowerCase() === embedInfo.player.toLowerCase();
    	})

    	if(selectedPlayers.length > 0){
    		player = selectedPlayers[0];
    		createCard(el,config);
    	}else{
    		console.error('Couldn\'t find player with that name');
    		el.innerHTML = "<!-- no player -->";
    	}
    }

   
}

function createCard(el,config){
	el.innerHTML = playerHTML;
}