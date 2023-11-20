const mongoClient = require("mongodb").MongoClient
mongoClient.set('useNewUrlParser', true);
mongoClient.set('useFindAndModify', false);
mongoClient.set('useCreateIndex', true);
mongoClient.set('useUnifiedTopology', true);

const dotenv = require("dotenv")
dotenv.config()
const _mongoUrl = process.env._MONGODB_URI

//database of the project
const _db = "myproject"
const _itemFetchCollection = "items_fetch"
const _shoppingCollection = "shopping"

async function insertMongoDB(_collection, _object) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo.collection(_collection).insertOne(_object, function (err, res) {
      if (err) throw err
      console.log("1 document inserted")
      db.close()
    })
  })
}

async function deleteFetchMongoDB(_email, _url) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo
      .collection(_itemFetchCollection)
      .deleteOne({ email: _email, url: _url }, function (err, res) {
        if (err) throw err
        console.log("1 document deleted ")
        db.close()
      })
  })
}

async function deleteItemShopMongoDB(_filter) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo.collection(_shoppingCollection).deleteOne(_filter, function (err, res) {
      if (err) throw err
      console.log("1 item removed from shop ")
      db.close()
    })
  })
}

async function deleteGraphMongoDB(_url) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo
      .collection(_itemFetchCollection)
      .deleteOne({ url: _url }, function (err, res) {
        if (err) throw err
        console.log("1 document deleted ")
        db.close()
      })
  })
}

async function insertArrayMongoDB(_collection, _objectArray) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo.collection(_collection).insertMany(_objectArray, function (err, res) {
      if (err) throw err
      console.log(" documentArray inserted")
      db.close()
    })
  })
}

async function checkUrlMongoDB(_collection, _url) {
  return mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    var result
    console.log("url before check db", _url)
    dbo.collection(_collection).findOne({ url: _url }, function (err, res) {
      if (err) throw err
      console.log("checkUrl: ", res)
      if (!res || res.length == 0) {
        console.log("no url found")
        db.close()

        result = false
      } else {
        console.log("1 url found")
        db.close()

        result = true
      }
    })
    return result
  })
}

async function querySavedItemsMongoDB(_collection, _email) {
  //check if item (url) exist in DB and insert if not exist
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo
      .collection(_collection)
      .find({ email: _email })
      .toArray(function (err, records) {
        if (err) throw err

        if (!records || records == null || records.length === 0) {
          console.log("values send to monitor.pug is null ", _email)
          db.close()
          return false
          //res.render('monitor', { listItems: false, logged: req.session.isAuth, email: req.session.email })
        } else {
          records.map(function (record, index) {
            record.pos = index
            //console.log(record.date);
            let rawDate = new Date(record.date)
            let displaydate =
              rawDate.getDate() +
              "/" +
              (rawDate.getMonth() + 1) +
              "/" +
              rawDate.getFullYear() +
              "\n" +
              rawDate.getHours() +
              ":" +
              rawDate.getMinutes()
            //console.log(displaydate);
            record.date = displaydate
            //console.log(record.date);
            if (record.saving) {
              let lens = record.saving.length
              let lenp = record.price.length
              //console.log("Price origin : ", record.price,'/' ,record.price.slice(1, lenp));
              //console.log("Saving origin : ", record.saving, '/', record.saving.slice(6, lens));
              record.price_list =
                "$" +
                (
                  parseFloat(record.price.slice(1, lenp)) +
                  parseFloat(record.saving.slice(6, lens))
                ).toString()
              //console.log("Price listed after parsed  ", record.price_list);
            } else {
              if (record.price_list) {
                //console.log("Price list before:  ", record.price_list);
                let len = record.price_list.length
                //console.log("Parsed::: ", parseFloat(record.price_list.slice(2, len)));
                record.price_list =
                  "$" + parseFloat(record.price_list.slice(2, len)).toString()
                //console.log("Price listed after parsed  ", record.price_list);
              }
            }
          })
          db.close()
          console.log(
            "values send to monitor.pug :::::::: ",
            _email,
            "\n",
            records
          )
          return records
        }
      })
  })
}

// queryShopMongoDB query all the items in the shop collection to display to manageshop.pug

async function queryReturnItemMongoDB(_collection, _url) {
  mongoClient.connect(_mongoUrl, 
 {useNewUrlParser: true}, async function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    //console.log('url to check db', _url);
    dbo.collection(_collection).findOne({ url: _url }, function (err, item) {
      if (err) throw err
      if (!item || item == null) {
        console.log("no item found")
        db.close()
        return
      } else {
        console.log("1 item found, now insert to shop")
        db.close()
        item.visible = false
        console.log(item)
        insertMongoDB(_shoppingCollection, item)
      }
    })
  })
}

module.exports = {
  insertMongoDB,
  insertArrayMongoDB,
  checkUrlMongoDB,
  deleteFetchMongoDB,
  deleteGraphMongoDB,
  querySavedItemsMongoDB,
  queryReturnItemMongoDB,
  deleteItemShopMongoDB,
}
