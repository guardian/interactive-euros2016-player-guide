import reqwest from 'reqwest'
import qwery from 'qwery'
import bonzo from 'bonzo'
import Handlebars from 'handlebars'

import mainHTML from './text/main.html!text'
import teamHTML from './text/teamPage.html!text'
import playerDetailHTML from './text/playerDetailPage.html!text'

var data = {};
var teams;
var currentTeam = "England";
var windowWidth = window.innerWidth;
var isMobile = windowWidth < 980 ? true : false;
var onStart = true;

function $(selector){
    return bonzo(qwery(selector));
}

export function init(el, context, config, mediator) {
    reqwest({
        url: 'https://interactive.guim.co.uk/docsdata-test/10WUlJVnZ23A1JmMESn7sOGm0s3WwKHynz-ptV_8b8uQ.json',
        type: 'json',
        crossOrigin: true,
        success: (resp) => {
            data.teams = [];
            data.isMobile = isMobile;

            resp.sheets.Teams.forEach(function(team){
                var players = resp.sheets[team.Team];

                if(players){
                    players = players.map(function(player,index){
                        player.x = Math.round(Math.random()*20);
                        player.y = Math.round(Math.random()*20);
                        player.image = player.name.replace(/\s/g,'_').replace(/\'/g,'') + ".jpg";
                        player.team = team.Team;
                        player.specialty = player["special player? (eg. key player, promising talent, etc)"];
                        player.isSpecial = player.specialty ? true : false;
                        
                        if(team.Team === currentTeam && index === 0){
                            player.isActive = true;
                        }

                        return player
                    })
                }else{
                    players = [];
                }

                data.teams.push({
                    "teamName": team.Team,
                    "teamInfo": team,
                    "players":{
                        "Forwards": players.filter((player)=> player.position === "Forward" || player.position === "Forward (winger)"),
                        "Midfielders": players.filter((player)=> player.position === "Midfielder"),
                        "Defenders": players.filter((player)=> player.position === "Defender"),
                        "Goalkeepers": players.filter((player)=> player.position === "Goalkeeper")
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
    Handlebars.registerPartial('playerDetailPage',playerDetailHTML);

    var mainTemplate = Handlebars.compile(mainHTML);
    var mainTemplateParsed = mainTemplate(data).replace(/%assetPath%/g,config.assetPath);
    var teamTemplate = Handlebars.compile(teamHTML);
    var playerDetailTemplate = Handlebars.compile(playerDetailHTML);

    el.innerHTML = mainTemplateParsed;

    console.log(data);

    $('.menu-button').each(function(menuButton){
        menuButton.addEventListener('click',function(e){
            currentTeam = menuButton.innerHTML;
            $('.menu-button').removeClass('active-team');
            $(menuButton).addClass('active-team');

            if(isMobile){
                $('#detail-overlay-container').removeClass('opened');
                $('#detail-overlay-container').attr('data-teamname', currentTeam);
                
                var teamData = data.teams.filter((team) => team.teamInfo.Team === currentTeam)[0];
                var teamTemplateRendered = teamTemplate(teamData).replace(/%assetPath%/g,config.assetPath);
                var detailContainerHTML = '';

                $('#teams-container')[0].innerHTML = teamTemplateRendered;
                
                for(var position in teamData.players){
                    teamData.players[position].forEach(function(player){
                        var playerDetailTemplateRendered = playerDetailTemplate(player).replace(/%assetPath%/g,config.assetPath);
                        detailContainerHTML += playerDetailTemplateRendered; 
                    })
                }

                $('#detail-overlay-container .detail-container')[0].innerHTML = detailContainerHTML;
                
                $('.player-container').each(function(playerEl){
                    var playerName = playerEl.querySelector('.player-name').innerHTML;
                    var teamName = playerEl.getAttribute('data-team');
                    playerEl.addEventListener('click',function(e){
                       openDetailContainer(playerName,teamName) 
                    })
                });
            }else{
                var teamEl = $('.team-container[data-teamname="'+ currentTeam +'"]');
                var teamOffset = teamEl.offset().top - 36;
                $('body').scrollTop(teamOffset)
            }
            
            
        })
    });

    $('.player-container').each(function(playerEl){
        var playerName = playerEl.querySelector('.player-name').innerHTML;
        var teamName = playerEl.getAttribute('data-team');

        if(isMobile){
            playerEl.addEventListener('click',function(e){
               openDetailContainer(playerName,teamName) 
            })
        }else{
            playerEl.addEventListener('mouseenter',function(e){
                var teamData = data.teams.filter((team) => team.teamInfo.Team === teamName)[0];
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
                var playerDetailTemplateRendered = playerDetailTemplate(playerData).replace(/%assetPath%/g,config.assetPath);
                var playerOffset = $(playerEl).offset().top;

                $('#detail-box-container')[0].innerHTML = playerDetailTemplateRendered;
                $('#detail-box-container').css('top',playerOffset + 'px');
                $('.player-container').removeClass('activePlayer')
                $(playerEl).addClass('activePlayer')
                createLine(playerOffset,playerEl,playerName)
            })  

        }
    });

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

    function createLine(pOffset,pEl,pName){
        var playerChildEls = pEl.parentNode.parentNode.querySelectorAll('.player-container');
        var playerOffset = $(pEl).offset();
        var lineWidth = 30;
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

        if(playerIndex < playerChildEls.length && playerIndex%3 !== 0){
            $('#player-line').css('width',lineWidth);
            $('#line-box').css('width',diff)
            $('#line-box').css('height',(playerOffset.width/2) + lineWidth + 10)
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
}