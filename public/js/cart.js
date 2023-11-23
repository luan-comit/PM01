function showCart() {
  var tbl_body = document.getElementById("tbl-body")
  let itemsCart = localStorage.getItem("itemsOnCart")
  //console.log("Length: ", itemsCart.length);
  //console.log(JSON.parse(itemsCart));
  itemsCart = JSON.parse(itemsCart)
  //var len = 0;
  for (let i = 0; i < listItems.length; i++) {
    if (itemsCart[listItems[i].pos] != undefined) {
      //      len++ ;

      //console.log(itemsCart[listItems[i].pos]);

      let tr = document.createElement("tr")
      let td_img = document.createElement("td")
      td_img.setAttribute("class", "thumbnail-tbl")
      let img = document.createElement("img")
      //console.log(itemsCart[listItems[i].pos].img_src);
      img.setAttribute("src", itemsCart[listItems[i].pos].img_src)
      img.setAttribute("class", "cart-img-td-tbl")
      td_img.appendChild(img)
      tr.appendChild(td_img)

      let td_price = document.createElement("td")
      //console.log('$' + itemsCart[listItems[i].pos].price);
      td_price.innerText = "$" + itemsCart[listItems[i].pos].price
      tr.appendChild(td_price)

      let td_quantity_subtract_btn = document.createElement("td")
      let subtract_btn = document.createElement("button")
      subtract_btn.innerText = "-"
      subtract_btn.setAttribute("class", "cart_quantity_btn")
      subtract_btn.setAttribute("id", "subtract_" + listItems[i].pos)
      //console.log('subtract' + listItems[i].pos);
      td_quantity_subtract_btn.appendChild(subtract_btn)
      tr.appendChild(td_quantity_subtract_btn)

      let td_quantity = document.createElement("td")
      td_quantity.innerText = "x " + itemsCart[listItems[i].pos].oncart
      td_quantity.setAttribute("id", "td_quantity_" + listItems[i].pos)
      //console.log('td_quantity_' + listItems[i].pos);
      tr.appendChild(td_quantity)

      let td_quantity_plus_btn = document.createElement("td")
      let plus_btn = document.createElement("button")
      plus_btn.innerText = "+"
      plus_btn.setAttribute("class", "cart_quantity_btn")
      plus_btn.setAttribute("id", "plus_" + listItems[i].pos)
      //console.log('plus' + listItems[i].pos);
      td_quantity_plus_btn.appendChild(plus_btn)
      tr.appendChild(td_quantity_plus_btn)

      let td_total = document.createElement("td")
      td_total.innerText =
        "$" +
        parseInt(itemsCart[listItems[i].pos].price) *
          parseInt(itemsCart[listItems[i].pos].oncart)
      td_total.setAttribute("id", "td_total_" + listItems[i].pos)
      tr.appendChild(td_total)

      tbl_body.appendChild(tr)
    }
  }

  let totalbill = localStorage.getItem("totalBill")
  let tr_totalBill = document.createElement("tr")

  let td_sumBill = document.createElement("td")
  td_sumBill.setAttribute("class", "td-sumbill")
  td_sumBill.innerText = "SUM"

  let td_null1 = document.createElement("td")
  let td_null2 = document.createElement("td")
  let td_null3 = document.createElement("td")
  let td_null4 = document.createElement("td")

  let td_totalBill = document.createElement("td")
  td_totalBill.setAttribute("class", "td-sumbill")
  td_totalBill.setAttribute("id", "td_totalBill")
  td_totalBill.innerText = "$" + totalbill

  tr_totalBill.appendChild(td_null1)
  tr_totalBill.appendChild(td_null2)
  tr_totalBill.appendChild(td_null3)
  tr_totalBill.appendChild(td_sumBill)
  tr_totalBill.appendChild(td_null4)
  tr_totalBill.appendChild(td_totalBill)
  tbl_body.appendChild(tr_totalBill)
}

showCart()

