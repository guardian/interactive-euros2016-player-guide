import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'

var players = [];
var player;

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML.replace(/%assetPath%/g,config.assetPath);

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
                        p.country = key;
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
    console.log(player);
    el.querySelector('h1').innerHTML = player.name;
    el.querySelector('h2').innerHTML = player.country;
    el.querySelector('.player-number').innerHTML = player.number;
    el.querySelector('.player-team span').innerHTML = player.club;
    el.querySelector('.player-goals span').innerHTML = player["goals for country"];
    el.querySelector('.player-description').innerHTML = player.bio;
    el.querySelector('#embed-wrapper').setAttribute('data-teamname',player.country)

    if(player.rating_match1 || player.rating_match2 || player.rating_match3){
        
    }else{
        el.querySelector('.player-form').innerHTML = "";
    }
}