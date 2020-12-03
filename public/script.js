// const canvas = $("#canvas");
// var ctx = canvas.getContext("2d");

// signature.on("mousedown", (e) => {
//     let startX = e.pageX;
//     let startY = e.pageY;

//     ctx.beginPath();

//     ctx.moveTo(startX, startY);

//     signature.on("mousemove", (moveE) => {
//         ctx.lineTo(moveE.pageX, moveE.pageY);
//     });
// });

// signature.on("mouseup", () => {
//     console.log("mouseup!");
//     ctx.stroke();
// });

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let painting = false;

function startPosition() {
    painting = true;
}

function finishedPosition() {
    painting = false;
}

function draw(e) {
    if (!painting) {
        return;
    }
    ctx.lineWidth = "10";
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);
