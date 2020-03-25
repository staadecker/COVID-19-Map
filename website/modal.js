// Get the modal.
const modal1 = document.getElementById("myModal1");
const modal2 = document.getElementById("myModal2");
const modal3 = document.getElementById("myModal3");

// Get the button that opens the modal.
const btn1 = document.getElementById("myBtn1");
const btn2 = document.getElementById("myBtn2");
const btn3 = document.getElementById("myBtn3");

// Get the <span> element that closes the modal.
// var span = document.getElementsByClassName("close")[0];
const span1 = document.getElementById("close1");
const span2 = document.getElementById("close2");
const span3 = document.getElementById("close3");

// When the user clicks the button, open the modal.
btn1.onclick = function() {
    modal1.style.display = "block";
};

btn2.onclick = function() {
    modal2.style.display = "block";
};

btn3.onclick = function() {
    modal3.style.display = "block";
};


// When the user clicks on <span> (x), close the modal.
span1.onclick = function() {
    modal1.style.display = "none";
};

span2.onclick = function() {
    modal2.style.display = "none";
};

span3.onclick = function() {
    modal3.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it.
window.onclick = function(event) {
    switch (event.target) {
        case modal1: modal1.style.display = "none"; break;
        case modal2: modal2.style.display = "none"; break;
        case modal3: modal3.style.display = "none"; break;
    }
};