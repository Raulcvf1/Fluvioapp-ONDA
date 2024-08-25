window.onload = function () {
    graficoLinha();
}

// Função para renderizar o gráfico usando Chart.js
function graficoLinha() {
    var ctx = document.getElementById("lineChart").getContext("2d");
    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ['Nível', 'Máximo', 'Mínimo'], // Labels para o gráfico
            datasets: [
                {
                    label: 'Nível Fluviométrico',
                    data: [65, 90, 40], // Níveis de água (exemplo)
                    backgroundColor: 'rgba(44, 109, 230, 0.5)', // Cor de fundo com transparência
                    borderColor: 'rgb(44, 109, 230)',
                    borderWidth: 2,
                    hoverBackgroundColor: 'rgba(44, 109, 230, 0.8)', // Cor ao passar o mouse
                    hoverBorderColor: 'rgb(44, 109, 230)',
                    borderRadius: 5 // Bordas arredondadas
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Permite que o gráfico se ajuste ao espaço
            plugins: {
                legend: {
                    display: false, // Oculta a legenda
                },
                title: {
                    display: true,
                    text: 'Nível Médio das Águas do Rio',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#ffffff' // Cor do título
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff', // Cor dos rótulos do eixo Y
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Cor da grade
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff', // Cor dos rótulos do eixo X
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Cor da grade
                    }
                }
            },
            animation: {
                duration: 1000, // Duração da animação
                easing: 'easeInOutBounce' // Estilo da animação
            }
        }
    });
}
