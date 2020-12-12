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

const restaurant = $(".restaurant");

$(document).ready(() => {
    let randomIndex = Math.floor(Math.random() * 5);
    restaurant.html(
        `<a href="${restaurants[randomIndex].url}">${restaurants[randomIndex].name}</a>`
    );
});
