var ready = false;
var socket = io();
var myId;
var sellect = [];

function gen(users, hands) {
	var cardds = '';
	for (j = 0; j < users[i][1].length; j++) {
		cardds = cardds + "<li id='"+users[i][1][j]+"'onclick='handleClick(\""+users[i][0]+"\", \""+users[i][1][j]+"\")'>" + users[i][1][j] + "</li>";
	}
	$('#MCards').append('<lu id="'+users[i][0]+'">'+users[i][2]+"'s cards:"+cardds+'</lu>');
	
}


function clearDiv(id){
var list = document.getElementById(id);
	while (list.hasChildNodes()) {  
		list.removeChild(list.firstChild);
	}
}

function reFre(users,hands){
	
	if(ready){
		clearDiv("MCards");
		clearDiv("deck");
		var han ='';
		//only show top card if mode 1
		if (hands[2] == 0){
			for (j = 0; j < hands[1].length; j++) {
				han = han + "<li id='"+hands[1][j]+"' onclick='handleClick(\"dis\",\""+hands[1][j]+"\")'>" + hands[1][j] + "</li>";
			}
		}
		else {
			han = "<li id='"+hands[1][0]+" onclick='handleClick(\"dis\",\""+hands[1][0]+"\")'>" + hands[1][0] + "</li>";
		}
		$('#MCards').append("<lu id=\"discard\">discard:"+han+'</lu>');
		$('#deck').append("cards in the Deck: "+hands[3]);


		for (i = 0; i < users.length; i++){
			if ( hands[0]){
				gen(users,hands);	
			}
			else{
				if(users[i][0]==myId){
					gen(users,hands);
				}
			}
		}
	}
}

function handleClick( id, card){
	console.log(id+card)
	if (id==myId){
		var butt = document.getElementById("dis");
		if (butt.innerText != "Discard selected cards"){
			butt.innerText = "Discard selected cards";
			var myCar = document.getElementById("discard");
			for (i = 0; i < myCar.children.length; i++) {
				myCar.children[i].style.backgroundColor = "white";
			}
			sellect = [];
		}
		
		if (sellect.includes(card)) {
			
			butt.innerText = "Discard selected cards";
			for (v = 0; v < sellect.length; v++) {
				if (sellect[v]==card){						
					sellect.splice(v,1);
					
				}
			}
			var elle = document.getElementById(card);
			elle.style.backgroundColor = "white";
		}
		else {
			var elle = document.getElementById(card);
			elle.style.backgroundColor = "skyblue";
			sellect.push(card);
		}
	}	
	else if(id=="dis"){
		var butt = document.getElementById("dis");
		if (butt.innerText!="Take sellected cards from discard"){
			butt.innerText = "Take sellected cards from discard";
			var myCar = document.getElementById(myId);
			for (i = 0; i < myCar.children.length; i++) {
				myCar.children[i].style.backgroundColor = "white";
			}
			sellect =[];
		}
		if (sellect.includes(card)) {
			for (v = 0; v < sellect.length; v++) {
				if (sellect[v]==card){						
					sellect.splice(v,1);
					
				}
			}
			var elle = document.getElementById(card);
			elle.style.backgroundColor = "white";
		}
		else {
			var elle = document.getElementById(card);
			elle.style.backgroundColor = "skyblue";
			sellect.push(card);
		}
	}
}

function addButton(parentId, fun, html, idd) {
	// Adds an element to the document
	var p = document.getElementById(parentId);
	var newElement = document.createElement("button");
	newElement.setAttribute('onclick', fun);
	newElement.setAttribute('id', idd);
	newElement.innerHTML = html;
	p.appendChild(newElement);
}
function addSwitch(parentId, fun, html) {
	// Adds an element to the document
	var p = document.getElementById(parentId);
	var lab = document.createElement("label");
	var swi =document.createElement("input");
	var spn =document.createElement("span");
	lab.setAttribute('class', "switch");
	swi.setAttribute('type', "checkbox");
	spn.setAttribute('class', "slider");
	swi.setAttribute('onclick', fun);
	p.appendChild(lab);
	lab.appendChild(swi);
	lab.appendChild(spn);
	var j = document.createElement("div");
	var t = document.createTextNode(html); 	    // Create a text node
	j.appendChild(t); 
	p.appendChild(j); 
}
$('#nae').submit(function(e){
	e.preventDefault(); // prevents page reloading
	
	socket.emit('Username', $('#m').val());
	$('#m').val('');

	return false;
});

$('#nRoom').submit(function(e){
	e.preventDefault(); // prevents page reloading
	
	socket.emit('changeRoom', $('#g').val());
	var ro = $('#g').val();
	$('#g').val('');
	var element = document.getElementById("myRoom");
	element.innerHTML = "You are in the "+ ro + " room";
	return false;
});

$('#sendChat').submit(function(e){
	e.preventDefault(); // prevents page reloading
	socket.emit('chat message', $('#rr').val());
	$('#rr').val('');
	return false;
});

socket.on('ready', function(users,hands){
	
	ready = true;
	var element = document.getElementById("myRoom");
	element.innerHTML = "You are in the default room";
	element = document.getElementById("nae");
	element.parentNode.removeChild(element);
	myId = users[users.length-1][0]
	addButton("buttons","draw()","Draw","DrawW");
	addButton("buttons","shuff()","Shuffle","Shuffle");
	addButton("buttons","discard()","Discard selected cards","dis");
	addButton("buttons","discardToDeck()","Move the discard pile to the back of the deck","discardToDeck");
	addSwitch("switches","changeDiscardMode()","Change the discard mode","discardTogle");
	addSwitch("switches","hidHands()","Hide/Show Other Peoples Hands","oHand");
	addSwitch("switches","showInfo()","Show Info","showingoooo");
	document.getElementById("chat").style.display= "block";
	document.getElementById("nRoom").style.display = "block";
	document.getElementById("switches").style.display = "block";
	reFre(users,hands);	
});

function shuff() {
	socket.emit('shuff');
}
function showInfo() {
	document.getElementById("").style.display= "block";
}
function discardToDeck() {
	socket.emit('discardToDeck');
}
function discard(){
	var butt = document.getElementById("dis");
	if (butt.innerText=="Take sellected cards from discard"){
		socket.emit('discard',sellect,false);
	}
	else {
		socket.emit('discard',sellect,true);
	}
	
	sellect = [];
}
function draw() {
	socket.emit('draw');
}
function hidHands() {
	socket.emit('hidHands');
}
function changeDiscardMode() {
	socket.emit('changeDiscardMode');
}

socket.on('chat message', function(msg){
	$('#messages').append($('<li class="chatMess">').text(msg));
});

socket.on('seeDeck', function(msg){
	$('#MCards').append(msg);
});

socket.on('leaveUser', function(users, h){
	reFre(users, h)
	
});

socket.on('hidHands', function(users, h){
	reFre(users, h)
});

socket.on('newUser', function(users, h){
	reFre(users, h)
	
});

socket.on('draw', function(users, h){
	
	reFre(users,h)
});
