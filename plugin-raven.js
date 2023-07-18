var ilsRaven = (function (jspsych) {
  'use strict';

  const info = {
      name: "raven",
      parameters: {
          /** The audio to be played. We assume the file's contain numbers.*/
          stimuli: {
              type: jspsych.ParameterType.OBJECT,
              pretty_name: "Stimuli",
              default: undefined,
              array: true,
          },
          /** The maximum duration to wait before the test is terminated. */
          max_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Maximal duration in seconds",
              default: 35 * 60, // 35 minutes
          },
      },
  };

  /**
   * **audio-digit-span**
   *
   * jsPsych plugin for playing an entire Raven task
   *
   * @author Maarten Duijndam
   */
  class RavenPlugin {

      #CONTROL_CLASS = "jspsych-btn ils-raven-control";
      #RESPONSE_CLASS = "jspsych-btn ils-raven-response";

      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }

      onTimerElapse() { // finished due timer
          this.endTrial();
      }

      init(trial_params) {
          this.stimuli = trial_params.stimuli;
          this.num_trials = this.stimuli.length;
          this.n = 0; // trial number
          this.output = [];
          this.trial_start = performance.now();
          for (let i = 0; i < this.num_trials; i++) {
              this.output.push({answer : null});
          }
          setTimeout(this.onTimerElapse, trial_params.max_duration * 1000);
      }

      // Function to end trial when it is time or when the participant
      // clicks done.
      //
      endTrial() {
          // kill any remaining setTimeout handlers
          this.jsPsych.pluginAPI.clearAllTimeouts();
          
          // gather the data to store for the trial
          var trial_data = {
              answers : this.output,
              duration : Math.round(performance.now() - this.trial_start),
          };

          // clear the display
          this.display_element.innerHTML = "";

          // move on to the next trial
          this.jsPsych.finishTrial(trial_data);
      }

      /**
       * Create the response buttons that users use to answer one question
       */
      createResponseButtons() {
          let html = "<cr/>";

          html += `<div style="min-width:50vw;max-width:50vw;margin:auto">`;
          html += `<table style="width:100%;border:1px solid black;border-radius:10px;">`;
          html += `<tr>`;

          for (let i = 0; i < this.stimuli[this.n].num_answers; i++) {
              let id = `raven${i}`;
              let thtml = "";
              let checked =
                  this.output[this.n].answer === i + 1 ? "checked" : "";
              if (i === this.stimuli[this.n].num_answers / 2) { // add table row
                  thtml += "</tr><tr>";
              }
              thtml +=
                  `<td>`+
                      `<input ` +
                          `type="radio" ` +
                          `name="raven-response" ` + 
                          `value=${i+1} ` +
                          `class="${this.#RESPONSE_CLASS}" ` +
                          `id="${id}" ` +
                          `${checked}` +
                          `/>` +
                      `<label for="${id}">${i+1}</label>` +
                  `</td>`;
              html += thtml;
          }
          html += "</tr>";
          html += "</table>";
          html += "</div>";

          return html;
      }

      /**
       * Create the three buttons at the bottom that control the continuation
       * of RAVEN task
       */
      createControlButtons() {
          let html = "<cr/>";

          html += `<div style="min-width:50vw;max-width:50vw;margin:auto">`;
          html += `<table style="width:100%;">`;
          html += `<td><button id="control-prev" class=${this.#CONTROL_CLASS}>Ga terug</button></td>` +
                  `<td><button id="control-end" class=${this.#CONTROL_CLASS}>Einde van het experiment</button></td>` +
                  `<td><button id="control-next" class=${this.#CONTROL_CLASS}>Ga verder</button></td>`;
          html += "</table>";
          html += "</div>";

          return html;
      }

      installCallbacks() {
          let prev_button = document.getElementById("control-prev");
          let end_button = document.getElementById("control-end");
          let next_button = document.getElementById("control-next");

          prev_button.onclick = this.onPrevButtonClicked;
          end_button.onclick = this.onEndButtonClicked;
          next_button.onclick = this.onNextButtonClicked;

          let resp_buttons = document.getElementsByClassName(
              this.#RESPONSE_CLASS
          );
          for (let i = 0; i < resp_buttons.length; i++) {
              resp_buttons[i].onclick = this.onResponseButtonClicked
          }
      }

      startTrial(n) {
          this.n = n;
          let vp_width = window.innerWidth;
          let vp_height = window.innerHeight;
          let img_style = "";
          if (vp_width > vp_height) {
              img_style = `style="max-height:70vh;width:auto"`;
          }
          else {
              img_style = `style="max-width:70vw;height:auto"`;
          }
          let html = "<div>";
          html += `<p>${this.n + 1}/${this.num_trials}</p>`
          html += "</div>";
          html += "<div>";
          html += `<img src="${this.stimuli[this.n].image}" ${img_style}></img>`;
          html += "</div>";
          html += this.createResponseButtons();
          html += this.createControlButtons();

          this.display_element.innerHTML = html;


          this.installCallbacks()

      }

      trial(display_element, trial_params, on_load) {

          this.display_element = display_element;

          this.init(trial_params);

          window.onresize = (resize_event) => {
              this.startTrial(this.n);
          };
          
          this.startTrial(this.n);
      }

      onResponseButtonClicked(event) {
          let value = event.currentTarget.value;
          value = parseInt(value);
          this.output[this.n].answer = value;
      }

      onPrevButtonClicked() {
          if (this.n > 0) {
              this.startTrial(this.n - 1);
          }
      }

      onEndButtonClicked() {
          this.endTrial();
      }

      onNextButtonClicked(){
          if (this.n < this.num_trials - 1) {
              this.startTrial(this.n + 1);
          }
      }
  }

  RavenPlugin.info = info;

  return RavenPlugin;
})(jsPsychModule);
