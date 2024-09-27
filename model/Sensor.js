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
    city: { type: String, required: true },
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
        newSensor
            .save()
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    getSensors: function(callback) {
        Sensor.find({})
            .then(results => callback(null, results))
            .catch(err => callback(err, null));
    },

    getSensorById: function(id, callback) {
        Sensor.findById(id)
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    getSensorsByStateAndCity: function(state, city, callback) {
        Sensor.find({ state: state, city: city })
            .then(results => callback(null, results))
            .catch(err => callback(err, null));
    },

    getSensorsByState: function(state, callback) {
        Sensor.find({ state: state })
            .then(results => callback(null, results))
            .catch(err => callback(err, null));
    },

    updateSensor: function(id, updateData, callback) {
        Sensor.findByIdAndUpdate(id, updateData, { new: true })
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    },

    deleteSensor: function(id, callback) {
        Sensor.findByIdAndDelete(id)
            .then(result => callback(null, result))
            .catch(err => callback(err, null));
    }
};
