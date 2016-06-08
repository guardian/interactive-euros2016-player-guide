import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import embedHTML from './text/embed.html!text'
import ga from './lib/analytics';

var players = [];
var player;
var embedInfo = {};
var photoBaseUrl = "https://interactive.guim.co.uk/2016/06/euros-player-pictures/"
var now = new Date().getTime();

var dataSources = {
        "England": "1Zsw-NAT-8xtXSQ8t-X3eyisqJPv4G-qFFHvmZ1ej0fw",
        "Germany": "1i4gM_GeUfoSvBXRHEpFAhgz3UHJukeLqxBiGwZtMKfc",
        "France":"1KAJtvbQhvsvZ2ssIY2_7qiLuOYSmFCJ1E_1eQ0ETLas",
        "Sweden":"1Fl2BMqcD70ArTn9BCA0i-DTs4kGePKYY9SXcDhcFdcI",
        "Italy":"1UkRPDfrRNOkyIazXFWERCchz9pU1hu7g7wmTRjywBMM",
        "Belgium":"1Yh-6uphNjJSbjbXhlzfl8SiYl-w6cTvk51_A_vr9sjE",
        "Wales" : "1o8MdeEpwI1NQsk7rgVx6qQDhjhjt4foxK1c--tB3DoU",
        "Republic of Ireland":"12dGYUtIkVrYRw-e0Ht_sjCXxC3qFcoe4ge7iXtKHE6E",
        "Northern Ireland":"1bD63bY4jeYtUVg9KFlKRa8C87hHQYKvlYXAxyc-5IMY",
        "Spain":"14dG-Or6_BhOJQBPcgzQktd6T0w1m93VPYmCEjr-FqMU",
        "Portugal":"1Tr7SbOKabNyj7-NPsqV-1PnrNlPH46KrZSMev76Mw3s",
        "Russia":"1dX0AiX3fwQbKrq4KNGCK44ek_g-cUgPao1O_UQJ6e5Y",
        "Ukraine":"1ddJ0CvPm23g1AB3iK7jRmzqh5f5xGTiunhEmvg7t-aY",
        "Romania" :"18oqBD3hE61x-7T_UkNMytIK12vDPSeeVYjm5e7afgqM",
        "Croatia":"1hyDiy7WOTsZar11Z7JQW9F249rKfwjY7pc7uwFdzs7g",
        "Turkey":"1T976zQpp_kp4wCtZOCw8vDe8l5GQBJDRARaWcFGmFb4",
        "Albania":"1UPpqsr7WEwnL7sKX3sT2CoJqVAj_JN-M0UZMJpp85-g",
        "Poland":"13BT44qfZatoB-QqqKOB3jgea8cUQiMb3DpIDIT4kvRw",
        "Austria":"1I-Z57rFkvo3fIuh5W3ASAq2d3OCujL_PqPEWrZVA-0Q",
        "Switzerland" : "1ff7gCcNTzEdAbFrFsCIBECneskzX-xjjU8ZpsEhJsj8",
        "Czech Republic" : "1lMTejNFx6icnonGIi8kQ3W0NAIEW2mu9DUaGTHjZJWA",
        "Slovakia":"1mV-s921mm6J4ZYRWRLccuKbZTXIUGePE6T--eY_kAQA",
        "Hungary":"13PX3dUtmYOkjruakrseUoZoUfKcXIDPi9TsMT8WlX6M",
        "Iceland":"1jie0qY09f8AqezNJqnVXzRpQOd7EcA9xPsyjkRFzHto"}

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();
    el.innerHTML = embedHTML.replace(/%assetPath%/g,config.assetPath);

    var meta = window.location.search;
    if(meta){
        var info = meta.replace('?','').split('&');
        info.forEach(function(v){
            embedInfo[v.split('=')[0]] = v.split('=')[1];
        })
    }
    if(embedInfo.team){
        embedInfo.team = decodeURIComponent(embedInfo.team);
    }
    
    var dataKey = dataSources[embedInfo.team];

    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata-test/' + dataKey + '.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => {
        	if(!resp){
        		console.error('no response')
        		return false
        	}
        	
			resp.sheets.Players.forEach(function(p){
                p.country = embedInfo.team;
				players.push(p);
			})

            findPlayer(el,config);
        }
    });
};

function findPlayer(el,config){
	if(embedInfo.player){
		embedInfo.player = decodeURIComponent(embedInfo.player);
	}

	var selectedPlayers = players.filter(function(player){
		return player.name.toLowerCase() === embedInfo.player.toLowerCase();
	})

	if(selectedPlayers.length > 0){
		player = selectedPlayers[0];
        player.simpleName = player.name.trim().replace(/[^a-zA-Z 0-9.]+/g,'').replace(/ /g, '_').replace(/-/g, '');

        var birthDate = player["date of birth"].split('/');
        var formattedBirthdate = birthDate[2] + "/" + birthDate[1] + "/" + birthDate[0]
        var unixBirthdate = new Date(formattedBirthdate).getTime();
        player.age = Math.floor((((((now - unixBirthdate)/1000)/60)/60)/24)/365)

		createCard(el,config);
	}else{
		console.error('Couldn\'t find player with that name');
		el.innerHTML = "<!-- no player -->";
	}
}

function createCard(el,config){
    el.querySelector('h1').innerHTML = player.name;
    el.querySelector('h2').innerHTML = player.country;
    
    el.querySelector('.player-position span').innerHTML = player.position;
    el.querySelector('.player-club span').innerHTML = player.club;
    el.querySelector('.player-age span').innerHTML = player.age;
    el.querySelector('.player-goals span').innerHTML = player["goals for country"];
    el.querySelector('.player-caps span').innerHTML = player.caps;
    
    el.querySelector('.player-description').innerHTML = player.bio;
    el.querySelector('.player-number').innerHTML = player.number;
    el.querySelector('.player-photo').style.backgroundImage = "url(" + photoBaseUrl + encodeURIComponent(player.country) + '/' + player.simpleName + '.jpg)';

    console.log(player.country)

    el.querySelector('#embed-wrapper').setAttribute('data-teamname',embedInfo.team);

    el.querySelector('.to-guide-btn').href += "&team=" + embedInfo.team
    console.log(player)
    player.rating = [];
    player.hasRating = false;
    for(var key in player){
        if(key.toLowerCase().indexOf('rating_match') > -1){
            var count = key.toLowerCase().replace('rating_match','');
            if(player[key]){
                player.rating.push({
                    "match" : count,
                    "rating" : player[key]
                })
   
                player.hasRating = true;
            }
        }
    }

    if(!player.hasRating){
        el.querySelector('.player-form').style.display = "none";
    }else{
        el.querySelector('.player-form span').innerHTML = "";
        player.rating.forEach(function(r){
            var rat = document.createElement('span');
            rat.innerHTML = "Match #" + r.match + ": " + r.rating;
            el.querySelector('.player-form').appendChild(rat)
        })
    }
    ga('create','UA-25353554-33')
    ga('send','pageview')

    el.querySelector('.to-guide-btn').addEventListener('click',function(e){
        ga('send', 'event', 'clicked on banner', 'from ' + window.location);
    })

    // console.log(embedInfo)
    if(embedInfo.isSimple === "true"){
        el.querySelector('#embed-wrapper').className += " simple-layout";
    }
}