const mongoClient = require("mongodb").MongoClient

const dotenv = require("dotenv")
dotenv.config()
const _mongoUrl = process.env._MONGODB_URI

//database of the project
const _db = "myproject"
const _itemFetchCollection = "items_fetch"
const _shoppingCollection = "shopping"

async function insertMongoDB(_collection, _object) {
  mongoClient.connect(_mongoUrl, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err
    var dbo = db.db(_db)
    dbo.collection(_collection).insertOne(_object, function (err, res) {
      if (err) throw err
      console.log("1 document inserted")
      db.close()
    })
  })
}

module.exports = {
  insertMongoDB,
}
