const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const rotaSensor = require('./control/rota_sensor');

const app = express();

// Conexão com o MongoDB Atlas
const mongoURI = 'mongodb+srv://raulcvf:raulcvf2007@cluster0.0vxks.mongodb.net/fluvioapp?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB:'));
db.once('open', () => {
    console.log('Conectado ao MongoDB Atlas');

    // Configurações do Express
    app.use(express.json());
    app.use(fileUpload());
    app.use(express.static(path.join(__dirname, 'view')));

    // Rotas
    rotaSensor(app, db);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`http://localhost:${PORT}/home.html`)
        console.log(`http://localhost:${PORT}/medidor.html`)
        console.log(`http://localhost:${PORT}/login.html`)
    });

    /*
    // Simulação de dados via MQTT
    const client = mqtt.connect('mqtt://broker.hivemq.com');

    client.on('connect', function () {
        console.log('Conectado ao broker MQTT');

        // Função para enviar dados simulados dos sensores
        function sendFakeData() {
            const sensorData = {
                id: Math.floor(Math.random() * 1000), // ID do sensor
                type: 'fluviometrico', // Tipo de sensor
                waterLevel: (Math.random() * 100).toFixed(2), // Nível da água
                quality: (Math.random() * 100).toFixed(2), // Qualidade da água
                temperature: (Math.random() * 35).toFixed(2), // Temperatura do ar
                humidity: (Math.random() * 100).toFixed(2), // Umidade do ar
                latitude: -23.5505,
                longitude: -46.6333
            };

            // Publica os dados no tópico 'fluvioApp/sensorData'
            client.publish('fluvioApp/sensorData', JSON.stringify(sensorData));
            console.log('Dados enviados:', sensorData);
        }

        // Enviar dados a cada 60 segundos
        setInterval(sendFakeData, 60000);
    });

    client.on('error', function (error) {
        console.error('Erro ao conectar no broker MQTT:', error);
    });
    */
});
