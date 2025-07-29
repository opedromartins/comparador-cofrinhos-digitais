async function getSelicMetaRate() {
    try {
        const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json';
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return parseFloat(data[0].valor).toFixed(2).replace('.', ',');
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar a taxa Selic:", error);
        return null;
    }
}

const glossaryData = [
    {
        term: 'FGC (Fundo Garantidor de Crédito)',
        definition: 'É uma entidade privada que protege correntistas e investidores. Em caso de falência do banco, o FGC garante a devolução de até R$ 250.000 por CPF e por instituição. É a principal camada de segurança para seu dinheiro. Produtos como CDB, RDB e LCI costumam ter essa proteção, mas Fundos de Investimento e Contas de Pagamento não.'
    },
    {
        term: 'CDI (Certificado de Depósito Interbancário)',
        definition: 'É a taxa de juros que os bancos usam para emprestar dinheiro entre si. A maioria dos investimentos de renda fixa usa o CDI como referência de rentabilidade. Quando um cofrinho rende "100% do CDI", significa que seu retorno será muito próximo à taxa Selic, a taxa básica de juros da economia.'
    },
    {
        term: 'Liquidez',
        definition: 'Liquidez é a facilidade de transformar seu investimento em dinheiro. <strong>Liquidez Imediata (24/7)</strong> significa que você pode resgatar a qualquer hora, incluindo fins de semana, e o dinheiro cai na conta em segundos. <strong>Liquidez Diária (D+1)</strong> significa que o resgate solicitado hoje só estará disponível no próximo dia útil. Para uma reserva de emergência, a liquidez imediata é crucial.'
    },
    {
        term: 'IOF (Imposto sobre Operações Financeiras)',
        definition: '<strong>IOF (Imposto sobre Operações Financeiras):</strong> Incide apenas sobre os rendimentos de resgates feitos em menos de 30 dias. A alíquota é regressiva, começando em 96% no primeiro dia e zerando no 30º dia.'
    },
    {
        term: 'Imposto de Renda (IR)',
        definition: '<strong>IR (Imposto de Renda):</strong> Incide sobre os rendimentos e segue uma tabela regressiva: 22,5% (até 180 dias), 20% (de 181 a 360 dias), 17,5% (de 361 a 720 dias) e 15% (acima de 720 dias).'
    },
    {
        term: 'Come-cotas',
        definition: 'É a antecipação do Imposto de Renda em alguns Fundos de Investimento. Ocorre no último dia útil de maio e novembro. O sistema "come" uma parte das suas cotas para pagar o imposto devido. Isso é menos eficiente que o pagamento apenas no resgate, pois o dinheiro do imposto deixa de render.'
    }
];

