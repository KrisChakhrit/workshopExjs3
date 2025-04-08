var mongoose = require('mongoose')
var Schema = mongoose.Schema


var orderSchema = new  Schema({
    name:{type:String},
    productId:{type: Schema.Types.ObjectId,ref:'products',require:true},
    ordernum:{type:Number, require:true}
}) 


module.exports = mongoose.model('orders', orderSchema);