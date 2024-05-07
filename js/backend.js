const angleStep = 360 / 10;

const patrons = [];

const ammeter = document.getElementById('ammeter');
const voltmeter = document.getElementById('voltmeter');
const length = document.getElementById('length');

const battery_volts = 1.6, battery_ampers = 0.250, circuit_resistance = 0.1;
const wire_resistivity = 1.12, wire_S = 0.075;      // both in 10^(-6)
const wire_resDivedS = wire_resistivity / wire_S;   // it's devide, so extent doesn't matter
let resistance_val = 0, wire_len = 0;

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

function setup() {
    for (let i = 0; i < 6; i++) {
        patrons.push(0);
        document.getElementById('patron_' + (i)).addEventListener('click', changeResistance);
    }
}
setup();

function changeResistance(event) {
    let index = parseInt(this.id.substr(this.id.length - 1));
    if (event.button == 0)
        patrons[index] += angleStep;
    else 
        patrons[index] -= angleStep
    
    if (patrons[index] >= 360 || patrons[index] <= -360) {
        patrons[index] = 0;
    }
    let angle = patrons[index];
    updateResistance(angle, index);

    this.style.transform = "rotate(" + angle + "deg)";
}

function calcuteVolts(ampers, wire_resist) {
    return ampers * wire_resist;
}

function calcuteAmpers(resistance, wire_resist) {
    let ampers = battery_volts / (resistance + wire_resist + circuit_resistance);
    if (ampers > battery_ampers) ampers = battery_ampers; 
    return ampers > 0 ? ampers : 0 ;
}

function calculateWireResist(wire_len) {
    return wire_len * wire_resDivedS;
}

function updateAmmeter(val) {
    ammeter.innerHTML = val.toFixed(3) + ' А';
}

function updateVoltmeter(val) {
    voltmeter.innerHTML = val.toFixed(2) + ' В';
}

function updateLength(val) {
    length.innerHTML = val + ' м';
}

function updateResistance(angle, index) {
    let tick = 1;
    if (angle == 0) tick = -9;
    switch(index) {
    case 0:
        tick *= 0.25;
        break;
    case 1:
        tick *= 0.5;
        break;
    case 2:
        tick *= 1;
        break;
    case 3:
        tick *= 5;
        break;
    case 4:
        tick *= 10;
        break;
    case 5:
        tick *= 50;
        break;
    }

    resistance_val += tick;
    if (resistance_val < 0) resistance_val = 0;
    calculate();
}

// Input in bounds 0-99 
const input = document.getElementById('in');
input.addEventListener('input', (event)=> {
    let val = input.value;
    if (event.data != null && (event.data[0] < '0' || event.data[0] > '9'))
        input.value = val.substr(0,val.length-1);
});
// on focus lost - get value from input
input.onblur = function() {
    wire_len = (parseInt(input.value)/100);
    updateLength(wire_len);
    calculate();
}

document.getElementById('form').onsubmit = function(e) {
    e.preventDefault();
    input.blur();
};
// recalculate volts and ampers on every changed parametr 
function calculate() {
    let wire_resist = calculateWireResist(wire_len);
    let ampers = isTurnOn ? calcuteAmpers(resistance_val, wire_resist) : 0;
    let volts  = isTurnOn ? calcuteVolts(ampers, wire_resist) : 0;

    updateVoltmeter(volts);
    updateAmmeter(ampers);
}
calculate();