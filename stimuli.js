
/**
 * Table with the stimuli and the picture that belongs to each trial
 */
const RAVEN_ITEMS = [
    {num_answers : 6, image: "a1.jpg"},
    {num_answers : 6, image: "a2.png"},
];

/**
 * Creates a copy of the table above and prepends the images folder to the
 * stimuli.
 */
function getTestItems() {
    let stimuli = []
    RAVEN_ITEMS.forEach((item) => {
        let stim = {
            num_answers : item.num_answers,
            image: "images/" + item.image
        };
        stimuli.push(stim);
    });
    return stimuli
}
