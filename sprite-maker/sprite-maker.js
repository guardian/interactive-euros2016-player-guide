var fs = require('fs-extra');
var nsg = require('node-sprite-generator');
var curl = require('curlrequest');



var sheets;
var input_folder = 'players/';
var output_folder = 'output/';
var sprites = 'sprites/';
var sprite_imgs = sprites + 'img';
var sprite_css = sprites + 'css';

var data_folder = 'team_data'

var final_src = '../src/';
var final_css = final_src + 'css/teams/';
var final_imgs = final_src + 'assets/imgs/teams/';

var team;
var action;


var team_data = {
	// 'Germany': { 'key' : '1i4gM_GeUfoSvBXRHEpFAhgz3UHJukeLqxBiGwZtMKfc'}, 
	// 'Hungary': { 'key' : '13PX3dUtmYOkjruakrseUoZoUfKcXIDPi9TsMT8WlX6M'},
	// 'Iceland': { 'key' : '1jie0qY09f8AqezNJqnVXzRpQOd7EcA9xPsyjkRFzHto'},
	// 'Ukraine': { 'key' : '1ddJ0CvPm23g1AB3iK7jRmzqh5f5xGTiunhEmvg7t-aY'},
	// 'Republic of Ireland': { 'key' : '12dGYUtIkVrYRw-e0Ht_sjCXxC3qFcoe4ge7iXtKHE6E'},
	// 'Northern Ireland': { 'key' : '1bD63bY4jeYtUVg9KFlKRa8C87hHQYKvlYXAxyc-5IMY'},
	// 'Croatia': { 'key' : '1hyDiy7WOTsZar11Z7JQW9F249rKfwjY7pc7uwFdzs7g'},
	// 'Austria': { 'key' : '1I-Z57rFkvo3fIuh5W3ASAq2d3OCujL_PqPEWrZVA-0Q'},
	// 'Czech Republic': { 'key' : '1lMTejNFx6icnonGIi8kQ3W0NAIEW2mu9DUaGTHjZJWA'},
	// 'Poland': { 'key' : '13BT44qfZatoB-QqqKOB3jgea8cUQiMb3DpIDIT4kvRw'},
	// 'Portugal': { 'key' : '1Tr7SbOKabNyj7-NPsqV-1PnrNlPH46KrZSMev76Mw3s'},
	// 'Belgium': { 'key' : '1Yh-6uphNjJSbjbXhlzfl8SiYl-w6cTvk51_A_vr9sjE'},
	// 'Spain': { 'key' : '14dG-Or6_BhOJQBPcgzQktd6T0w1m93VPYmCEjr-FqMU'},
	// 'Italy': { 'key' : '1UkRPDfrRNOkyIazXFWERCchz9pU1hu7g7wmTRjywBMM'},
	// 'Slovakia': { 'key' : '1mV-s921mm6J4ZYRWRLccuKbZTXIUGePE6T--eY_kAQA'},
	// 'Russia': { 'key' : '1dX0AiX3fwQbKrq4KNGCK44ek_g-cUgPao1O_UQJ6e5Y'},
	// 'Romania': { 'key' : '18oqBD3hE61x-7T_UkNMytIK12vDPSeeVYjm5e7afgqM'},
	// 'Turkey': { 'key' : '1T976zQpp_kp4wCtZOCw8vDe8l5GQBJDRARaWcFGmFb4'}, 
	// 'Switzerland': { 'key' : '1ff7gCcNTzEdAbFrFsCIBECneskzX-xjjU8ZpsEhJsj8'},
	// 'Albania': { 'key' : '1UPpqsr7WEwnL7sKX3sT2CoJqVAj_JN-M0UZMJpp85-g'},
	// 'Sweden': { 'key' : '1Fl2BMqcD70ArTn9BCA0i-DTs4kGePKYY9SXcDhcFdcI'}, 
	'Wales': { 'key' : '1o8MdeEpwI1NQsk7rgVx6qQDhjhjt4foxK1c--tB3DoU'},
	// 'France': { 'key' : '1KAJtvbQhvsvZ2ssIY2_7qiLuOYSmFCJ1E_1eQ0ETLas'},
	// 'England': { 'key' : '1Zsw-NAT-8xtXSQ8t-X3eyisqJPv4G-qFFHvmZ1ej0fw'}	
}




//sheets = fs.readJsonSync('data.json', 'utf8').sheets;

// sheets = fs.readFile('data.json', 'utf-8', function(err, data ) {
//    console.log( data );
// });

function init(){

	process.argv.forEach(function (val, index, array) {
	  if(index == 2) { action = val };
	});	



	if(action == 'fetch'){
		fetchData();
		rewriteFileNames();
	} else if(action == 'create') {
		makeImages();
	}
}

