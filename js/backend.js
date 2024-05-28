const ammeter = document.getElementById('ammeter');
const voltmeter = document.getElementById('voltmeter');
const length = document.getElementById('length');

const potentiometr = document.getElementById('potentiometr');
const potentiometrResistCoef = 0.03125;

// Scroll bar
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 30

const battery_volts = 1.6, battery_ampers = 0.250, circuit_resistance = 0.1;
const wire_resistivity = 1.12, wire_S = 0.075;      // both in 10^(-6)
const wire_resDivedS = wire_resistivity / wire_S;   // it's devide, so extent doesn't matter
let wire_len = 0.03;

const turnBtn = document.getElementById('turnBtn');

let isTurnOn = false;
turnBtn.addEventListener('click', (event) => {
    if (isTurnOn) turnOn();
    else turnOff();
    calculate();
});

function turnOn() {
    isTurnOn = false;
    turnBtn.innerHTML = 'Включить';
    turnBtn.classList.remove('btn-danger');
    turnBtn.classList.add('btn-success');
}

function turnOff() {
    isTurnOn = true;
    turnBtn.innerHTML = 'Выключить';
    turnBtn.classList.add('btn-danger');
    turnBtn.classList.remove('btn-success');
}

const startPotentiometrAngle = 90; 
let potentiometrRotation = startPotentiometrAngle;
function setup() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    potentiometr.style.rotate = potentiometrRotation + "deg";
}
setup();

function calcuteVolts(ampers, wireResist) {
    let volts = ampers * wireResist;
    if (volts > battery_volts) volts = battery_volts;
    return volts;
}

function calcuteAmpers(resistance, wireResist) {
    let ampers = battery_volts / (resistance + wireResist + circuit_resistance);
    if (ampers > battery_ampers) ampers = battery_ampers; 
    return ampers > 0 ? ampers : 0 ;
}

function calculateWireResist(wireLen) {
    return wireLen * wire_resDivedS;
}

function calculatePotentiometrResist(potentiometrRotation) {
    if (potentiometrRotation < startPotentiometrAngle) return (potentiometrRotation - startPotentiometrAngle + 360) * potentiometrResistCoef;
    else return (potentiometrRotation - startPotentiometrAngle) * potentiometrResistCoef;
}

function updateAmmeter(val) {
    ammeter.innerHTML = val.toFixed(3) + ' А';
}

function updateVoltmeter(val) {
    voltmeter.innerHTML = val.toFixed(2) + ' В';
}

function updateWireLen(val) {
    length.innerHTML = val + ' м';
}

function updateCanvas() {
    // clear rectangle
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();
    ctx.closePath();
    
    // thumb move
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    for (let i = 5; i <= 100; i += 5)
        ctx.fillText(i.toString(), i*CANVAS_WIDTH/100, CANVAS_HEIGHT / 2 + 5);
    ctx.rect(x, 0, THUMB_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // Up and down bounds 
    ctx.moveTo(0, 0);
    ctx.lineTo(CANVAS_WIDTH, 0);
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.closePath();
}

// scroll bar - linear to change wire_len
const THUMB_WIDTH = 30;
const RIGHT_THUMB_BOUND = CANVAS_WIDTH - THUMB_WIDTH;
let isThumbClicked = false;
let isPotentiometrClicked = false;
let dx;
let x = 0;

function potentiometrProcess(event) {
    if (!isPotentiometrClicked) return;


    let x = (event.pageX - potentiometr.offsetLeft - potentiometr.offsetWidth/2);
    let y = (event.pageY - potentiometr.offsetTop - potentiometr.offsetHeight/2);
    
    potentiometrRotation = startPotentiometrAngle + Math.atan2(x,y)*(-57); 
    potentiometr.style.rotate = potentiometrRotation + "deg";
    calculate();
}

function thumbProcess(event) {
    if (!isThumbClicked) return;
    x = (event.pageX - canvas.offsetLeft);

    // check bounds 
    if (x < 0) x = 0;
    if (x > RIGHT_THUMB_BOUND) x = RIGHT_THUMB_BOUND; 
    wire_len = (x/CANVAS_WIDTH + 0.03).toFixed(2);
    calculate();
}

canvas.onmousedown = function (event) {
    isThumbClicked = true;
}

document.getElementById('potentiometrField').onmousedown = function (event) {
    isPotentiometrClicked = true;
}

document.onmousemove = function (event) {
    potentiometrProcess(event);
    thumbProcess(event);
}

document.onmouseup = function(event) {
    isPotentiometrClicked = false;
    isThumbClicked = false;
}

// recalculate volts and ampers on every changed parametr 
function calculate() {
    let wireResist = calculateWireResist(wire_len);
    let resistanceVal = calculatePotentiometrResist(potentiometrRotation);
    console.log(potentiometrRotation + " " + resistanceVal);
    let ampers = isTurnOn ? calcuteAmpers(resistanceVal, wireResist) : 0;
    let volts  = isTurnOn ? calcuteVolts(ampers, wireResist) : 0;

    updateVoltmeter(volts);
    updateAmmeter(ampers);
    updateWireLen(wire_len);

    updateCanvas();
}
calculate();