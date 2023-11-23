const express = require("express")
const mongoClient = require("mongodb")

const mongo_funcs = require("./js/mongoDB_funcs")
const _mongoUrl = process.env._MONGODB_URI
const paypalClientID = process.env._PAYPAL_CLIENTID
const paypalSecret = process.env._PAYPAL_SECRET
const MYDOMAIN = process.env._APP_DOMAIN
const _stripeKey = process.env._STRIPE_KEY
const stripe = require("stripe")(_stripeKey)

const _db = "myproject" // database of the project
const _paymentsCollection = "payments_stripe_paypal"
const _shopCollection = "shopping"

const port = process.env._PORT || 5000

const app = express()
app.use(express.urlencoded({ extended: true }))

app.set("views", __dirname + "/views");
app.set("view engine", "pug")
app.use(express.static(__dirname + "/public"));

app.listen(port, function () {
  console.log(`My project Online Shop running at port ${port}`)
})


function renderShopMongoDB(page, clearCart, res) {
  mongoClient.connect(_mongoUrl, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo
      .collection(_shopCollection)
      .find({ visible: true })
      .toArray(function (err, records) {
        if (err) throw err
        db.close()
        if (!records || records == null || records.length === 0) {
          res.render(page, { listItems: false, clearcart: clearCart })
        } else {
          records.map(function (record, index) {
            record.pos = index
          })
          res.render(page, { listItems: records, clearcart: clearCart })
        }
      })
  })
}

app.get("/", function (req, res) {
  renderShopMongoDB("shop", false, res)
})

///////////////////////////////////SHOP PAGES /////////////////////
app.get("/shop", function (req, res) {
  renderShopMongoDB("shop", false, res)
})

app.get("/cart", function (req, res) {
  renderShopMongoDB("cart", false, res)
})

app.get("/clearcart", function (req, res) {
  renderShopMongoDB("shop", true, res)
})

app.get("/checkout", function (req, res) {
  renderShopMongoDB("checkout", false, res)
})

///////////////////////////////////PAYMENT RETURN PAGES/////////////////////

app.get("/paymentsuccess", (req, res) => {
  res.render("success")
})

app.get("/paymentcancel", (req, res) => {
  res.render("cancel")
})

app.get("/return", (req, res) => {
  res.render("return")
})

////////////////////////////////STRIPE PAYMENT////////////////////////////////

app.post("/create-checkout-session/:totalpayment", async (req, res) => {
  var totalpayment = parseInt(req.params.totalpayment)

  let transaction = {}
  transaction.totalpayment = totalpayment
  transaction.payment_method = "stripe"
  let today = new Date()
  transaction.create_time = today.toISOString()

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price_data: {
          currency: "CAD",
          product_data: {
            name: "Price Monitor",
            images: [
              "https://www.elearnexcel.com/wp-content/uploads/2013/08/Stripe-Logo.png",
            ],
          },
          unit_amount: totalpayment * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${MYDOMAIN}/return`,
  })

  transaction.id = session.id
  transaction.amount = session.amount_total
  transaction.payment_method_id =
    session.payment_method_configuration_details.id
  transaction.currency = session.currency
  transaction.created = new Date(session.created).toISOString()

  res.send({ clientSecret: session.client_secret })

  mongo_funcs.insertMongoDB(_paymentsCollection, transaction)
})

app.get("/session-status", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id)

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  })
})

///////////////////////////////////// PAYPAL PAYMENT//////////////////////////////////

const request = require("request")
var CLIENT = paypalClientID
var SECRET = paypalSecret
var PAYPAL_API = "https://api-m.sandbox.paypal.com"
// Add your credentials:
// Add your client ID and secret
//express()
// Set up the payment:
// 1. Set up a URL to handle requests from the PayPal button
app.post("/paypal/create-payment/:totalPayment", function (req, res) {
  //console.log(".ENV VARS ", CLIENT, SECRET, MYDOMAIN);
  // 2. Call /v1/payments/payment to set up the payment
  //console.log(req.params);
  var totalPayment = req.params.totalPayment
  //console.log(totalPayment);
  request.post(
    PAYPAL_API + "/v1/payments/payment",
    {
      auth: {
        user: CLIENT,
        pass: SECRET,
      },
      body: {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        transactions: [
          {
            amount: {
              total: totalPayment,
              currency: "CAD",
            },
          },
        ],
        redirect_urls: {
          return_url: `${MYDOMAIN}/paymentsuccess`,
          cancel_url: `${MYDOMAIN}/paymentcancel`,
        },
      },
      json: true,
    },
    function (err, response) {
      if (err) {
        console.error(err)
        return res.sendStatus(500)
      }
      // 3. Return the payment ID to the client
      res.json({
        id: response.body.id,
      })
    }
  )
})
// Execute the payment:
// 1. Set up a URL to handle requests from the PayPal button.
app.post("/paypal/execute-payment/:totalPayment", function (req, res) {
  // 2. Get the payment ID and the payer ID from the request body.
  let transaction = {}
  var totalPayment = parseInt(req.params.totalPayment)
  transaction.totalpayment = totalPayment
  var paymentID = req.body.paymentID
  var payerID = req.body.payerID
  // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
  request.post(
    PAYPAL_API + "/v1/payments/payment/" + paymentID + "/execute",
    {
      auth: {
        user: CLIENT,
        pass: SECRET,
      },
      body: {
        payer_id: payerID,
        transactions: [
          {
            amount: {
              total: totalPayment,
              currency: "CAD",
            },
          },
        ],
      },
      json: true,
    },
    function (err, response) {
      if (err) {
        console.error("Throw error :::", err)
        return res.sendStatus(500)
      }
      // 4. Return a success response to the client
      transaction.payment_method = response.body.payer.payment_method
      transaction.id = response.body.id
      transaction.create_time = response.body.create_time
      transaction.payer_info = response.body.payer.payer_info
      transaction.currency = response.body.transactions[0].amount.currency
      mongo_funcs.insertMongoDB(_paymentsCollection, transaction)

      // console.log("Transaction information ::", response.body.payer.payment_method, response.body.id, response.body.create_time,
      //     response.body.payer.payer_info, response.body.transactions[0].amount.total,
      //     response.body.transactions[0].amount.currency);
      res.json({
        status: "success",
      })
    }
  )
})
