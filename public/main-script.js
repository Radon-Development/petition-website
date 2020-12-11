const restaurants = [
    { name: "Akkawy", url: "https://www.akkawy.de/" },
    { name: "Cafe Mugrabi", url: "https://facebook.com/cafemugrabi/" },
    {
        name: "Azzam",
        url: "https://www.facebook.com/Restaurant-Azzam-228323144019941",
    },
    {
        name: "Pretty Cafe Deli",
        url: "https://www.facebook.com/Pretty-Cafe-Deli-1237769759694362/",
    },
    { name: "Falafel Sababa", url: "https://falafel-sababa.metro.rest/" },
    { name: "Bobbe", url: "https://www.bobbe.berlin/" },
];

const nameLine = $(".name");

console.log("nameLine: ", nameLine);

nameLine.html(Handlebars.templates.hummusId(restaurants[0]));

// $(document).ready(() => {});
