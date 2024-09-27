document.addEventListener('DOMContentLoaded', function() {
    // Carregar os estados ao carregar a página
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response => response.json())
        .then(states => {
            const stateSelect = document.getElementById('inputGroupSelect02');
            stateSelect.innerHTML = '<option value="null">Escolha o seu Estado</option>';
            states.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena os estados pelo nome
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state.nome; // Usar o nome do estado como valor
                option.textContent = state.nome; // O texto será o nome do estado (ex: "São Paulo")
                stateSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar estados:', error);
        });

    // Evento de mudança no seletor de estados
    document.getElementById('inputGroupSelect02').addEventListener('change', function() {
        const selectedStateName = this.value; // Nome do estado selecionado
        const citySelect = document.getElementById('inputGroupSelectCity');

        // Se nenhum estado for selecionado, desabilita o seletor de cidades
        if (selectedStateName === 'null') {
            citySelect.innerHTML = '<option value="null">Escolha a sua Cidade</option>';
            citySelect.disabled = true;
            return;
        }

        // Limpar e desabilitar o seletor de cidades enquanto busca as cidades
        citySelect.innerHTML = '<option value="null">Carregando...</option>';
        citySelect.disabled = true;

        // Buscar cidades com base no nome do estado selecionado
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(selectedStateName)}/municipios`)
            .then(response => response.json())
            .then(cities => {
                citySelect.innerHTML = '<option value="null">Escolha a sua Cidade</option>';
                cities.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena as cidades pelo nome
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.nome; // Valor será o nome da cidade
                    option.textContent = city.nome; // Texto será o nome da cidade
                    citySelect.appendChild(option);
                });

                // Habilitar o seletor de cidades após carregar as cidades
                citySelect.disabled = false;
            })
            .catch(error => {
                console.error('Erro ao carregar cidades:', error);
                citySelect.innerHTML = '<option value="null">Erro ao carregar cidades</option>';
            });
    });

    // Evento de mudança no seletor de cidades
    document.getElementById('inputGroupSelectCity').addEventListener('change', function() {
        const selectedStateName = document.getElementById('inputGroupSelect02').value; // Nome do estado selecionado
        const selectedCityName = this.value; // Nome da cidade selecionada

        // Se nenhuma cidade for selecionada, não buscar sensores
        if (selectedCityName === 'null') {
            return;
        }

        // Buscar sensores com base no estado e cidade selecionados
        fetch(`/sensor/filtro/${encodeURIComponent(selectedStateName)}/${encodeURIComponent(selectedCityName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    console.log("Sensores encontrados:", data.data); // Imprime todos os dados dos sensores retornados
                } else {
                    console.error("Erro ao buscar sensores:", data.msg);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar sensores:', error);
            });
    });
});
