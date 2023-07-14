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

      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }

      init(trial_params) {
          this.stimuli = trial_params.stimuli;
          this.num_trials = trial_params.length;
          this.n = 0; // trial number
      }

      // Function to end trial when it is time or when the participant
      // clicks done.
      //
      endTrial() {
          // kill any remaining setTimeout handlers
          this.jsPsych.pluginAPI.clearAllTimeouts();
          
          // gather the data to store for the trial
          var trial_data = {
          };

          // clear the display
          this.display_element.innerHTML = "";

          // move on to the next trial
          this.jsPsych.finishTrial(trial_data);
      }

      start() {

      }

      trial(display_element, trial_params, on_load) {

          this.display_element = display_element;

          this.init(trial_params);
          
          this.start();
      }
  }

  RavenPlugin.info = info;

  return RavenPlugin;
})(jsPsychModule);
