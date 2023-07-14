/*
 * This file creates and starts the jsPsych timeline.
 * The sub parts/trials that represent the basic building blocks of the lexical
 * decision are in the file ld_trials.js.
 */

let jsPsych = initJsPsych(
    {
    }
);


let request_fullscreen = {
    type : jsPsychFullscreen,
    fullscreen_mode : true
};

let instructions1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
        let text = INSTRUCTION1;
        return "<div class='instruction' >" +
               "<p>" + text + "</p></div>";
    },
    choices: ["Ga verder"],
    response_ends_trial: true,
    on_finish : function(data) {
        if (typeof data.rt === "number") {
            data.rt = Math.round(data.rt);
        }
    }
};

let instructions2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
        let text = INSTRUCTION2;
        return "<div class='instruction' >" +
               "<p>" + text + "</p></div>";
    },
    choices: ["Ga verder"],
    response_ends_trial: true,
    on_finish : function(data) {
        if (typeof data.rt === "number") {
            data.rt = Math.round(data.rt);
        }
    }
};

let end_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: DEBRIEF_MESSAGE,
    choices: ["einde"],
    trial_duration: DEBRIEF_MESSAGE_DURATION,
    on_finish : function(data) {
        if (typeof data.rt === "number") {
            data.rt = Math.round(data.rt);
        }
    },
    on_load : function() {
        uil.saveData(ACCESS_KEY);
    }
};

function initExperiment() {

    // Data added to the output of all trials.
    let subject_id = jsPsych.randomization.randomID(8);
    jsPsych.data.addProperties({
        subject: subject_id,
    });


    let timeline = [];

    // request fullscreen
    timeline.push(request_fullscreen);

    timeline.push(instructions1);
    timeline.push(instructions2);

    timeline.push(end_screen);

    // Start jsPsych when running on a Desktop or Laptop style pc.
    uil.browser.rejectMobileOrTablet();
    jsPsych.run(timeline);
}

function main() {

    // Make sure you've updated your key in globals.js
    uil.setAccessKey(ACCESS_KEY);
    uil.stopIfExperimentClosed();

    initExperiment();
}