function fetchData(){

	fs.emptyDirSync( data_folder );

	var base = __dirname;

	for( team in team_data){

		//console.log(team)
		var url = 'https://interactive.guim.co.uk/docsdata-test/' + team_data[team].key + '.json';

		curlData(url, team);
		
	}
}

function curlData(url, team){

	curl.request( {url: url}, function (err, data) {
		console.log(team)
		fs.writeFileSync(data_folder + '/' + team.replace(/ /g, '_') + '.json', data); 

	});
}

function rewriteFileNames(){

	//re-write the files names
	fs.emptyDirSync(output_folder, function (err) { })
	fs.emptyDirSync( sprite_imgs );
	fs.emptyDirSync( sprites + '/css');

	//rename files
	var base = __dirname;
	var items = [] // files, directories, symlinks, etc 
	fs.walk(input_folder)
	  .on('data', function (item) {

	  	if(item.stats.isFile()){
	  		items.push(item.path.replace(base + '/', ''))
	  	}
	    
	  })
	  .on('end', function () {
		   // console.dir(items) // => [ ... array of files] 
		    items.forEach(function(f){

		    	var new_file = f.split('/');

		    	new_file[new_file.length - 1] = new_file[new_file.length - 1]
										    	.replace(/å/g, '')
										    	.replace(/ä/g, '')
		    									.replace(/é/g, '')
		    									.replace(/è/g, '')
		    									.replace(/ë/g, '')
		    									.replace(/î/g, '')
		    									.replace(/í/g, '')
		    									.replace(/ü/g, '')
		    									.replace(/Ö/g, '')
		    									.replace(/ö/g, '')
		    									.replace(/ø/g, '')
		    									.replace(/ç/g, '')
		    									.replace(/Ç/g, '')
		    									.replace(/ /g, '')
		    									.replace(/'/g, '')
		    									.replace(/-/g, '');



		    	new_file = new_file.join('/')
		    	
		    	if( new_file != f){
		    		//console.log(new_file, f)
		    		fs.copySync(f, new_file );
		    	}
		    	
		    })
	  })
}








function makeImages(){


	for( team in team_data){


			var players = fs.readJsonSync( data_folder + '/' + team.replace(/ /g, '_') +  '.json', 'utf-8').sheets.Players
			createTeam(team, players);

	}
	


	
}


function createTeam(team, players){

	console.log('creates team: ' + team)

	//console.log(team, players)
	var orig_src = input_folder + team + '/';
	var src = output_folder + team + '/orig/';



	fs.emptyDirSync( src );



	//create folder


	players.forEach(function(p, i){
		//console.log(p.name)

		var file = p.name.trim().replace(/[^a-zA-Z 0-9.]+/g,'').replace(/ /g, '_').replace(/-/g, '')

		//console.log('file' + file)


		if( fs.existsSync(orig_src + file + '.jpg') ){
			fs.copySync(orig_src + file + '.jpg', src + file + '.jpg', { clobber: true} );
		} else {
			console.log( 'FAILED TO FIND IMAGE: ' + team + '   ' +file )
		}
		
	})




	makeTeamSprite(team, players, 180, src, function(){
		makeTeamSprite(team, players, 240, src, function(){
			makeTeamSprite(team, players, 260, src);
		});
	});
	
	

}

function makeTeamSprite(team, players, size, src, callback){

	var orig_width = 400;
	var multiplier_width = size / 400;

	var css_path = 'sprites/css/' + team + '-' + size + '.css';
	var img_path = 'sprites/img/' + team + '-' + size + '.jpg';

	nsg({
	    src: [
	        src + '/*.jpg'
	    ],
	    spritePath: img_path,
	    stylesheet: 'prefixed-css',
	    stylesheetPath: css_path,
	    layout: 'packed',
	    compositor: 'gm',
	    compositorOptions: {
			compressionLevel: 6
		},
	    layoutOptions: {
	        scaling: multiplier_width

	    },
	    stylesheetOptions: {
	    	pixelRatio : 2
	    }
	}, function (err) {
	    console.log(err);
	    	if(callback){
	    		callback();
	    	}

			fs.readFile(css_path, 'utf8', function (err,data) {
			  if (err) {
			    return console.log(err);
			  }
			  var result = data.replace('../img/', 'assets/imgs/teams/');

			  fs.writeFile(css_path, result, 'utf8', function (err) {
			     if (err) return console.log(err);

			     moveIntoPlace( css_path, img_path, team + '-' + size );
			  });
			});
	    	
	    	
	});
		

}

function moveIntoPlace(css_path, img_path, filename){
	
	try {
	  fs.copySync(css_path , final_css + filename + '.scss')
	  console.log("success!" + filename + ' css');
	} catch (err) {
		if(err){
			console.error(err)
		}
	  
	}

	try {
	  fs.copySync(img_path , final_imgs + filename + '.jpg')
	  console.log("success:" + filename + ' jpg');
	} catch (err) {
		if(err){
			console.error(err)
		}
	  
	}



}



init();

