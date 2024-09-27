const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  state: { type: String, required: true },
  city: { type: String, require: true },
  readings: [
    {
      timestamp: { type: Date, default: Date.now },
      data: mongoose.Mixed
    }
  ]
});

const Sensor = mongoose.model('Sensor', sensorSchema);

module.exports = {
  createSensor: function(data, callback) {
    const newSensor = new Sensor(data);
    // Usando Promises ao invés de callbacks
    newSensor
      .save()
      .then(result => callback(null, result))
      .catch(err => callback(err, null));
  },

  getSensors: function(callback) {
    Sensor.find({}, function(err, results) {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  getSensorById: function(id, callback) {
    Sensor.findById(id, function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  updateSensor: function(id, updateData, callback) {
    Sensor.findByIdAndUpdate(id, updateData, { new: true }, function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  },

  deleteSensor: function(id, callback) {
    Sensor.findByIdAndDelete(id, function(err, result) {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  }
};
