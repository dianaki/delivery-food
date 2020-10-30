'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const passwordInput = document.querySelector("#password");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");

const restaurantTitle = document.querySelector(".restaurant-title");
const restaurantRating = document.querySelector(".rating");
const restaurantPrice = document.querySelector(".price");
const restaurantCategory = document.querySelector(".category");

const inputSearch = document.querySelector(".input-search");

let login = localStorage.getItem("delivery-club");
let password;

const getData = async function (url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`)
  }

  return await response.json();

};

getData("./db/partners.json");

function toggleModal() {
  modal.classList.toggle("is-open");
};

function toogleModalAuth() {
  modalAuth.classList.toggle("is-open");
  loginInput.style.borderColor = "";
  passwordInput.style.borderColor = "";

  if (modalAuth.classList.contains("is-open")) {
    disableScroll();
  } else {
    enableScroll();
  }
};

function autorized() {

  function logOut() {
    login = null;
    localStorage.removeItem('delivery-club');
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
  }

  console.log("Авторизован");
  userName.textContent = login;

  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "block";

  buttonOut.addEventListener("click", logOut);
};

function notAutorized() {
  console.log("Неавторизован");

  function logIn(event) {
    event.preventDefault();

    if (loginInput.value.trim()) {
      login = loginInput.value;
      localStorage.setItem("delivery-club", login);
      toogleModalAuth();
      buttonAuth.removeEventListener("click", toogleModalAuth);
      closeAuth.removeEventListener("click", toogleModalAuth);
      logInForm.removeEventListener("submit", logIn);
      logInForm.reset();
      checkAuth();

    } else {
      loginInput.style.borderColor = "red";
      loginInput.value = "";
    }
  }

  buttonAuth.addEventListener("click", toogleModalAuth);
  closeAuth.addEventListener("click", toogleModalAuth);
  logInForm.addEventListener("submit", logIn);

  modalAuth.addEventListener("click", function (event) {
    if (event.target.classList.contains("is-open")) {
      toogleModalAuth();
    }
  })
};

function checkAuth() {
  if (login) {
    autorized();
  } else {
    notAutorized();
  }
};

function createCardRestauraunt(restaurant) {

  const { image,
    kitchen,
    name,
    price,
    stars,
    products,
    time_of_delivery: timeOfDelivery
  } = restaurant;


  const cardRestaurant = document.createElement('a');
  cardRestaurant.className = "card card-restaurant";
  cardRestaurant.products = products;
  cardRestaurant.info = { kitchen, name, price, stars }

  const card = `
    <img src="${image}" alt=${name} class="card-image" />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <div class="card-info">
        <div class="rating">
          ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  `;
  cardRestaurant.insertAdjacentHTML("beforeend", card)
  cardsRestaurants.insertAdjacentElement("beforeend", cardRestaurant);
};

function createCardGood(goods) {

  const { description,
    name,
    price,
    image
  } = goods;

  const card = document.createElement("div");
  card.className = "card";

  card.insertAdjacentHTML("beforeend",
    `
    <img src="${image}" alt=${name} class="card-image" />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `);

  cardsMenu.insertAdjacentElement("beforeend", card);
};

function openGoods(event) {
  const target = event.target;

  if (login) {
    const restaurant = target.closest(".card-restaurant");

    if (restaurant) {
      cardsMenu.textContent = "";
      containerPromo.classList.add("hide");
      restaurants.classList.add("hide");
      menu.classList.remove("hide");

      const { name, kitchen, price, stars } = restaurant.info;

      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `От ${price} ₽`;
      restaurantCategory.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then(function (data) {
        data.forEach(createCardGood);
      });

    }
  } else {
    toogleModalAuth();
  }
};

function init() {
  getData("./db/partners.json").then(function (data) {
    data.forEach(createCardRestauraunt);
  });

  cardsRestaurants.addEventListener("click", openGoods);

  cartButton.addEventListener("click", toggleModal);

  close.addEventListener("click", toggleModal);

  logo.addEventListener("click", function () {
    containerPromo.classList.remove("hide")
    restaurants.classList.remove("hide")
    menu.classList.add("hide")
  });

  checkAuth();

  inputSearch.addEventListener("keypress", function (event) {

    if (event.charCode === 13) {
      const value = event.target.value.trim();

      if (!value) {
        event.target, value = "";
        return
      }

      getData("./db/partners.json")
        .then(function (data) {
          return data.map(function (partner) {
            return partner.products;
          });
        })
        .then(function (linksProduct) {
          cardsMenu.textContent = "";
          linksProduct.forEach(function (link) {
            getData(`./db/${link}`)
              .then(function (data) {
                const resultSearch = data.filter(function (item) {
                  const name = item.name.toLowerCase();
                  return name.includes(value.toLowerCase());
                })

                containerPromo.classList.add("hide");
                restaurants.classList.add("hide");
                menu.classList.remove("hide");

                restaurantTitle.textContent = "Результат поиска";
                restaurantRating.textContent = "";
                restaurantPrice.textContent = "";
                restaurantCategory.textContent = "Разное";

                resultSearch.forEach(createCardGood);
              })
          })
        })
    }
  })

  new Swiper(".swiper-container", {
    slidesPerView: 1,
    loop: true,
    autoplay: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}

init();