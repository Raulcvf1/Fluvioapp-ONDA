document.addEventListener('DOMContentLoaded', function () {
    const chartElement = document.getElementById('nivelRiosChart');
    let nivelRiosChart;

    // Função para atualizar os elementos de localização
    function atualizarLocalizacao(label) {
        document.getElementById('lblNomeLocalizacao').textContent = label;
        document.getElementById('cidadeEstadoChuva').textContent = label;
        document.getElementById('cidadeEstadoChuva2').textContent = label;
        document.getElementById('cidadeEstadoVento').textContent = label;
    }

    // Função para atualizar os iframes de Windy
    function atualizarIframes(lat, lon) {
        const iframeVento = document.getElementById('iframeVento');
        const iframeChuva = document.getElementById('iframeChuva');
        iframeVento.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=10&level=surface&overlay=wind&menu=&message=&marker=&calendar=24&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
        iframeChuva.src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=10&level=surface&overlay=rain&menu=&message=&marker=&calendar=24&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    }

    // Carregar estados
    function carregarEstados() {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => response.json())
            .then(states => {
                const stateSelect = document.getElementById('inputGroupSelect02');
                stateSelect.innerHTML = '<option value="null">Escolha o seu Estado</option>';
                states.sort((a, b) => a.nome.localeCompare(b.nome));
                states.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state.nome;
                    option.setAttribute('data-id', state.id);
                    option.textContent = state.nome;
                    stateSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao carregar estados:', error);
                alert('Erro ao carregar estados. Verifique sua conexão.');
            });
    }

    carregarEstados(); // Chamar função ao carregar a página

    // Função para carregar cidades com base no estado selecionado
    function carregarCidades(stateId) {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
            .then(response => response.json())
            .then(cities => {
                const citySelect = document.getElementById('inputGroupSelectCity');
                citySelect.innerHTML = '<option value="null">Escolha a sua Cidade</option>';
                cities.sort((a, b) => a.nome.localeCompare(b.nome));
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome;
                    option.setAttribute('data-id', city.id);
                    option.textContent = city.nome;
                    citySelect.appendChild(option);
                });
                citySelect.disabled = false;
            })
            .catch(error => {
                console.error('Erro ao carregar cidades:', error);
                alert('Erro ao carregar cidades. Verifique sua conexão.');
            });
    }

    // Função para buscar e atualizar o gráfico de volume de chuva usando a API Open-Meteo
    function fetchDataAndUpdateChart(lat, lon, label) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const labels = Array.from({ length: data.hourly.precipitation.length }, (_, i) => `Hora ${i}`);
                const volumes = data.hourly.precipitation;

                updateChart(labels, volumes, label);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API Open-Meteo:', error);
                alert('Erro ao buscar dados de volume de chuva. Verifique sua conexão ou tente novamente mais tarde.');
            });
    }

    function updateChart(labels, data, label) {
        if (nivelRiosChart) {
            nivelRiosChart.destroy(); // Destrói o gráfico existente para evitar sobreposição
        }

        nivelRiosChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Volume de Chuva - ${label}`,
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Função para atualizar o gráfico e o local
    function updateLocation(lat, lon, label) {
        atualizarLocalizacao(label);
        atualizarIframes(lat, lon);
        fetchDataAndUpdateChart(lat, lon, label);
    }

    // Evento de mudança no seletor de estados
    document.getElementById('inputGroupSelect02').addEventListener('change', function () {
        const selectedStateId = this.options[this.selectedIndex].getAttribute('data-id');
        const selectedStateName = this.value;

        const citySelect = document.getElementById('inputGroupSelectCity');
        if (selectedStateName === 'null') {
            citySelect.innerHTML = '<option value="null">Escolha a sua Cidade</option>';
            citySelect.disabled = true;
            atualizarLocalizacao('Brasil');
            return;
        }

        citySelect.innerHTML = '<option value="null">Carregando...</option>';
        citySelect.disabled = true;

        // Atualizar local de exibição
        atualizarLocalizacao(selectedStateName);

        // Carregar as cidades para o estado selecionado
        carregarCidades(selectedStateId);

        // Obter as coordenadas do estado selecionado via API do IBGE
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedStateId}`)
            .then(response => response.json())
            .then(stateData => {
                const lat = stateData.latitude;
                const lon = stateData.longitude;
                updateLocation(lat, lon, selectedStateName);
            })
            .catch(error => console.error('Erro ao buscar coordenadas do estado:', error));

        // Atualizar sensores para o estado selecionado
        fetch(`/sensor/filtro/${encodeURIComponent(selectedStateName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    const divSensores = document.getElementById('divSensores');
                    divSensores.innerHTML = '';

                    for (let i = 0; i < data.data.length; i += 3) {
                        const rowDiv = document.createElement('div');
                        rowDiv.classList.add('row');

                        for (let j = i; j < i + 3 && j < data.data.length; j++) {
                            const sensor = data.data[j];
                            const colDiv = document.createElement('div');
                            colDiv.classList.add('col');

                            colDiv.innerHTML = `
                                <div class="mt-4 p-5 bg-light text-dark rounded">
                                    <div class="d-flex justify-content-between mb-4">
                                        <h1>${sensor.name}</h1>
                                        <button type="button" class="btn btn-warning" onclick="abrirModalAtualizar('${sensor._id}')">
                                            Atualizar
                                        </button>
                                        <button type="button" class="btn btn-danger" onclick="excluirSensor('${sensor._id}')">
                                            Excluir
                                        </button>
                                    </div>
                                    <p>Tipo: ${sensor.type}</p>
                                    <p>Coordenadas: ${sensor.coordinates.latitude}, ${sensor.coordinates.longitude}</p>
                                </div>`;
                            rowDiv.appendChild(colDiv);
                        }
                        divSensores.appendChild(rowDiv);
                    }
                } else {
                    console.error('Erro ao buscar sensores:', data.msg);
                }
            })
            .catch(error => console.error('Erro ao buscar sensores:', error));
    });

    // Evento de mudança no seletor de cidades
    document.getElementById('inputGroupSelectCity').addEventListener('change', function () {
        const selectedCityName = this.value;
        const selectedCityId = this.options[this.selectedIndex].getAttribute('data-id');
        const selectedStateName = document.getElementById('inputGroupSelect02').value;

        if (selectedCityName === 'null') {
            atualizarLocalizacao(selectedStateName);
            return;
        }

        // Atualizar local de exibição
        atualizarLocalizacao(selectedCityName);

        // Buscar coordenadas da cidade selecionada via API do IBGE
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${selectedCityId}`)
            .then(response => response.json())
            .then(cityData => {
                const lat = cityData.microrregiao.mesorregiao.UF.latitude;  // Latitude da cidade
                const lon = cityData.microrregiao.mesorregiao.UF.longitude; // Longitude da cidade
                updateLocation(lat, lon, selectedCityName);
            })
            .catch(error => console.error('Erro ao buscar coordenadas da cidade:', error));

        // Carregar e exibir sensores para a cidade selecionada
        fetch(`/sensor/filtro/${encodeURIComponent(selectedStateName)}/${encodeURIComponent(selectedCityName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    const divSensores = document.getElementById('divSensores');
                    divSensores.innerHTML = '';

                    for (let i = 0; i < data.data.length; i += 3) {
                        const rowDiv = document.createElement('div');
                        rowDiv.classList.add('row');

                        for (let j = i; j < i + 3 && j < data.data.length; j++) {
                            const sensor = data.data[j];
                            const colDiv = document.createElement('div');
                            colDiv.classList.add('col');

                            colDiv.innerHTML = `
                                <div class="mt-4 p-5 bg-light text-dark rounded">
                                    <div class="d-flex justify-content-between mb-4">
                                        <h1>${sensor.name}</h1>
                                        <button type="button" class="btn btn-warning" onclick="abrirModalAtualizar('${sensor._id}')">
                                            Atualizar
                                        </button>
                                        <button type="button" class="btn btn-danger" onclick="excluirSensor('${sensor._id}')">
                                            Excluir
                                        </button>
                                    </div>
                                    <p>Tipo: ${sensor.type}</p>
                                    <p>Coordenadas: ${sensor.coordinates.latitude}, ${sensor.coordinates.longitude}</p>
                                </div>`;
                            rowDiv.appendChild(colDiv);
                        }
                        divSensores.appendChild(rowDiv);
                    }
                } else {
                    console.error('Erro ao buscar sensores:', data.msg);
                }
            })
            .catch(error => console.error('Erro ao buscar sensores:', error));
    });

    // Funções para atualização e exclusão de sensores
    function abrirModalAtualizar(sensorId) {
        fetch(`/sensor/${sensorId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    const sensor = data.data;

                    document.getElementById('txtNomeAtualizar').value = sensor.name;
                    document.getElementById('dropTipoAtualizar').value = sensor.type;

                    // Inicializar o mapa de visualização
                    const mapVisualizacao = L.map('mapVisualizacao').setView([sensor.coordinates.latitude, sensor.coordinates.longitude], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(mapVisualizacao);

                    L.marker([sensor.coordinates.latitude, sensor.coordinates.longitude]).addTo(mapVisualizacao)
                        .bindPopup(`<b>${sensor.name}</b><br>${sensor.coordinates.latitude}, ${sensor.coordinates.longitude}`).openPopup();

                    const modalAtualizar = new bootstrap.Modal(document.getElementById('modalSensorAtualizacao'));
                    modalAtualizar.show();

                    document.getElementById('btnAtualizarSensor').onclick = function () {
                        atualizarSensor(sensorId);
                    };
                } else {
                    console.error('Erro ao obter dados do sensor:', data.msg);
                }
            })
            .catch(error => console.error('Erro ao buscar sensor:', error));
    }

    function atualizarSensor(sensorId) {
        const nomeAtualizado = document.getElementById('txtNomeAtualizar').value;
        const tipoAtualizado = document.getElementById('dropTipoAtualizar').value;

        const dadosAtualizados = {
            name: nomeAtualizado,
            type: tipoAtualizado
        };

        fetch(`/sensor/${sensorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    alert('Sensor atualizado com sucesso!');
                    location.reload();
                } else {
                    console.error('Erro ao atualizar sensor:', data.msg);
                }
            })
            .catch(error => console.error('Erro ao atualizar sensor:', error));
    }

    function excluirSensor(sensorId) {
        if (confirm('Tem certeza que deseja excluir este sensor?')) {
            fetch(`/sensor/${sensorId}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        alert('Sensor excluído com sucesso!');
                        location.reload();
                    } else {
                        console.error('Erro ao excluir sensor:', data.msg);
                    }
                })
                .catch(error => console.error('Erro ao excluir sensor:', error));
        }
    }

    // Expor as funções globalmente
    window.abrirModalAtualizar = abrirModalAtualizar;
    window.excluirSensor = excluirSensor;

    // Carregar dados padrão (Brasil) ao carregar a página
    updateLocation(-14.235, -51.9253, 'Brasil');
});
