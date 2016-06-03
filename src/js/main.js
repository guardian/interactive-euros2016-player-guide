import reqwest from 'reqwest'
import qwery from 'qwery'
import bonzo from 'bonzo'
import Handlebars from 'handlebars'
import detect from './lib/detect';
import share from './lib/share';

import mainHTML from './text/main.html!text'
import teamHTML from './text/teamPage.html!text'
import playerCircleHTML from './text/playerCircle.html!text'
import playerDetailHTML from './text/playerDetailPage.html!text'

var data = {};
var teams;
var currentTeam = "Albania";
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
    "Czech Republic":"1lMTejNFx6icnonGIi8kQ3W0NAIEW2mu9DUaGTHjZJWA",
    "Slovakia":"1mV-s921mm6J4ZYRWRLccuKbZTXIUGePE6T--eY_kAQA",
    "Hungary":"13PX3dUtmYOkjruakrseUoZoUfKcXIDPi9TsMT8WlX6M",
    "Iceland": "1jie0qY09f8AqezNJqnVXzRpQOd7EcA9xPsyjkRFzHto"
}
var masterTeamData = "1We0iF5KgHN0LlQjFn9C9onBrX1ovVJnsbTv9qTKBQn0";
var isAndroidApp = ( detect.isAndroid() && window.location.origin === "file://" ) ? true : false;
var now = new Date().getTime();

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

            resp.sheets.Teams.forEach(function(team,i){
                var players = [
                    {position:"Goalkeeper"},{position:"Goalkeeper"},{position:"Goalkeeper"},
                    {position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},{position:"Defender"},
                    {position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},{position:"Midfielder"},
                    {position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"},{position:"Forward"}
                ];

                data.teams.push({
                    "teamName": team.Team,
                    "teamNameLowercase": team.Team.toLowerCase(),
                    "group": team.Group,
                    "opponents":team.opponents,
                    "newGroup": (i) % 4 === 0 ? true : false,
                    "teamInfo": team,
                    "players":{
                        "Goalkeepers": players.filter((player)=> player.position === "Goalkeeper"),
                        "Defenders": players.filter((player)=> player.position === "Defender"),
                        "Midfielders": players.filter((player)=> player.position === "Midfielder"),
                        "Forwards": players.filter((player)=> player.position === "Forward" || player.position === "Forward (winger)")
                    },
                    "isActive": team.Team === currentTeam ? true : false
                })
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

    var quickNav = document.querySelector('#quicknav-container select');
    var optgroup;
    data.teams.forEach(function(team,i){
        if(i%4 === 0){
            optgroup = document.createElement('optgroup');
            optgroup.label = "Group " + team.group;
            quickNav.appendChild(optgroup);
        }
        var optionEl = document.createElement('option');
        optionEl.innerHTML = team.teamName;
        optgroup.appendChild(optionEl)
        // quickNav.appendChild(optgroup);
        
    })

    quickNav.addEventListener('change',function(e){
        currentTeam = e.target.value;
        $('.menu-button').removeClass('active-team');
        $('.menu-button[data-buttonname="' + currentTeam + '"]').addClass('active-team');
        if(isMobile){
            $('#detail-overlay-container').removeClass('opened');
            $('#detail-overlay-container').attr('data-teamname', currentTeam);
            
            loadPlayers(currentTeam);

            var pageOffset = $('#teams-container').offset().top - 36;
            $('body').scrollTop(pageOffset)
        }else{
            var teamEl = $('.team-container[data-teamname="'+ currentTeam +'"]');
            var teamOffset = teamEl.offset().top - 36;
            $('body').scrollTop(teamOffset)
        }  
    })

    if(keyString.team){
        if(isMobile){
            loadPlayers(keyString.team);
        }else{
            loadPlayers(currentTeam);
        }
    }else{
        loadPlayers(currentTeam);
    }

    function scrollInit(){
        var windowHeight = window.innerHeight;
        if(!isMobile){
          var els = document.querySelectorAll('.team-container[data-loaded="false"]');
          window.addEventListener( 'scroll', debounce(checkScrollHeight, 20) );
          
          function checkScrollHeight(){
              for(var i=0;i<els.length;i++){
                  if(els[i].getBoundingClientRect().top < windowHeight * 3){
                      var teamName = els[i].getAttribute('data-teamname');
                      loadPlayers(teamName);
                      els[i].setAttribute('data-loaded','true');
                      els = document.querySelectorAll('.team-container[data-loaded="false"]');
                  }
              }
          };   
        }

        var teamsContainer = document.querySelector('#teams-container');
        var quickNav = document.querySelector('#quicknav');
        var headerVisible = true;
        var reachedBottom = false;

        window.addEventListener( 'scroll', debounce(showQuicknav, 20) );

        function showQuicknav(){
            if(teamsContainer.getBoundingClientRect().top < 0 && headerVisible){
                headerVisible = false;
                quickNav.style.opacity = 1
                
            }else if(teamsContainer.getBoundingClientRect().top > 0 && !headerVisible){
                headerVisible = true;
                quickNav.style.opacity = 0
            }

            if(isMobile){
                var teamsContainerOffset = teamsContainer.getBoundingClientRect();
                if(teamsContainerOffset.bottom < windowHeight+40 && !reachedBottom){
                    reachedBottom = true;
                    quickNav.style.backgroundColor = "#ffbb00"
                }else if(teamsContainerOffset.bottom > windowHeight+40 && reachedBottom){
                    reachedBottom = false;
                    quickNav.style.backgroundColor = "#fff"
                }
            }
            
        }
        
    }

    function loadPlayers(teamName){
        var teamData = data.teams.filter((team) => team.teamName === teamName)[0];
        var teamEl = document.querySelector('.team-container[data-teamname="' + teamName + '"]');
        var teamContainerEl = document.querySelector('#teams-container');

        if(!isMobile){
            teamEl.setAttribute('data-loaded','true');
        }else{
            teamContainerEl.style.minHeight = "1200px"
            teamContainerEl.innerHTML = "Loading " + currentTeam
        }

        reqwest({
            url: 'https://interactive.guim.co.uk/docsdata-test/' + dataSources[teamName] + '.json',
            type: 'json',
            crossOrigin: true,
            success: (resp) => {
                var playerData = resp.sheets.Players;
                var foundActive = false;
                var players = playerData.map(function(player,index){
                    player.image = player.name.replace(/\s/g,'_').replace(/\'/g,'') + ".jpg";
                    player.team = teamName;
                    player.specialty = player["special player? (eg. key player, promising talent, etc)"];
                    player.isSpecial = player.specialty ? true : false;
                    player.number = index;
                    player.simpleName = player.name.trim().replace(/[^a-zA-Z 0-9.]+/g,'').replace(/ /g, '_').replace(/-/g, '');
                    var birthDate = player["date of birth"].split('/');
                    var formattedBirthdate = birthDate[2] + "/" + birthDate[1] + "/" + birthDate[0]
                    var unixBirthdate = new Date(formattedBirthdate).getTime();
                    player.age = Math.floor((((((now - unixBirthdate)/1000)/60)/60)/24)/365)

                    if(teamName === currentTeam && player.position === "Goalkeeper" && !foundActive){
                        player.isActive = true;
                        currentActivePlayer = player;
                        foundActive = true;
                    }

                    return player
                })

                teamData.players = {
                    "Goalkeepers": players.filter((player)=> player.position === "Goalkeeper"),
                    "Defenders": players.filter((player)=> player.position === "Defender"),
                    "Midfielders": players.filter((player)=> player.position === "Midfielder"),
                    "Forwards": players.filter((player)=> player.position === "Forward" || player.position === "Forward (winger)")
                }

                teamData.lazyload = true;
                
                var teamTemplateParsed = teamTemplate(teamData).replace(/%assetPath%/g,projectAssetpath);
                
                if(!isMobile){
                    var tempHTMLHolder = document.createElement('div')
                    tempHTMLHolder.innerHTML = teamTemplateParsed;
                    var tempInnerHTML = tempHTMLHolder.querySelector('.team-container').innerHTML;

                    teamEl.innerHTML = tempInnerHTML;
                }else{
                    teamContainerEl.innerHTML = teamTemplateParsed;
                    teamContainerEl.querySelector('.team-container').setAttribute('data-loaded','true');
                }
                
                addPlayerEvents(teamName,teamData);
            }
        })
    }

    function addPlayerEvents(teamName,teamData){
        var teamEl = document.querySelector('.team-container[data-teamname="' + teamName + '"]');
        $('.player-container',teamEl).each(function(playerEl){
            var playerName = playerEl.querySelector('.player-name .player-name-span').innerHTML;


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
        var detailContainerEl = document.querySelector('#detail-overlay-container');
            detailContainerEl.setAttribute('data-loaded','true');
            detailContainerEl.setAttribute('data-teamname',teamName);

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
        var pName = pEl.querySelector('.player-name .player-name-span').innerHTML;
        var pOffset = $(pEl).offset().top;
        var projectOffset = $('#sketch-container').offset().top;
        var playerChildEls = pEl.parentNode.parentNode.querySelectorAll('.player-container');
        var elPosition = pOffset - projectOffset;
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

        $('#line-container').css('top',elPosition + (playerOffset.width/2))
        $('#line-container').css('left',playerOffset.left + playerOffset.width - interactiveOffset.left)
        $('#detail-box-container').css('transform','translateY(' + elPosition + 'px)');
        var playerDetailTemplateRendered = playerDetailTemplate(playerData).replace(/%assetPath%/g,config.assetPath);
        $('#detail-box-container')[0].innerHTML = playerDetailTemplateRendered;
        $('#detail-box-container').attr('data-teamname',playerData.team)

        var totalOffset = elPosition + $('#detail-box-container').offset().height;
        var teamContainerHeight = $('#sketch-container').offset().height;
        var isOffscreen = totalOffset > teamContainerHeight;
        
        if(isOffscreen){
            var updatedOffset = teamContainerHeight - $('#detail-box-container').offset().height - 40;
            $('#detail-box-container').css('transform','translateY(' + updatedOffset + 'px)');
        }

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

    var shareButtons = document.querySelectorAll('#share-buttons button');
    var shareMessage = "The Guardian's complete guide to Euro 2016 - every team and player";
    var shareUrl = "http://gu.com/p/4jzpk";
    var shareModal = share(shareMessage, shareUrl);

    for(var i=0; i<shareButtons.length; i++){
        shareButtons[i].addEventListener('click',function(e){
            var network = e.target.className.replace('share-','');
            
            shareModal(network);
        })
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
    setTimeout(createSketches,1000);
    
    scrollInit();

    
    if(window.guardian){
        if(detect.isIOS() && window.guardian.config.page.buildNumber == undefined){
            var detailEl = document.querySelector('#detail-overlay-container');
            detailEl.style.top = "-40px";
            detailEl.style.paddingTop = "40px";
        }
    }

    if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
        var menuEl = document.querySelector('#teams-menu');
        var detailEl = document.querySelector('#detail-overlay-container');

        menuEl.addEventListener("touchstart", function(){
            window.GuardianJSInterface.registerRelatedCardsTouch(true);
        });
        menuEl.addEventListener("touchend", function(){
            window.GuardianJSInterface.registerRelatedCardsTouch(false);
        });

        detailEl.addEventListener("touchstart", function(){
            window.GuardianJSInterface.registerRelatedCardsTouch(true);
        });
        detailEl.addEventListener("touchend", function(){
            window.GuardianJSInterface.registerRelatedCardsTouch(false);
        });
    }
}


function createSketches(){
    var sketchContainer = $('#sketch-container');
    var projectDimensions = sketchContainer[0].getBoundingClientRect(); 

    var gridX = Math.floor(projectDimensions.width/150);
    var gridY = Math.round(projectDimensions.height/150);

    for(var x=0; x<gridX; x++){
        for(var y=0; y<gridY; y++){
            var chance = 0.1;
            if(!isMobile){
                if(gridX - x < 2 || x === 0){
                    chance = 0.2;
                }
            }else{
                chance = 0.2;
            }
            
            if(Math.random()<chance){
                var block = document.createElement('div');
                var offset = Math.round(Math.random()*20) * 150;
                block.className = "sketch-block"; 
                block.style.top = (y * 150) + "px";
                block.style.left = (x * 150) + "px";
                block.style.backgroundPosition = "0 -" + offset + "px";
                sketchContainer.append(block)
            }
            
        }
    }
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) { func.apply(context, args); }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) { func.apply(context, args); }
    };
}