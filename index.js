var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var hands = [[true, [], 0, 52, []]];
var rooms = ["default"];
var deck = [[]];

var users = [[]];

function deckSize(rN){
	hands[rN][3] = deck[rN].length+1;
	return(deck[rN].length+1);
}

function createDeck(loc){
	for (i = 0; i < 51; i++) {
		if (i ==0){
			deck[loc].push('A');
		}
		else if ((i%13)<10) {
			deck[loc].push(((i%13)+1).toString());
		}
		else {
			switch((i%13)-10){
				case 0:
					deck[loc].push('J');
					break;
				case 1:
					deck[loc].push('Q');
					break;
				case 2:
					deck[loc].push('K');
					break;
			}
		}
		switch(Math.floor(i/13)){
			case 0:
				deck[loc][i] += "H";
				break;
			case 1:
				deck[loc][i] += "C"
				break;
			case 2:
				deck[loc][i] += "D"
				break;
			case 3:
				deck[loc][i] += "S"
				break;
		}
	}
}
createDeck(0);
function arrayRemove(us, value, rN) { 
	us[rN]
	for (i = 0; i < us[rN].length; i++) {
		if (us[rN][i][0]==value){	
			deck[rN] = deck[rN].concat(us[rN][i][1]);
			var k = us[rN][i][2];
			us[rN].splice(i,1)
			return(k)
		}
	}
	deckSize(rN);
}


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});
app.get('/main.js', function(req, res){
  res.sendFile(__dirname + '/main.js');
});
app.get('/switch.css', function(req, res){
  res.sendFile(__dirname + '/switch.css');
});
io.on('connection', function(socket){
	socket.join('default');
	var roomNum=0;
	console.log('a user connected');
	
	console.log(socket.id)
	

  socket.on('disconnect', function(){
    console.log('user disconnected');
		
		arrayRemove(users, this.id, roomNum);
		deckSize(roomNum);

		io.to(rooms[roomNum]).emit('leaveUser', users[roomNum],hands[roomNum])
  });

	socket.on('Username', function(username){
		users[roomNum].push([socket.id,[]])
		for (i = 0; i < users[roomNum].length; i++) {
			if (users[roomNum][i][0]==this.id){
				users[roomNum][i].push(username)
			}
			
		}
		io.to(this.id).emit('ready', users[roomNum], hands[roomNum])
		io.to(rooms[roomNum]).emit('newUser', users[roomNum],hands[roomNum])
  });

	socket.on('chat message',  function(msg){
		var sendersName = 'unset';

		for (i = 0; i < users[roomNum].length; i++) {
			console.log(users[roomNum][i][0]+this.id);
			if (users[roomNum][i][0]==this.id){
				sendersName = users[roomNum][i][2];
			}
		}
		hands[roomNum][4] += sendersName + " said: " + msg;
    io.to(rooms[roomNum]).emit('chat message',sendersName + " said: " + msg);
  });

	socket.on('changeRoom', function(newRoom){
		username= arrayRemove(users, this.id, roomNum);
		deckSize(roomNum);
		socket.leave(rooms[roomNum]);
		io.to(rooms[roomNum]).emit('leaveUser', users[roomNum],hands[roomNum])
		if (!rooms.includes(newRoom)){
			rooms.push(newRoom);
			roomNum = rooms.length-1;
			socket.join(newRoom);
			users.push([]);
			deck.push([]);
			hands.push([true, [], 0, 52, []]);
			createDeck(roomNum);
		}
		else {
			for (i = 0; i < rooms.length; i++) {
				if (rooms[i]==newRoom)	{
					roomNum = i;
					socket.join(newRoom);
				}		
			}
		}
		users[roomNum].push([socket.id,[]])
		for (i = 0; i < users[roomNum].length; i++) {
			if (users[roomNum][i][0]==this.id){
				users[roomNum][i].push(username)
			}
			
		}
		io.to(rooms[roomNum]).emit('newUser', users[roomNum],hands[roomNum])
  });

	socket.on('discard', function(discard,theirC){
		if (theirC){
			for (i = 0; i < users[roomNum].length; i++) {
				if (users[roomNum][i][0]==this.id){

					hands[roomNum][1]=discard.concat(hands[roomNum][1]);
					for (g = 0; g < discard.length; g++) {
						if (users[roomNum][i][1].includes(discard[g])){
							users[roomNum][i][1].splice(users[roomNum][i][1].indexOf(discard[g]),1);
						}
					}
					io.to(rooms[roomNum]).emit('newUser', users[roomNum],hands[roomNum])
				}		
			}
		}
		else{
			for (i = 0; i < users[roomNum].length; i++) {
				if (users[roomNum][i][0]==this.id){
					users[roomNum][i][1]= discard.concat(users[roomNum][i][1]);
					for (g = 0; g < discard.length; g++) {
						if (hands[roomNum][1].includes(discard[g])){
							hands[roomNum][1].splice(hands[roomNum][1].indexOf(discard[g]),1);
						}
					}
					io.to(rooms[roomNum]).emit('newUser', users[roomNum],hands[roomNum])
				}		
			}
		}
		
  });
	socket.on('discardToDeck', function(){
		deck[roomNum] = deck[roomNum].concat(hands[roomNum][1]);
		hands[roomNum][1] = [];
		deckSize(roomNum);
		io.to(rooms[roomNum]).emit('hidHands',users[roomNum],hands[roomNum]);
  });
  socket.on('draw', function(){
		for (i = 0; i < users[roomNum].length; i++) {
			if (users[roomNum][i][0]==this.id){
				users[roomNum][i][1].push(deck[roomNum][0])
			}
		}
		deck[roomNum].splice(0, 1);
		deckSize(roomNum);
		io.to(rooms[roomNum]).emit('draw',users[roomNum],hands[roomNum]);
  });

	socket.on('hidHands', function(){
		if (hands[roomNum][0] == true) {
			hands[roomNum][0] = false;
		}
		else {
			hands[roomNum][0] = true;
		}
		console.log(rooms);
		console.log(rooms[roomNum]);
		
		io.to(rooms[roomNum]).emit('hidHands',users[roomNum],hands[roomNum]);
  });

	socket.on('shuff', function(){
		for(let i = deck[roomNum].length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * i)
			const temp = deck[roomNum][i]
			deck[roomNum][i] = deck[roomNum][j]
			deck[roomNum][j] = temp
		}
  });

	socket.on('changeDiscardMode', function(){
		hands[roomNum][2] = (hands[roomNum][2] + 1)%2
		console.log(hands[roomNum][2]);
		
		io.to(rooms[roomNum]).emit('hidHands',users[roomNum],hands[roomNum]);
  });
	socket.on('discardToDeck', function(){
		deck[roomNum] = deck[roomNum].concat(hands[roomNum][1]);
		hands[roomNum][1] = [];
		deckSize(roomNum);
		io.to(rooms[roomNum]).emit('hidHands',users[roomNum],hands[roomNum]);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});