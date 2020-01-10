// This is not the best code I wrote, but... you know, passion projects

const socket = io();

const mistery = document.getElementById('mistery');
const MistaryNameModal = document.getElementById('MistaryNameModal');
const waitingModal = document.getElementById('waitingModal');
const usersConnected = document.getElementById('usersConnected');

const divOne = document.getElementById('divOne');
const divTwo = document.getElementById('divTwo');
const divThree = document.getElementById('divThree');

const finalmodal = document.getElementById('finalmodal');
const finalmsn = document.getElementById('finalmsn');
const finalchar = document.getElementById('finalchar');

var personal;

socket.emit('new-user', roomName);
$('#MistaryNameModal').modal('show');


function registerOfNewPlayer() {
    // console.log("dsfsfds");
    socket.emit('add-mistery', roomName, mistery.value);
    mistery.value = "";
    $('#waitingModal').modal('show');
}

socket.on('user-connected', msg => {
    // One user is in the room
    // console.log(msg);
})

socket.on('state-mistery', count => {
    // console.log("Llego!!!");
    usersConnected.innerHTML = "Ready Users: " + count;
    if (count == 3) {
        $('#waitingModal').modal('hide');
        // socket.emit(socket.id, roomName);
        socket.emit('lets-play', roomName);
    }
})

socket.on('position', data => {
    personal = data;
    // console.log(personal);
    doStart();
    setTimeout(() => {
        if (personal.posi == 1) {

            where_make_questions.style.display = 'inline';
            make_questions.style.display = 'inline';
            hand.style.display = 'inline';

            two.innerHTML = personal.two;
            three.innerHTML = personal.three;
            divTwo.style.display = 'inline';
            divThree.style.display = 'inline';

        } else if (personal.posi == 2) {

            controls.style.display = 'inline';

            one.innerHTML = personal.one;
            three.innerHTML = personal.three;
            divOne.style.display = 'inline';
            divThree.style.display = 'inline';

        } else {

            controls.style.display = 'inline';

            one.innerHTML = personal.one;
            two.innerHTML = personal.two;
            divOne.style.display = 'inline';
            divTwo.style.display = 'inline';
        }
    }, 2000);
})

socket.on('get-question', data => {
    showMessage(data);
    btnYes.disabled = false; btnNo.disabled = false;
});

var iorder = true;

socket.on('get-yes', d => {
    if (iorder) {
        showAnsw(ANSyes);
        iorder = false;
    } else {
        showAnsw(ANSyes2);
        iorder = true;
        message.style.display = 'none';
    }
})

socket.on('get-no', d => {
    if (iorder) {
        showAnsw(ANSno2);
        iorder = false;
    } else {
        showAnsw(ANSno);
        iorder = true;
        message.style.display = 'none';
    }
})

socket.on('next-step', player => {
    if (player == personal.posi) {
        where_make_questions.style.display = 'inline';
        make_questions.style.display = 'inline';
        hand.style.display = 'inline';
        controls.style.display = 'none';
    } else {
        where_make_questions.style.display = 'none';
        make_questions.style.display = 'none';
        hand.style.display = 'none';
        controls.style.display = 'inline';
    }
    // alert(player);
    doAnimation();
})

socket.on('get-iknow', dat => {
    showAnsw(iknow);
})

socket.on('winner', (player, chars) => {
    if (player == personal.posi) {
        finalmsn.innerHTML = "VICTORY";
    } else {
        finalmsn.innerHTML = "GAME OVER";
    }
    var char = "Character: ";
    if (personal.posi == 1) {
        char += chars[2];
    }else if (personal.posi == 2) {
        char += chars[0];
    }else{
        char += chars[1];
    }
    finalchar.innerHTML = char;

    $('#finalmodal').modal('show');
})