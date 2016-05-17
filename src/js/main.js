import reqwest from 'reqwest'
import qwery from 'qwery'
import bonzo from 'bonzo'
import Handlebars from 'handlebars'

import mainHTML from './text/main.html!text'
import teamHTML from './text/teamPage.html!text'
import playerCircleHTML from './text/playerCircle.html!text'
import playerDetailHTML from './text/playerDetailPage.html!text'

var data = {};
var teams;
var currentTeam = "England";
var currentActivePlayer;
var windowWidth = window.innerWidth;
var isMobile = windowWidth < 980 ? true : false;
var onStart = true;
var projectAssetpath;
var keyString = {};
var dataSources = {
    "England": "1Zsw-NAT-8xtXSQ8t-X3eyisqJPv4G-qFFHvmZ1ej0fw",
    "Germany": "1i4gM_GeUfoSvBXRHEpFAhgz3UHJukeLqxBiGwZtMKfc",
    "France":"1KAJtvbQhvsvZ2ssIY2_7qiLuOYSmFCJ1E_1eQ0ETLas",
    "Sweden":"1Fl2BMqcD70ArTn9BCA0i-DTs4kGePKYY9SXcDhcFdcI",
    "Italy":"1UkRPDfrRNOkyIazXFWERCchz9pU1hu7g7wmTRjywBMM",
    "Belgium":"1Yh-6uphNjJSbjbXhlzfl8SiYl-w6cTvk51_A_vr9sjE",
    "Wales" : "1o8MdeEpwI1NQsk7rgVx6qQDhjhjt4foxK1c--tB3DoU",
    "Rep of Ireland":"12dGYUtIkVrYRw-e0Ht_sjCXxC3qFcoe4ge7iXtKHE6E",
    "N Ireland":"1bD63bY4jeYtUVg9KFlKRa8C87hHQYKvlYXAxyc-5IMY",
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
    "Czech Republic":"1lMTejNFx6icnonGIi8kQ3W0NAIEW2mu9DUaGTHjZJWA",
    "Slovakia":"1mV-s921mm6J4ZYRWRLccuKbZTXIUGePE6T--eY_kAQA",
    "Hungary":"13PX3dUtmYOkjruakrseUoZoUfKcXIDPi9TsMT8WlX6M",
    "Iceland": "1jie0qY09f8AqezNJqnVXzRpQOd7EcA9xPsyjkRFzHto"
}
var masterTeamData = "1We0iF5KgHN0LlQjFn9C9onBrX1ovVJnsbTv9qTKBQn0";

data.teamNames = ["England","Germany","France","Sweden","Italy","Belgium","Wales Rep of Ireland","N Ireland","Spain","Portugal","Russia","Ukraine","Romania Croatia","Turkey","Albania","Poland","Austria","Switzerland", "Czech Republic","Slovakia","Hungary","Iceland"];

function $(selector,context){
    return bonzo(qwery(selector,context));
}

export function init(el, context, config, mediator) {
    projectAssetpath = config.assetPath;
    if(window.location.search){
        var string = window.location.search.replace('?','').split('&');
        string.forEach(function(a){
            keyString[a.split('=')[0]] = a.split('=')[1];
        })
        if(keyString.team){
            currentTeam = keyString.team;
        }
    }
    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata-test/' + masterTeamData + '.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => {
            data.teams = [];
            data.isMobile = isMobile;

            resp.sheets.Teams.forEach(function(team){
                var players = [
                    {position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"},
                    {position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},
                    {position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},
                    {position:"Goalkeeper"},{position:"Goalkeeper"},{position:"Goalkeeper"}
                ];
                var dummyText = {
                    "bio":"There is no bio yet for this country. So we fill it with some dummy text. Ius cu reque debet recusabo, eu vis tale vulputate. Atqui iudicabit ei duo, cum et fugit nulla. Probo facilis vulputate id vix, cu nec modo noluisse deterruisset. Munere definiebas cu est, per vide dicit ridens ne. Mei malis fabulas persequeris cu, ea dictas incorrupte mel.",
                    "strengths": "Nothing has been filled in yet. So here's some test copy. Ius cu reque debet recusabo, eu vis tale vulputate. Atqui iudicabit ei duo, cum et fugit nulla.",
                    "weaknesses": "Nothing here yet. Filling it in with some dummy text. Ius cu reque debet recusabo, eu vis tale vulputate. Atqui iudicabit ei duo, cum et fugit nulla."
                }

                team.bio = !team.bio ? dummyText.bio : team.bio;
                team.strengths = !team.strengths ? dummyText.strengths : team.strengths;
                team.weaknesses = !team.weaknesses ? dummyText.weaknesses : team.weaknesses;
                
                console.log(team.Team.toLowerCase())

                data.teams.push({
                    "teamName": team.Team,
                    "teamNameLowercase": team.Team.toLowerCase(),
                    "teamInfo": team,
                    "players":{
                        "Forwards": players.filter((player)=> player.position === "Forward" || player.position === "Forward (winger)"),
                        "Midfielders": players.filter((player)=> player.position === "Midfielder"),
                        "Defenders": players.filter((player)=> player.position === "Defender"),
                        "Goalkeepers": players.filter((player)=> player.position === "Goalkeeper")
                    },
                    "isActive": team.Team === currentTeam ? true : false
                })
                console.log(data.teams);
            });

            createPage(el,config);
        }
    });
}

