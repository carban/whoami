const controls = document.getElementById('controls');
const make_questions = document.getElementById('makeQuestions');
const where_make_questions = document.getElementById('where_make_questions');
const hand = document.getElementById('hand');

const one = document.getElementById('one');
const two = document.getElementById('two');
const three = document.getElementById('three');
const message = document.getElementById('message');
const Mess = document.getElementById('Mess');

const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');

const ANSyes = document.getElementById('ANSyes');
const ANSno = document.getElementById("ANSno");
const ANSyes2 = document.getElementById('ANSyes2');
const ANSno2 = document.getElementById("ANSno2");

const iknow = document.getElementById("iknow");

const lecards = document.getElementById("lecards");
const papers = document.getElementById("papers");
// const timer = document.getElementById("timer");

function showMessage(question) {
    message.style.display = 'inline';
    Mess.innerHTML = question;
    make_questions.value = "";
    setTimeout(function () { message.style.display = 'none'; }, 3000);
}

make_questions.addEventListener("keyup", e => {
    if (e.keyCode == 13) {
        e.preventDefault();
        socket.emit('set-question', roomName, make_questions.value);
        clearInterval();
        showMessage(make_questions.value);
        where_make_questions.style.display = 'none';
        make_questions.style.display = 'none' //for phone keyboard
        hand.style.display = 'none';
    }
});

function showAnsw(ele) {
    ele.style.display = 'inline';
    setTimeout(function () { ele.style.display = 'none'; }, 1500);
}

function openYes() {
    socket.emit('say-yes', roomName, 'y');
    showAnsw(ANSyes);
    btnYes.disabled = true; btnNo.disabled = true;
    // setTimeout(function(){ btnYes.disabled = false; btnNo.disabled = false; }, 1500);
}

function openNo() {
    socket.emit('say-no', roomName, 'n');
    showAnsw(ANSno2);
    btnYes.disabled = true; btnNo.disabled = true;
    // setTimeout(function(){ btnYes.disabled = false; btnNo.disabled = false; }, 1500);
}

rotation = 0;
start = 0;
yepIknow = true;

function doAnimation() {
    var ele = $('.lemap');
    var pap = $('.papers');

    rotation += 120;

    AnimateRotate(ele, rotation, start, 1000);
    AnimateRotate(pap, rotation, start, 1000);

    start += 120;
}

function AnimateRotate(ele, angle, rotateFrom, durat) {

    $({ deg: rotateFrom }).animate({ deg: angle }, {
        duration: durat,
        step: now => {
            ele.css({
                transform: 'rotate(' + now + 'deg)'
            });
        }
    });
}

hand.addEventListener("click", e => {
    socket.emit('iknow', roomName);
    hand.style.display = 'none';
    showAnsw(iknow);
});

function doStart() {
    var ele = $('#lecards');
    AnimateRotate(ele, -120, 0, 2000);
    setTimeout(() => { lecards.style.display = 'none'; }, 2000);
    setTimeout(() => { papers.style.display = 'inline'; }, 2000);
}

// function timerStart() {
//     var time = 30;
//     setInterval(() => {
//         if (time != 0) {
//             time--;
//             timer.innerHTML = time;
//         } else {
//             clearInterval();
//             socket.emit('slower', roomName, 's');
//             doAnimation();
//         }
//     }, 1000);
// }