const mondoose = require('mongoose');
const Schema = mondoose.Schema;

const schema = new Schema({
  weatherList: {
    type: Object,
  },
  cityImages:{
    type: Object
  },
  currentWeather: {
    type: Object
  },
  owner: {
    type: Schema.Types.ObjectID,
    ref: 'User'
  },
  nameCity: {
    type: String,
    required: true,
    unique: true
  }

},{
  timestamps: true
})

schema.set('toJSON',{
  viruals: true
})

module.exports = mondoose.model('UserWeatherList', schema);
