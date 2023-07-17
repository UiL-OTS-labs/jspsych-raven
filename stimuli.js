
/**
 * Table with the stimuli and the picture that belongs to each trial
 */
const RAVEN_ITEMS = [
    {num_answers : 6, image: "a1.jpg"},
    {num_answers : 6, image: "a2.png"},
    {num_answers : 6, image: "a3.png"},
    {num_answers : 6, image: "a4.jpg"},
    {num_answers : 6, image: "a5.jpg"},
    {num_answers : 6, image: "a6.jpg"},
    {num_answers : 6, image: "a7.jpg"},
    {num_answers : 6, image: "a8.jpg"},
    {num_answers : 6, image: "a9.jpg"},
    {num_answers : 6, image: "a10.jpg"},
    {num_answers : 6, image: "a11.png"},
    {num_answers : 6, image: "a12.jpg"},
    {num_answers : 6, image: "b1.jpg"},
    {num_answers : 6, image: "b2.jpg"},
    {num_answers : 6, image: "b3.jpg"},
    {num_answers : 6, image: "b4.jpg"},
    {num_answers : 6, image: "b5.jpg"},
    {num_answers : 6, image: "b6.jpg"},
    {num_answers : 6, image: "b7.jpg"},
    {num_answers : 6, image: "b8.jpg"},
    {num_answers : 6, image: "b9.jpg"},
    {num_answers : 6, image: "b10.jpg"},
    {num_answers : 6, image: "b11.jpg"},
    {num_answers : 6, image: "b12.jpg"},
    {num_answers : 8, image: "c1.jpg"},
    {num_answers : 8, image: "c2.jpg"},
    {num_answers : 8, image: "c3.jpg"},
    {num_answers : 8, image: "c4.jpg"},
    {num_answers : 8, image: "c5.jpg"},
    {num_answers : 8, image: "c6.jpg"},
    {num_answers : 8, image: "c7.jpg"},
    {num_answers : 8, image: "c8.jpg"},
    {num_answers : 8, image: "c9.png"},
    {num_answers : 8, image: "c10.png"},
    {num_answers : 8, image: "c11.jpg"},
    {num_answers : 8, image: "c12.jpg"},
    {num_answers : 8, image: "d1.jpg"},
    {num_answers : 8, image: "d2.jpg"},
    {num_answers : 8, image: "d3.jpg"},
    {num_answers : 8, image: "d4.jpg"},
    {num_answers : 8, image: "d5.jpg"},
    {num_answers : 8, image: "d6.jpg"},
    {num_answers : 8, image: "d7.jpg"},
    {num_answers : 8, image: "d8.jpg"},
    {num_answers : 8, image: "d9.jpg"},
    {num_answers : 8, image: "d10.jpg"},
    {num_answers : 8, image: "d11.jpg"},
    {num_answers : 8, image: "d12.jpg"},
    {num_answers : 8, image: "e1.jpg"},
    {num_answers : 8, image: "e2.png"},
    {num_answers : 8, image: "e3.jpg"},
    {num_answers : 8, image: "e4.png"},
    {num_answers : 8, image: "e5.jpg"},
    {num_answers : 8, image: "e6.jpg"},
    {num_answers : 8, image: "e7.jpg"},
    {num_answers : 8, image: "e8.png"},
    {num_answers : 8, image: "e9.jpg"},
    {num_answers : 8, image: "e10.jpg"},
    {num_answers : 8, image: "e11.jpg"},
    {num_answers : 8, image: "e12.png"},
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

function getImages() {
    let stimuli = getTestItems();
    let images = [];

    stimuli.forEach((item) => {
        images.push(item.image);
    });

    return images;
}
