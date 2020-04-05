// Get the modal.
const about_map_modal = document.getElementById("about_map_modal");
const instructions_modal = document.getElementById("instructions_modal");

//  Functions
const displayModal = modal => modal.style.display = "block";
const hideModal = modal => modal.style.display = "none";

// Open modal when button is pressed
document.getElementById("about_map_btn").onclick = () => displayModal(about_map_modal);
document.getElementById("instructions_btn").onclick = () => displayModal(instructions_modal);

// When the user clicks on <span> (x), close the modal.
document.getElementById("close_about_map").onclick = () => hideModal(about_map_modal);
document.getElementById("close_instructions").onclick = () => hideModal(instructions_modal);

// When the user clicks anywhere outside of the modal, close it.
window.onclick = function (event) {
    switch (event.target) {
        case about_map_modal:
        case instructions_modal:
            hideModal(event.target);
            break;
    }
};

displayModal(instructions_modal);