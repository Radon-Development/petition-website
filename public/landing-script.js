const aTag = $("#aTag");
const crawl = $(".crawl");

aTag.on("mouseenter", () => {
    crawl.css({ "animation-play-state": "paused" });
});

aTag.on("mouseleave", () => {
    crawl.css({ "animation-play-state": "running" });
});
