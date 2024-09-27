const btnSensor = document.getElementById("btnSensor");
const txtNome = document.getElementById("txtNome");
const dropTipo = document.getElementById("dropTipo");
const txtLatitude = document.getElementById("txtLatitude");
const txtLogintude = document.getElementById("txtLogintude");

// Inicializar o mapa quando o modal é aberto
document.getElementById("sensorModal").addEventListener("shown.bs.modal", function () {
    initializeMap();
});

// Variável para armazenar o mapa Leaflet
let map;
let marker;

// Função para inicializar o mapa
function initializeMap() {
    // Verifica se o mapa já foi inicializado para evitar recriação
    if (map) {
        return;
    }

    map = L.map('map').setView([-14.2350, -51.9253], 4); // Centro do Brasil com zoom inicial

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
       
        // Verifica se o ponto está dentro do Brasil
        if (isValidBrazilCoordinates(lat, lng)) {
            // Converter lat e lng para string e substituir vírgula por ponto
            txtLatitude.value = lat.toFixed(6).toString().replace(',', '.');
            txtLogintude.value = lng.toFixed(6).toString().replace(',', '.');

            // Se já houver um marcador, remova-o
            if (marker) {
                map.removeLayer(marker);
            }

            // Adiciona um marcador na posição clicada
            marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`Latitude: ${lat.toFixed(6)}<br>Longitude: ${lng.toFixed(6)}`)
                .openPopup();
        } else {
            alert("Clique dentro dos limites do Brasil.");
        }
    });
}

// Função para validar se as coordenadas estão dentro dos limites do Brasil
function isValidBrazilCoordinates(latitude, longitude) {
    const latMin = -33.742; // Latitude mínima do Brasil
    const latMax = 5.272; // Latitude máxima do Brasil
    const longMin = -73.983; // Longitude mínima do Brasil
    const longMax = -34.793; // Longitude máxima do Brasil

    return latitude >= latMin && latitude <= latMax && longitude >= longMin && longitude <= longMax;
}

btnSensor.onclick = onclick_btnSensor;

function onclick_btnSensor() {
    let v_nome = txtNome.value;
    let v_tipo = dropTipo.value;
    let v_latitude = parseFloat(txtLatitude.value.replace(',', '.')); // Garantindo que o valor está com ponto
    let v_longitude = parseFloat(txtLogintude.value.replace(',', '.')); // Garantindo que o valor está com ponto

    // Verificar se os campos de latitude e longitude estão preenchidos
    if (!v_latitude || !v_longitude) {
        alert("Por favor, selecione um ponto no mapa.");
        return;
    }

    // Buscar o estado e a cidade com base nas coordenadas e criar o sensor
    getLocationFromCoordinates(v_latitude, v_longitude)
        .then(({ state, city }) => {
            if (state && city) {
                const objJson = {
                    name: v_nome,
                    type: v_tipo,
                    latitude: v_latitude,
                    longitude: v_longitude,
                    state: state,
                    city: city // Cidade mais próxima determinada
                };

                fetch_post_createSensor(objJson);
            } else {
                alert("Não foi possível determinar o estado ou cidade para as coordenadas fornecidas.");
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar a localização:", error);
            alert("Ocorreu um erro ao buscar a localização. Por favor, tente novamente.");
        });
}

// Função para buscar o estado e a cidade com base nas coordenadas
function getLocationFromCoordinates(latitude, longitude) {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

    return fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log("Dados recebidos da API Nominatim:", data); // Adicionado log para depuração

            if (data && data.address) {
                return {
                    state: data.address.state || null,
                    city: data.address.city || data.address.town || data.address.village || data.address.municipality || null
                };
            } else {
                return { state: null, city: null };
            }
        });
}

// Função para enviar os dados do sensor para a API
function fetch_post_createSensor(objJson) {
    // Converte o objeto recebido em um texto JSON
    const stringJson = JSON.stringify(objJson);

    // Determina a URI do serviço na API
    const uri = "/sensor";

    fetch(uri, {
        method: "POST",
        body: stringJson,
        headers: {
            Accept: "application/json", // Aceita JSON como resposta da API
            "Content-Type": "application/json", // Informa que irá enviar para API conteúdo em JSON
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Erro: ${response.statusText}`);
        }
        return response.json(); // Corrigido para response.json() ao invés de response.text()
    })
    .then((jsonResposta) => {
        // É executado quando a API "JS" responde.
        console.log("RECEBIDO:", jsonResposta);

        if (jsonResposta.status === true) {
            console.log(jsonResposta);
            alert("Sensor cadastrado com sucesso!");
            location.reload();
        } else {
            console.log(jsonResposta.msg);
            alert("Erro ao cadastrar o sensor: " + jsonResposta.msg);
        }
    })
    .catch((error) => {
        // Caso aconteça algum erro o catch é chamado e o erro é apresentado no console do navegador
        console.error("Error:", error);
        alert("Ocorreu um erro ao cadastrar o sensor. Por favor, tente novamente.");
    });
}
