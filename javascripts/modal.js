// Get the modal.
const about_map_modal = document.getElementById("about_map_modal");
const about_us_modal = document.getElementById("about_us_modal");
const instructions_modal = document.getElementById("instructions_modal");

//  Functions
const displayModal = modal => modal.style.display = "block";
const hideModal = modal => modal.style.display = "none";

// Open modal when button is pressed
document.getElementById("about_map_btn").onclick = () => displayModal(about_map_modal);
document.getElementById("about_us_btn").onclick = () => displayModal(about_us_modal);
document.getElementById("instructions_btn").onclick = () => displayModal(instructions_modal);

// When the user clicks on <span> (x), close the modal.
document.getElementById("close1").onclick = () => hideModal(about_map_modal);
document.getElementById("close2").onclick = () => hideModal(about_us_modal);
document.getElementById("close3").onclick = () => hideModal(instructions_modal);

// When the user clicks anywhere outside of the modal, close it.
window.onclick = function (event) {
    switch (event.target) {
        case about_map_modal:
        case about_us_modal:
        case instructions_modal:
            hideModal(event.target);
            break;
    }
};

displayModal(instructions_modal);