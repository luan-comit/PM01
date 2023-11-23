function checkoutPayments() {
    // Paypal button process
    paypal.Button.render(
      {
        env: "sandbox", // Or 'production'
        // Set up the payment:
        // 1. Add a payment callback
        client: {
          sandbox:
            "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R",
        },
        commit: true,
        payment: function (data, actions) {
          // 2. Make a request to your server
          return actions.request
            .post("/paypal/create-payment/" + totalPayment)
            .then(function (res) {
              // 3. Return res.id from the response
              return res.id
            })
        },
        // Execute the payment:
        // 1. Add an onAuthorize callback
        onAuthorize: function (data, actions) {
          // 2. Make a request to your server
          let totalPayment = localStorage.getItem("totalBill")
          return actions.request
            .post("/paypal/execute-payment/" + totalPayment, {
              paymentID: data.paymentID,
              payerID: data.payerID,
            })
            .then(function (res) {
              // 3. Show the buyer a confirmation message.
              return actions.payment.execute().then(function () {
                window.alert("Payment Complete!")
              })
            })
        },
      },
      "#paypal-button"
    )
  }

  checkoutPayments();
