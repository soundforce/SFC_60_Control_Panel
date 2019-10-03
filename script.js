var midi, data;
var midinames = [];
var midiID = [];
var output = null;
var sent = 0;
var CC = [];
var device_number;
var device_input_ID;
var device_output_ID;
var device_is_ready;
var device_is_finished;
var displayed;
var field = [];
var fields = [];
var compare = [];
var values_sent = 0;

var analog_cc = [
  //normal pot values
  27, 1, 2, 3, 4, 5, 60, 70,
  8, 90, 100, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25
]

var toggle_cc =[
  30, 31, 32, 33, 34, 35, 36
]

var toggle_2_CC =[
  40, 41, 42, 43
]

var toggle_3_CC =[
  50, 51, 52, 53, 54, 55
]

var Channel = [
 1
]

function sendMidi(){

}

//LOAD DEFAULT VALUES DURING START UP
window.onload = function () {

    for (i = 0; i < analog_cc.length; i++) {
        document.getElementById(i).value = analog_cc[i];
    }

    for (i = analog_cc.length; i < analog_cc.length + toggle_cc.length; i++) {
        document.getElementById(i).value = toggle_cc[i - analog_cc.length];
    }

    for (i = analog_cc.length + toggle_cc.length; i < analog_cc.length + toggle_cc.length + toggle_2_CC.length; i++) {
        document.getElementById(i).value = toggle_2_CC[i - analog_cc.length - toggle_cc.length];
    }

    for (i = analog_cc.length + toggle_cc.length + toggle_2_CC.length; i < analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length; i++) {
        document.getElementById(i).value = toggle_3_CC[i - analog_cc.length - toggle_cc.length - toggle_2_CC.length];
    }

    document.getElementById(analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length).value = Channel;

};

//LOAD DEFAULT VALUES WHEN CLICK RESET BUTTON
function reset() {

    for (i = 0; i < analog_cc.length; i++) {
        document.getElementById(i).value = analog_cc[i];
    }

    for (i = analog_cc.length; i < analog_cc.length + toggle_cc.length; i++) {
        document.getElementById(i).value = toggle_cc[i - analog_cc.length];
    }

    for (i = analog_cc.length + toggle_cc.length; i < analog_cc.length + toggle_cc.length + toggle_2_CC.length; i++) {
        document.getElementById(i).value = toggle_2_CC[i - analog_cc.length - toggle_cc.length];
    }

    for (i = analog_cc.length + toggle_cc.length + toggle_2_CC.length; i < analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length; i++) {
        document.getElementById(i).value = toggle_3_CC[i - analog_cc.length - toggle_cc.length - toggle_2_CC.length];
    }

    document.getElementById(analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length).value = Channel;

    var output = midi.outputs.get(device_output_ID);
    var init_on = [0x90, 77, 77]; // note on, middle C, full velocity
    output.send(init_on); //
    sleep(100);
}

// request MIDI access with Sysex
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser. Please use only Google Chrome.");
}

//IF MIDISuccess LIST IO AND CHECK FOR TEENSY
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status
    var inputs = midi.inputs.values();
    var i = 0;
    // loop over all avai  lable inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        midinames[i] = input.value.name; //storing MIDI unputs name in an array

        if (midinames[i] == "SFC-60") {
            document.getElementById("state").innerHTML = "Connected to SFC-60";
            device_number = i;
            //device_input_ID = parseInt(input.value.id);
            device_input_ID = input.value.id;
            console.log("Device input ID is " + device_input_ID);
        }
        else {
            document.getElementById("state").innerHTML = "Was unable to connect to SFC-60";
        }
        midiID[i] = input.value.id; //storing the IDs in an array
        //console.log(midiID[i]);
        //Adding the inputs as a selection option in the select menu
        //document.getElementById('midi_list').options.add(new Option(midinames[i], midinames[i]));
        var ul = [];
        var li = [];
        ul = document.getElementById("list");
        li = document.createElement("li");
        li.appendChild(document.createTextNode(midinames[i]));
        li.setAttribute("id", "element4");
        ul.appendChild(li);
        i++;
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }

    //if i is still 0 after the for loop then we had no devices listed
    if(i==0){
    console.log("no devices ");
    }

    displayed = 1; //this avoids to re-displaxy the available MIDI ports


    for (var entry of midiAccess.outputs) {
        var output = entry[1];
        if (output.name == "SFC-60") {
            //device_output_ID = parseInt(output.id);
            device_output_ID = output.id;
            console.log("Device output ID is " + device_output_ID);
        }
    }

}