function changeQuantityItems() {
  var btns = document.querySelectorAll(".cart_quantity_btn")
  btns.forEach((btn) => {
    btn.addEventListener("click", function () {
      let idString = btn.getAttribute("id")
      let item = {}
      console.log(idString)
      if (idString.startsWith("subtract")) {
        item.type = "subtract"
      } else {
        item.type = "plus"
      }

      let words = idString.split("_", 2)
      //console.log(words);
      item.pos = parseInt(words[1])
      console.log(item)
      //cartNums(item);
      if (item.type == "subtract") {
        console.log("item.type == subtract is true, pos =", item.pos)
        subtractItem(item.pos)
      }
      if (item.type == "plus") {
        addItem(item.pos)
      }

      let itemNums = localStorage.getItem("cartNums")
      itemNums = parseInt(itemNums)
      console.log("Cart num is:", itemNums)
      let cartItems = localStorage.getItem("itemsOnCart")
      cartItems = JSON.parse(cartItems)
      console.log("My cartItems are: ", cartItems)
      let cartBill = localStorage.getItem("totalBill")
      console.log("Total bill: ", cartBill)
    })
  })
}

function checkout() {
  var submit_btn = document.getElementById("checkout-button");
  submit_btn.onclick = () => {
     actions.request
    .post("/checkout/" + totalPayment)
  }
}

changeQuantityItems()

function subtractItem(pos) {
  let cartItems = localStorage.getItem("itemsOnCart")
  cartItems = JSON.parse(cartItems)
  if (cartItems[pos].oncart >= 1) {
    cartItems[pos].oncart = cartItems[pos].oncart - 1
    localStorage.setItem("itemsOnCart", JSON.stringify(cartItems))
    let itemNums = localStorage.getItem("cartNums")
    itemNums = parseInt(itemNums)
    localStorage.setItem("cartNums", itemNums - 1)
    subtractCost(pos)
    console.log(
      "new values: pos =",
      pos,
      "quantity = ",
      cartItems[pos].oncart,
      "total = ",
      parseInt(cartItems[pos].price) * parseInt(cartItems[pos].oncart)
    )
    refreshBill(
      pos,
      cartItems[pos].oncart,
      parseInt(cartItems[pos].price) * parseInt(cartItems[pos].oncart)
    )
  }
}

function addItem(pos) {
  let cartItems = localStorage.getItem("itemsOnCart")
  cartItems = JSON.parse(cartItems)

  if (cartItems[pos].oncart <= 5) {
    cartItems[pos].oncart = cartItems[pos].oncart + 1
    localStorage.setItem("itemsOnCart", JSON.stringify(cartItems))
    let itemNums = localStorage.getItem("cartNums")
    itemNums = parseInt(itemNums)
    localStorage.setItem("cartNums", itemNums + 1)
    addCost(pos)
    console.log(
      "new values: pos =",
      pos,
      "quantity = ",
      cartItems[pos].oncart,
      "total = ",
      parseInt(cartItems[pos].price) * parseInt(cartItems[pos].oncart)
    )
    refreshBill(
      pos,
      cartItems[pos].oncart,
      parseInt(cartItems[pos].price) * parseInt(cartItems[pos].oncart)
    )
  }
}

function subtractCost(pos) {
  //console.log("Price: ", item.price, "type of ", typeof (item.price));
  let cartBill = localStorage.getItem("totalBill")
  let cartItems = localStorage.getItem("itemsOnCart")
  cartItems = JSON.parse(cartItems)
  price = cartItems[pos].price
  //cartBill = parseFloat(cartBill);
  localStorage.setItem("totalBill", parseInt(cartBill) - price)
  //console.log('in subtractCost, totalBill = ', parseInt(cartBill) - price);
}

function addCost(pos) {
  //console.log("Price: ", item.price, "type of ", typeof (item.price));
  let cartBill = localStorage.getItem("totalBill")
  let cartItems = localStorage.getItem("itemsOnCart")
  cartItems = JSON.parse(cartItems)
  price = cartItems[pos].price
  //cartBill = parseFloat(cartBill);
  localStorage.setItem("totalBill", parseInt(cartBill) + price)
}

function refreshBill(pos, newQ, newT) {
  //console.log('td_quantity_' + pos);
  var quantity = document.querySelector("#td_quantity_" + pos)
  var total = document.querySelector("#td_total_" + pos)
  var bill = document.querySelector("#td_totalBill")
  let cartBill = localStorage.getItem("totalBill")
  //    console.log(quantity);
  quantity.innerText = "x " + newQ
  total.innerText = "$" + newT
  bill.innerText = "$" + cartBill
}