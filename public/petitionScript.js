const canvas = $("#canvas");
const sig = $("#sig");
let dataURL;
var ctx = canvas[0].getContext("2d");

const btn = $("#btn");

canvas.on("mousedown", (e) => {
    let canvasXAxis = canvas.offset().left;
    let canvasYAxis = canvas.offset().top;
    let userX = e.pageX - canvasXAxis;
    let userY = e.pageY - canvasYAxis;

    ctx.beginPath();

    ctx.moveTo(userX, userY);

    canvas.on("mousemove", (moveE) => {
        userX = moveE.pageX - canvasXAxis;
        userY = moveE.pageY - canvasYAxis;
        ctx.lineTo(userX, userY);
        ctx.stroke();
        dataURL = document.querySelector("#canvas").toDataURL();
        sig.val(dataURL);
    });
});

canvas.on("mouseup", () => {
    canvas.unbind("mousemove");
    dataURL = document.querySelector("#canvas").toDataURL();
    sig.val(dataURL);
});

btn.on("mouseenter", () => {
    btn.addClass("button-hover");
});

btn.on("mouseleave", () => {
    btn.removeClass("button-hover");
});
