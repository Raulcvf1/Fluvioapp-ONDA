const Sensor = require('../model/Sensor');

module.exports = function(app, banco) {
  // Rota para criar um novo sensor
  app.post('/sensor', function(req, res) {
    const sensorData = {
      name: req.body.name,
      type: req.body.type,
      coordinates: {
        latitude: req.body.latitude,
        longitude: req.body.longitude
      },
      state: req.body.state,
      city: req.body.city
    };

    Sensor.createSensor(sensorData, function(err, result) {
        if (err) {
            return res.status(500).json({ status: false, msg: 'Erro ao criar sensor.' });
        }
        res.status(201).json({ status: true, data: result });
    });
  });

  // Rota para obter todos os sensores
  app.get('/sensor', function(req, res) {
    Sensor.getSensors(function(err, results) {
        if (err) {
            return res.status(500).json({ status: false, msg: 'Erro ao obter sensores.' });
        }
        res.status(200).json({ status: true, data: results });
    });
  });

  // Rota para obter um sensor por ID
  app.get('/sensor/:id', function(req, res) {
    const sensorId = req.params.id;
    Sensor.getSensorById(sensorId, function(err, result) {
      if (err) {
        return res.status(500).json({ status: false, msg: 'Erro ao obter sensor.' });
      }
      res.status(200).json({ status: true, data: result });
    });
  });

  // Rota para atualizar um sensor
  app.put('/sensor/:id', function(req, res) {
    const sensorId = req.params.id;
    const updateData = req.body;

    Sensor.updateSensor(sensorId, updateData, function(err, result) {
      if (err) {
        return res.status(500).json({ status: false, msg: 'Erro ao atualizar sensor.' });
      }
      res.status(200).json({ status: true, data: result });
    });
  });

  // Rota para excluir um sensor
  app.delete('/sensor/:id', function(req, res) {
    const sensorId = req.params.id;

    Sensor.deleteSensor(sensorId, function(err, result) {
      if (err) {
        return res.status(500).json({ status: false, msg: 'Erro ao excluir sensor.' });
      }
      res.status(200).json({ status: true, data: result });
    });
  });
};