//INIT COMMUNICATION WHEN SEND CC BUTTON IS PRESSED
function init() {
    var output = midi.outputs.get(device_output_ID);
    var init_on = [0x90, 66, 66]; // note on, middle C, full velocity
    output.send(init_on); //
    sleep(100);

    values_sent = 0;
    console.log("values_sent = " + values_sent);

    document.getElementById("state").innerHTML = "Trying to send new CC values";
}

//SEND CC MESSAGES TO TEENSY IF PING SUCCEDED
function sendcc() {
    var output = midi.outputs.get(device_output_ID);
    var init_off = [0x80, 55, 55]; // note on, middle C, full velocity
    output.send(init_off); //
    sleep(100);

    //sleep(100);

    console.log(analog_cc.length + toggle_cc.length + 1);

    console.log("values_sent = " + values_sent);

    if(values_sent==0){

    for (i = 0; i < analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length + 1; i++) {
        sleep(10);
        //if field is empty send a a skip message and get out of the loop
        if (document.getElementById("form_cc").elements[i].value == "") {
            var init = [0xD0, 84];
            var output = midi.outputs.get(device_output_ID);
            output.send(init); //
            sleep(10);
            continue;
        }
        var noteOnMessage = [0xC0, parseInt(document.getElementById(i).value)]; // note on, middle C, full velocity
        var output = midi.outputs.get(device_output_ID);
        output.send(noteOnMessage); //omitting the timestamp means send immediately.
    }

    console.log("values_sent = " + values_sent);

    values_sent = 1;

    document.getElementById("state").innerHTML = "CC values loaded succesfully";

    sleep(1000);
    }

    /*
    if (device_is_finished) {
        document.getElementById("state").innerHTML = "CC values loaded succesfully";
        device_is_finished = 0;
    }
    */
}

// RESCANNING THE DEVICES WHEN BUTTON IS CLICKED
function rescan() {
    document.getElementById("state").innerHTML = "Trying to connect to the controller";
    document.getElementById("list").innerHTML = " ";

    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess(    {
            sysex: false
        }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("No MIDI support in your browser. Please use only Google Chrome.");
    }
}

function onMIDIFailure(error) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
}

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    document.getElementById("messagesent").innerHTML = "CC " + message.data[1] + " Value " + message.data[2];

    if ((message.data[0] == 209) && (message.data[1] == 8)) {
        sendcc();
    }

    if ((message.data[0] == 209) && (message.data[1] == 10)) {
        document.getElementById("state").innerHTML = "Transfer succesful, controller will reboot";
        device_is_finished=1;
        console.log("device_is_finished = " + device_is_finished);
    }

     if ((message.data[0] == 209) && (message.data[1] == 13)) {
        var output = midi.outputs.get(device_output_ID);
        var init_off = [0x80, 88, 88]; // note on, middle C, full velocity
        output.send(init_off); //
        sleep(100);

        document.getElementById("state").innerHTML = "Values are resetted, controller will reboot";
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function save() {
    field = [];
    for (i = 0; i < document.getElementById("form_cc").length; i++) {
        field[i] = document.getElementById("form_cc").elements[i].value;
    }
    document.getElementById('preset').value = field;

    alert("Copy and paste the content of the text field in .txt document for later use");
}

function load() {
    field = document.getElementById('preset').value;
    fields = field.split(',').map(Number);

    for (i = 0; i < document.getElementById("form_cc").length; i++) {
        document.getElementById("form_cc").elements[i].value = fields[i];
    }
}

setInterval(function () {
    for (i = 0; i < document.getElementById("form_cc").length; i++) {
        compare[i] = parseInt(document.getElementById("form_cc").elements[i].value);
        if (parseInt(document.getElementById("form_cc").elements[i].value) > parseInt(127)) {
            alert("!!!CC only between 0 and 127!!!");
            document.getElementById("form_cc").elements[i].value = "";
        }
    }

    if(document.getElementById(analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length).value > 16){
        alert("MIDI CHANNEL SHOULD NOT BIGGER THAN 16");
    }

    if(document.getElementById(analog_cc.length + toggle_cc.length + toggle_2_CC.length + toggle_3_CC.length).value < 1){
        alert("MIDI CHANNEL SHOULD BE BIGGER THAN 0");
    }

    /*
    for (i = 0; i < document.getElementById("form_cc").length; i++) {
        for (j = 0; j < document.getElementById("form_cc").length; j++) {
            if (j == i) {
                break;
            }
            if (parseInt(document.getElementById("form_cc").elements[i].value) == compare[j]) {
                document.getElementById("form_cc").elements[i].value = "";
                alert("!!!CC values should be unique!!!");
            }
        }
    }
    */

}, 5000);
