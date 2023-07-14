var ilsAudioDigitSpan = (function (jspsych) {
  'use strict';

  const info = {
      name: "audio-digit-span",
      parameters: {
          /** The audio to be played. We assume the file's contain numbers.*/
          stimuli: {
              type: jspsych.ParameterType.AUDIO,
              pretty_name: "Stimulus",
              default: undefined,
              array: true,
          },
          /** The correct answer to this trial */
          expected_answer : {
              type: jspsych.ParameterType.STRING,
              pretty_name: "The expected answer to this trial",
              default:undefined 
          },
          /** The interval between two successive digits.*/
          isi : {
              type: jspsych.ParameterType.INT,
              pretty_name: "Inter Stimulus Interval",
              default: 200,
          },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: "1234567890".split('').concat(["backspace", "ok"]),
              array: true,
          },
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Any content here will be displayed below the stimulus. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** The maximum duration to wait for a response, after audio has finished. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** Vertical margin of button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** Horizontal margin of button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
      },
  };

  /**
   * **audio-digit-span**
   *
   * jsPsych plugin for playing a number of audio files
   *
   * Based on {@link https://www.jspsych.org/plugins/jspsych-audio-button-response/ audio-button-response plugin documentation on jspsych.org}
   *
   * @author Kristin Diep
   * @author Maarten Duijndam
   *
   */
  class AudioDigitSpanPlugin {

      constructor(jsPsych) {
          this.jsPsych = jsPsych;
          this.expected_answer = "";
          this.answer = "";
          this.response = {};
          this.resetResponse();
      }

      resetResponse() {
          this.response.rt = null;
          this.response.answer = null;
          this.response.correct = false;
          this.response.ok_pressed = false;
      }

      /**
       * schedules a new digit.
       */
      scheduleAudio(isi) {
          this.jsPsych.pluginAPI.setTimeout(this.playStimulus, isi);
      }

      /**
       * Shifts one stimulus from the stimuli and plays it.
       */
      playStimulus() {
          console.assert(this.stimuli.length > 0);
          let stimulus = this.stimuli.shift();
          let audio;
          let myself = this;

          function audioStopped() {
              audio.removeEventListener("ended", audioStopped);
              if (myself.stimuli.length === 0) {
                  myself.setupResponse();
              }
              else {
                  if (myself.params.isi > 0) {
                      myself.scheduleAudio(myself.params.isi);
                  }
                  else {
                      myself.playStimulus();
                  }
              }
          }

          function startAudio() {
              audio.addEventListener("ended", audioStopped);
              let startTime = performance.now();
              if (myself.context !== null) {
                  startTime = myself.context.currentTime;
                  audio.start(startTime);
              }
              else {
                  audio.play();
              }
          }
          
          this.jsPsych.pluginAPI
              .getAudioBuffer(stimulus)
              .then(function (buffer) {
              console.log(myself);
              if (myself.context !== null) {
                  audio = myself.context.createBufferSource();
                  audio.buffer = buffer;
                  audio.connect(myself.context.destination);
              }
              else {
                  audio = buffer;
                  audio.currentTime = 0;
              }
              startAudio();
          })
              .catch(function (err) {
              console.error(`Failed to load audio file "${stimulus}." `   +
                  "Try checking the file path. We recommend using the " +
                  "preload plugin to load audio files.");
              console.error(err);
          });
      }

      updateHtml() {
          var buttons = [];
          if (Array.isArray(this.params.button_html)) {
              if (this.params.button_html.length == this.params.choices.length) {
                  buttons = this.params.button_html;
              }
              else {
                  console.error(
                      "Error in audio-digit-span plugin. The length of the " +
                      "button_html array does not equal the length of the "  +
                      "choices array"
                  );
              }
          }
          else {
              for (var i = 0; i < this.params.choices.length; i++) {
                  buttons.push(this.params.button_html);
              }
          }
          let html = "";
          //show prompt if there is one
          if (this.params.prompt !== null) {
              html += this.params.prompt;
          }

          html += `<input disabled=true style="margin:30px 30px"` +
                  `value="${this.answer}"></input>`;
          
          html += '<div id="jspsych-audio-button-response-btngroup">';
          for (let i = 0; i < this.params.choices.length; i++) {
              var str = buttons[i].replace(/%choice%/g, this.params.choices[i]);
              html +=
                  '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:' +
                  this.params.margin_vertical +
                  " " +
                  this.params.margin_horizontal +
                  '" id="jspsych-audio-button-response-button-' +
                  i +
                  '" data-choice="' +
                  i +
                  '">' +
                  str +
                  "</div>";
          }
          html += "</div>";
          this.display_element.innerHTML = html;
          // We need to re enable the buttons.
          this.enableButtons();
      }

      buttonResponse(e) {
          var choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
          this.afterResponse(choice);
      }

      enableButtons() {
          var btns = document.querySelectorAll(".jspsych-audio-button-response-button");
          for (var i = 0; i < btns.length; i++) {
              var btn_el = btns[i].querySelector("button");
              if (btn_el) {
                  btn_el.disabled = false;
              }
              btns[i].addEventListener("click", this.buttonResponse);
          }
      }

      // function to handle responses by the subject
      afterResponse(choice) {
          // measure rt
          let button = parseInt(choice);
          if (button < this.params.choices.length - 2) { // user entered number
              this.answer += this.params.choices[button];
              this.updateHtml();
          }
          else if (button === this.params.choices.length - 2) { // backspace entered
              this.answer = this.answer.slice(0, -1);
              this.updateHtml();
          }
          else {
              console.assert(button === this.params.choices.length - 1);
              var endTime = performance.now();
              var rt = Math.round(endTime - this.respStartTime);
              this.response.ok_pressed = true;
              this.response.rt = rt;
              this.response.correct = this.answer === this.params.expected_answer;
              this.endTrial();
          }
      }

      // This displays the html for the response part of the trial.
      setupResponse() {
          //display buttons
          this.updateHtml();
          // enable responses
          this.enableButtons();

          // start time of response
          this.respStartTime = performance.now();
          // end trial if time limit is set
          if (this.params.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(function () {
                  this.endTrial();
              }, this.params.trial_duration);
          }
      }

      // function to end trial when it is time
      endTrial() {
          // kill any remaining setTimeout handlers
          this.jsPsych.pluginAPI.clearAllTimeouts();
          
          // gather the data to store for the trial
          var trial_data = {
              rt: this.response.rt,
              stimuli: this.params.stimuli,
              answer: this.answer,
              expected_answer : this.expected_answer,
              correct: this.response.correct,
              ok_pressed: this.response.ok_pressed
          };
          // clear the display
          this.display_element.innerHTML = "";
          // move on to the next trial
          this.jsPsych.finishTrial(trial_data);

          // mark as done
          this.trial_complete();
      }

      trial(display_element, trial, on_load) {
          // hold the .resolve() function from the Promise that ends the trial
          this.trial_complete = null;

          this.display_element = display_element;

          // setup audio context stimulus
          this.context = this.jsPsych.pluginAPI.audioContext();
          this.params = trial;
          this.expected_answer = this.params.expected_answer;
          this.resetResponse(this.params);
          
          console.assert(Array.isArray(trial.stimuli));
          this.stimuli = trial.stimuli.slice();
          this.stimuli.forEach(
              (stimulus) => {console.assert(typeof(stimulus) === "string");}
          );

          this.playStimulus();

          return new Promise((resolve) => {
              this.trial_complete = resolve;
          });
      }
  }

  AudioDigitSpanPlugin.info = info;

  return AudioDigitSpanPlugin;
})(jsPsychModule);