function createPage(el,config){
    Handlebars.registerPartial('teamPage',teamHTML);
    Handlebars.registerPartial('playerCircle',playerCircleHTML);
    Handlebars.registerPartial('playerDetailPage',playerDetailHTML);

    var mainTemplate = Handlebars.compile(mainHTML);
    var mainTemplateParsed = mainTemplate(data).replace(/%assetPath%/g,config.assetPath);
    var teamTemplate = Handlebars.compile(teamHTML);
    var playerDetailTemplate = Handlebars.compile(playerDetailHTML);

    el.innerHTML = mainTemplateParsed;

    $('.menu-button').each(function(menuButton){
        menuButton.addEventListener('click',function(e){
            currentTeam = menuButton.innerHTML;
            $('.menu-button').removeClass('active-team');
            $(menuButton).addClass('active-team');

            if(isMobile){
                $('#detail-overlay-container').removeClass('opened');
                $('#detail-overlay-container').attr('data-teamname', currentTeam);
                
                loadPlayers(currentTeam)
            }else{
                var teamEl = $('.team-container[data-teamname="'+ currentTeam +'"]');
                var teamOffset = teamEl.offset().top - 36;
                $('body').scrollTop(teamOffset)
            }  
        })
    });

    if(keyString.team){
        if(isMobile){
            loadPlayers(keyString.team);
        }else{
            loadPlayers("England");
        }
    }else{
        loadPlayers("England");
    }

    function scrollInit(){
        if(!isMobile){
          var els = document.querySelectorAll('.team-container[data-loaded="false"]');
          var windowHeight = window.innerHeight;
          window.addEventListener('scroll', function(e){
              for(var i=0;i<els.length;i++){
                  if(els[i].getBoundingClientRect().top < windowHeight * 3){
                      var teamName = els[i].getAttribute('data-teamname');
                      loadPlayers(teamName);
                      els[i].setAttribute('data-loaded','true');
                      els = document.querySelectorAll('.team-container[data-loaded="false"]');
                  }
              }
          });   
        }
        
    }

    function loadPlayers(teamName){
        var teamData = data.teams.filter((team) => team.teamName === teamName)[0];
        var teamEl = document.querySelector('.team-container[data-teamname="' + teamName + '"]');
        if(!isMobile){
            teamEl.setAttribute('data-loaded','true');
        }else{
            teamEl = document.querySelector('#teams-container')
        }
        
        reqwest({
            url: 'https://interactive.guim.co.uk/docsdata-test/' + dataSources[teamName] + '.json',
            type: 'json',
            crossOrigin: true,
            success: (resp) => {
                var playerData = resp.sheets.Players;
                var players = playerData.map(function(player,index){
                    player.image = player.name.replace(/\s/g,'_').replace(/\'/g,'') + ".jpg";
                    player.team = teamName;
                    player.specialty = player["special player? (eg. key player, promising talent, etc)"];
                    player.isSpecial = player.specialty ? true : false;
                    player.number = index;
                    
                    if(teamName === currentTeam && index === 0){
                        player.isActive = true;
                        currentActivePlayer = player;
                    }

                    return player
                })

                teamData.players = {
                    "Forwards": players.filter((player)=> player.position === "Forward" || player.position === "Forward (winger)"),
                    "Midfielders": players.filter((player)=> player.position === "Midfielder"),
                    "Defenders": players.filter((player)=> player.position === "Defender"),
                    "Goalkeepers": players.filter((player)=> player.position === "Goalkeeper")
                }
                
                var teamTemplateParsed = teamTemplate(teamData).replace(/%assetPath%/g,projectAssetpath);
                teamEl.innerHTML = teamTemplateParsed;

                addPlayerEvents(teamEl,teamName,teamData);
            }
        })
    }

    function addPlayerEvents(teamEl,teamName,teamData){
        $('.player-container',teamEl).each(function(playerEl){
            var playerName = playerEl.querySelector('.player-name').innerHTML;
            var teamName = playerEl.getAttribute('data-team');

            if(isMobile){
                playerEl.addEventListener('click',function(e){
                   openDetailContainer(playerName,teamName) 
                })
            }else{
                playerEl.addEventListener('mouseenter',function(e){
                    var playerData;
                    for(var key in teamData.players){
                        if(!playerData){
                            teamData.players[key].forEach(function(player){
                                if(player.name === playerName){
                                    playerData = player;
                                } 
                            });
                        }
                    };
                    
                    $('.player-container').removeClass('activePlayer')
                    $(playerEl).addClass('activePlayer')
                    createLine(playerEl,playerData);
                })  

            }
        });
        
        if(isMobile){
           var detailContainerHTML = '';
           for(var position in teamData.players){
               teamData.players[position].forEach(function(player){
                   var playerDetailTemplateRendered = playerDetailTemplate(player).replace(/%assetPath%/g,config.assetPath);
                   detailContainerHTML += playerDetailTemplateRendered; 
               })
           }

           $('#detail-overlay-container .detail-container')[0].innerHTML = detailContainerHTML; 
        }else{
            var activePlayerEl = $('.player-container.activePlayer')[0];
            createLine(activePlayerEl,currentActivePlayer);
        }
        
    }
    

    function openDetailContainer(playerName,teamName){
        var playerDetailEl = $('.detail-player-container[data-playername="' + playerName + '"]');
        var playerDetailOffset = playerDetailEl.offset().top;
        var parentContainerOffset = $('#detail-scroll-area').offset().top;
        var parentContainerScroll  = $('#detail-scroll-area').scrollTop();
        var oldOffset = parentContainerScroll;
        var newOffset = playerDetailOffset - parentContainerOffset + parentContainerScroll - 16;
        
        $(el).addClass('detail-panel-opened');
        $('#detail-overlay-container').addClass('opened');
        $('#detail-scroll-area').scrollTop(newOffset);
    }

    function createLine(pEl,playerData){
        var pOffset = $(pEl).offset().top;
        var pName = pEl.querySelector('.player-name').innerHTML;
        var playerChildEls = pEl.parentNode.parentNode.querySelectorAll('.player-container');
        var playerOffset = $(pEl).offset();
        var lineWidth = 10;
        var boxOffset = $('#detail-box-container').offset();
        var interactiveOffset = $('.interactive-container').offset();
        var diff = boxOffset.left - playerOffset.left - playerOffset.width - lineWidth;
        var playerIndex;

        for(var i=0; i<playerChildEls.length; i++){
            if(playerChildEls[i].getAttribute('data-player') === pName){
                playerIndex = i + 1;
            }
        }
        
        $('#line-container').css('top',playerOffset.top + (playerOffset.width/2))
        $('#line-container').css('left',playerOffset.left + playerOffset.width - interactiveOffset.left)
        $('#detail-box-container').css('top',pOffset + 'px');
        var playerDetailTemplateRendered = playerDetailTemplate(playerData).replace(/%assetPath%/g,config.assetPath);
        $('#detail-box-container')[0].innerHTML = playerDetailTemplateRendered;

        if(playerIndex < playerChildEls.length && playerIndex%4 !== 0){
            $('#player-line').css('width',lineWidth);
            $('#line-box').css('width',diff)
            $('#line-box').css('left',lineWidth)
            $('#line-box').css('height',(playerOffset.width/2) + lineWidth + 20)
        }else{
            $('#player-line').css('width',diff + lineWidth);
            $('#line-box').css({
                'width':0,
                'height':0
            })
        }
    }

    if(isMobile){
        $('#detail-overlay-container')[0].addEventListener('click',function(e){
            $(el).removeClass('detail-panel-opened');
            $('#detail-overlay-container').removeClass('opened')
        })
    }

    
    if(!isMobile){
        var activePlayerOffset = $('.activePlayer').offset().top;
        $('#detail-box-container').css('top',activePlayerOffset + 'px');
    }

    createSketches();
    scrollInit();
}


function createSketches(){
    var sketchContainer = $('#sketch-container');
    var projectDimensions = sketchContainer[0].getBoundingClientRect(); 
    var amount = (projectDimensions.height/150) + (projectDimensions.width/150);
    amount = amount > 180 ? 180 : amount;
    
    for(var i=0;i<amount;i++){
        var block = document.createElement('div');
        var offset = Math.round(Math.random()*20) * 150;
        block.className = "sketch-block";   
        block.style.backgroundPosition = "0 -" + offset + "px";
        block.style.top = Math.random()*projectDimensions.height + "px";
        block.style.left = Math.random()*(projectDimensions.width - 150) + "px";
        sketchContainer.append(block)
    }
}