const recommendationTexts = {
    emergency: {
        title: "Recomendação para Reserva de Emergência",
        text: "Para uma reserva de emergência, os pilares são: <strong>segurança máxima (cobertura do FGC)</strong> e <strong>liquidez imediata (resgate 24/7)</strong>. A rentabilidade é secundária."
    },
    short_term: {
        title: "Recomendação para Metas de Curto Prazo",
        text: "Para metas de curto prazo (viagens, compra de um bem), a segurança do FGC ainda é muito importante. A liquidez pode ser mais flexível (D+1 é aceitável)."
    },
    maximize: {
        title: "Recomendação para Maximizar Rendimentos",
        text: "Se seu foco é obter a maior rentabilidade possível, as ofertas 'turbo' são atraentes, mas atente-se aos limites de valor e às condições."
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const bankCardsContainer = document.getElementById('bank-cards-container');
    const goalFilters = document.getElementById('goal-filters');
    const fgcToggle = document.getElementById('fgc-toggle');
    const liquidityToggle = document.getElementById('liquidity-toggle');
    const resultsCount = document.getElementById('results-count');
    const recommendationSection = document.getElementById('recommendation-section');
    const recommendationTextElem = document.getElementById('recommendation-text');
    const accordionContainer = document.getElementById('accordion-container');

    const selicRate = await getSelicMetaRate();
    if (selicRate) {
        const cdiDefinitionItem = glossaryData.find(item => item.term.startsWith('CDI'));
        if (cdiDefinitionItem) {
            // Adiciona a frase com o valor atualizado ao final da definição
            cdiDefinitionItem.definition += ` Atualmente o CDI anual está em torno de ${selicRate}%.`;
        }
    }

    let currentFilters = {
        goal: 'all',
        fgc: false,
        liquidityImmediate: false
    };

    function renderBankCards() {
        bankCardsContainer.innerHTML = '';
        let filteredData = bankData;

        if (currentFilters.fgc) {
            filteredData = filteredData.filter(bank => bank.fgc);
        }
        if (currentFilters.liquidityImmediate) {
            filteredData = filteredData.filter(bank => bank.liquidityImmediate);
        }

        resultsCount.textContent = `${filteredData.length} resultado(s)`;

        filteredData.forEach(bank => {
            const isRecommended = currentFilters.goal !== 'all' && bank.recommendations[currentFilters.goal];
            const card = document.createElement('div');
            card.className = `bank-card bg-white rounded-2xl p-6 cursor-pointer ${isRecommended ? 'highlight' : ''}`;
            card.dataset.bankId = bank.id;
            
            let iofDisplay = bank.iof ? 'Sim' : 'Não';
            if (bank.id === 'inter_lci' || bank.id.startsWith('mercadopago')) {
                iofDisplay = '<span class="font-semibold text-green-600">Isento</span>';
            }

            let rentabilityText = bank.rentabilityDisplay ? bank.rentabilityDisplay : `${bank.rentability}%`;

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold">${bank.name}</h3>
                        <p class="text-sm text-gray-500">${bank.toolName}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-[#4E8D7C]">${rentabilityText} <span class="text-base font-medium text-gray-500">${bank.rentabilityDisplay ? '' : 'CDI'}</span></p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-2 text-center">
                    <div>
                        <p class="text-xs text-gray-500">Garantia FGC</p>
                        <p class="font-bold text-base">${bank.fgc ? '✅' : '❌'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Liquidez</p>
                        <p class="font-bold text-base">${bank.liquidityImmediate ? 'Imediata' : 'Diária'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Limite Máx.</p>
                        <p class="font-bold text-base">${bank.maxDepositText}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">IOF</p>
                        <p class="font-bold text-base">${iofDisplay}</p>
                    </div>
                </div>
                <div class="details mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
                    <p><strong>Ativo Subjacente:</strong> ${bank.asset}</p>
                    <p><strong>Detalhes FGC:</strong> ${bank.fgc ? 'Coberto pelo FGC ✅' : 'Sem cobertura do FGC ❌'}</p>
                    <p><strong>Imposto de Renda:</strong> ${bank.ir.replace('diario', 'Retido diariamente.')}</p>
                    <p><strong>Liquidez Detalhada:</strong> ${bank.liquidity}</p>
                    <p><strong>Aporte Mínimo:</strong> R$ ${bank.minDeposit.toFixed(2).replace('.', ',')}</p>
                    <p><strong>Observações:</strong> ${bank.extra}</p>
                </div>
                <div class="text-center mt-4 text-[#4E8D7C] font-semibold text-sm">
                    Clique para ver detalhes
                </div>
            `;
            bankCardsContainer.appendChild(card);
        });
    }
    
    function updateRecommendations() {
        const recData = recommendationTexts[currentFilters.goal];
        if (currentFilters.goal === 'all') {
            recommendationSection.classList.add('hidden');
        } else {
            recommendationSection.classList.remove('hidden');
            recommendationTextElem.innerHTML = `
                <h4 class="text-xl font-semibold mb-2">${recData.title}</h4>
                <p>${recData.text}</p>
            `;
        }
    }

    goalFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            goalFilters.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentFilters.goal = e.target.dataset.goal;
            renderBankCards();
            updateRecommendations();
        }
    });

    fgcToggle.addEventListener('change', (e) => {
        currentFilters.fgc = e.target.checked;
        renderBankCards();
    });

    liquidityToggle.addEventListener('change', (e) => {
        currentFilters.liquidityImmediate = e.target.checked;
        renderBankCards();
    });
    
    bankCardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.bank-card');
        if (card) {
            card.classList.toggle('open');
        }
    });

    function renderGlossary() {
        accordionContainer.innerHTML = '';
        glossaryData.forEach(item => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item bg-white rounded-lg border border-gray-200';
            accordionItem.innerHTML = `
                <button class="accordion-header w-full text-left p-4 flex justify-between items-center">
                    <span class="font-semibold text-lg">${item.term}</span>
                    <span class="arrow text-2xl text-[#4E8D7C] transform transition-transform duration-300">↓</span>
                </button>
                <div class="accordion-content text-gray-600">
                    <p class="px-4 pb-4">${item.definition}</p>
                </div>
            `;
            accordionContainer.appendChild(accordionItem);
        });

        accordionContainer.addEventListener('click', (e) => {
            const header = e.target.closest('.accordion-header');
            if (header) {
                const item = header.parentElement;
                item.classList.toggle('open');
                const arrow = header.querySelector('.arrow');
                arrow.classList.toggle('rotate-180');
            }
        });
    }

    let standardChartInstance, turboChartInstance;

    function initCharts() {
        const standardBanks = bankData.filter(b => b.type === 'standard');
        const promoBanks = bankData.filter(b => b.type === 'promo');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '% do CDI'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += context.parsed.x + '% do CDI';
                            }
                            return label;
                        }
                    }
                }
            }
        };
        
        if (standardChartInstance) standardChartInstance.destroy();
        standardChartInstance = new Chart(document.getElementById('standardRentabilityChart'), {
            type: 'bar',
            data: {
                labels: standardBanks.map(b => b.name),
                datasets: [{
                    label: 'Rentabilidade Padrão',
                    data: standardBanks.map(b => b.rentability),
                    backgroundColor: '#4E8D7C',
                    borderColor: '#3B6B5E',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        });

        if (turboChartInstance) turboChartInstance.destroy();
        turboChartInstance = new Chart(document.getElementById('turboRentabilityChart'), {
            type: 'bar',
            data: {
                labels: promoBanks.map(b => b.name),
                datasets: [{
                    label: 'Rentabilidade Turbo',
                    data: promoBanks.map(b => b.rentability),
                    backgroundColor: '#D4A373',
                    borderColor: '#A9825C',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        });
    }

    renderBankCards();
    updateRecommendations();
    renderGlossary();
    initCharts();
});
