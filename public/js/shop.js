
var addCart = document.querySelectorAll(".addCart");

for (let i = 0; i < listItems.length; i++) {
listItems[i].oncart = 0;
//console.log('item', i , listItems[i]);
}


for (let i = 0; i < listItems.length; i++) {
    addCart[i].addEventListener('click', () => {
        cartNums(listItems[i]);
        //console.log(listItems[i]);
    })
}

function onloadItemNums(){
    let itemNums = localStorage.getItem('cartNums');
    if(itemNums){
        document.getElementById("cartCount").textContent = itemNums;
    }else{
        document.getElementById("cartCount").textContent = 0;
    }

}

function cartNums(item){
    //console.log(item);
    let itemNums = localStorage.getItem('cartNums');
    itemNums = parseInt(itemNums);
    //console.log(itemNums);

    if (itemNums) {
        localStorage.setItem('cartNums', itemNums + 1);
        document.getElementById("cartCount").textContent = itemNums + 1;
    }else{
        localStorage.setItem('cartNums', 1);
        document.getElementById("cartCount").textContent = 1;
    }
    setItems(item);
    addCost(item);
}

function setItems(item){
    let cartItems = localStorage.getItem('itemsOnCart');
    cartItems = JSON.parse(cartItems);
    console.log("My cartItems are: ", cartItems);
    if(cartItems != null){
        if (cartItems[item.pos] == undefined) {
            cartItems = {
                ...cartItems,
                [item.pos] : item
            }
        }  
        cartItems[item.pos].oncart += 1;
    } else {
        item.oncart = 1;
        cartItems = {
            [item.pos]: item
        }
      }
    
    localStorage.setItem('itemsOnCart', JSON.stringify(cartItems));

}

function addCost(item) {
    console.log("Price: ", item.price, "type of ", typeof(item.price));
    let cartBill = localStorage.getItem('totalBill');
    //cartBill = parseFloat(cartBill);
    if (cartBill != null) {
        localStorage.setItem('totalBill', parseInt(cartBill) + item.price);
    } else {
        localStorage.setItem('totalBill', item.price);
    }
}

function clearCart(){
    if (clearcart) {
        localStorage.clear();
        onloadItemNums();
    }
}
onloadItemNums();
clearCart();
