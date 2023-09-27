/*
 * This file creates and starts the jsPsych timeline.
 * The sub parts/trials that represent the basic building blocks of the lexical
 * decision are in the file ld_trials.js.
 */

let jsPsych = initJsPsych(
    {
    }
);

let preload = {
    type : jsPsychPreload,
    images : getImages(),
};


let request_fullscreen = {
    type : jsPsychFullscreen,
    fullscreen_mode : true,
    message : FULLSCREEN_PROMPT,
    button_label : FULLSCREEN_BUTTON_LABEL
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
    choices: ["Begin met het experiment"],
    response_ends_trial: true,
    on_finish : function(data) {
        if (typeof data.rt === "number") {
            data.rt = Math.round(data.rt);
        }
    }
};

let raven_test = {
    type : ilsRaven,
    stimuli : getTestItems(),
    max_duration : 35 * 60,
    correct_responses : ANSWERS,
    on_finish : function (data) {
        data.rt = Math.round(data.rt);
    }
}

let end_screen = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function () {
        let text = DEBRIEF_MESSAGE;
        return "<div class='instruction'>"
            + "<p>" + text + "</p></div>";
    },
    choices: ["einde"],
    trial_duration: DEBRIEF_MESSAGE_DURATION,
    on_finish : function(data) {
        if (typeof data.rt === "number") {
            data.rt = Math.round(data.rt);
        }
        // redirect to prolific
        uil.browser.redirect(REDIRECTION_URL, {cc : COMPLETION_CODE});
    },
    on_load : function() {
        uil.saveData(ACCESS_KEY);
    }
};

function initExperiment() {

    // Data added to the output of all trials.
    
    let prolific_vars = {
        PROLIFIC_PID : jsPsych.data.getURLVariable('PROLIFIC_PID'),
        STUDY_ID : jsPsych.data.getURLVariable('STUDY_ID'),
        SESSION_ID : jsPsych.data.getURLVariable('SESSION_ID'),
    };
    jsPsych.data.addProperties(prolific_vars);

    let timeline = [];
    timeline.push(preload);

    // request fullscreen
    timeline.push(request_fullscreen);

    // start recording focus from here
    timeline.push({
        type : IlsFocusPlugin
    });

    timeline.push(instructions1);
    timeline.push(instructions2);

    timeline.push(raven_test);
    
    timeline.push({
        type : IlsFocusPlugin
    });

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

