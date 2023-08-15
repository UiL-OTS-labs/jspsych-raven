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
          // An object with all the answers for each part.
          correct_responses: {
              type: jspsych.ParameterType.INT,
              pretty_name: "An array containing the answers",
              default:undefined,
              array: true
          },
      },
  };

  /**
   * **Plugin for the ravens task**
   *
   * jsPsych plugin for playing an entire Raven task
   *
   * @author Maarten Duijndam
   */
  class RavenPlugin {

      #CONTROL_CLASS = "jspsych-btn ils-raven-control";
      #RESPONSE_CLASS = "jspsych-btn ils-raven-response";
      #HEADER_ID = "raven-header"

      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }

      onTimerElapse() { // finished due timer
          this.endTrial();
      }

      onUpdateTime() { // updates the time left
          this.minutes_elapsed += 1;
          let header_paragraph = document.getElementById(this.#HEADER_ID)
          header_paragraph.innerHTML = this.headerText();
      }

      init(trial_params) {
          this.stimuli = trial_params.stimuli;
          this.num_trials = this.stimuli.length;
          this.correct_responses = trial_params.correct_responses;
          console.assert(this.stimuli.length === this.correct_responses.length);
          
          this.n = 0; // trial number
          this.output = [];
          this.trial_start = performance.now();
          this.minutes_elapsed = 0;
          this.time_tot = trial_params.max_duration / 60;

          for (let i = 0; i < this.num_trials; i++) {
              this.output.push(
                  {
                      answer : null,
                      correct : false,
                      expected : parseInt(this.correct_responses[i])
                  }
              );
          }
          this.timeout_id  = 
              setTimeout(this.onTimerElapse, trial_params.max_duration * 1000);
          this.interval_id =
              setInterval(this.onUpdateTime, 60 * 1000); // every minute
      }

      // Creates a summary of the performance of the participant
      createSummary() {
          let output = this.output

          let summary = {
              A: 0,
              B: 0,
              C: 0,
              D: 0,
              E: 0
          };

          let num_items_group = Math.round(output.length / Object.keys(summary).length);
          // make sure the output groups divides evenly over all groups
          console.assert(
              output.length / Object.keys(summary).length ===
              Math.floor(output.length / Object.keys(summary).length)
          );
          
          for (let i = 0; i < output.length; i++) {
              let correct = output[i].correct;
              if (correct) {
                  let floor = Math.floor(i / num_items_group);
                  if (floor === 0) {
                      summary.A += 1;
                  }
                  else if(floor === 1) {
                      summary.B += 1;
                  }
                  else if(floor === 2) {
                      summary.C += 1;
                  }
                  else if(floor === 3) {
                      summary.D += 1;
                  }
                  else if(floor === 4) {
                      summary.E += 1;
                  }
                  else {
                      console.error("This path shouldn't be reached");
                  }
              }
          }
          return summary;
      }

      // Function to end trial when it is time or when the participant
      // clicks done.
      //
      endTrial() {
          // kill any remaining setTimeout handlers
          this.jsPsych.pluginAPI.clearAllTimeouts();
          // These are not registered with jsPsych, hence manual clearing
          clearTimeout(this.timeout_id);
          clearInterval(this.interval_id);
          
          // gather the data to store for the trial
          var trial_data = {
              answers : this.output,
              duration : Math.round(performance.now() - this.trial_start),
              summary : this.createSummary(),
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

      headerText() { // text for header of trial.
          let trial_num = this.n + 1;
          let trial_tot = this.num_trials;
          let minutes_left = this.time_tot - this.minutes_elapsed;
          let minutes_tot = this.time_tot;
          let text = `item: ${trial_num}/${trial_tot}` + "&nbsp".repeat(10) +
                     `tijd over: ${minutes_left} / ${minutes_tot}`;
          return text;
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
          html += `<p id="${this.#HEADER_ID}">` + this.headerText() + `</p>`;
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
          let out_ref = this.output[this.n];
          out_ref.answer = value
          out_ref.correct = value === out_ref.expected;
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
