function getBusinessDays(calendarDays) {
    let businessDays = 0;
    const today = new Date();
    for (let i = 0; i < calendarDays; i++) {
        const currentDate = new Date(today.getTime());
        currentDate.setDate(today.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDays++;
        }
    }
    return businessDays;
}

function calcIOF(dias, rendimentoBruto) {
    if (dias >= 30) return 0;
    const aliquotasIOF = [0, 96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3, 0];
    const aliquota = aliquotasIOF[dias] || 0;
    return rendimentoBruto * (aliquota / 100);
}

function calcIR(dias, baseCalculo, bank) {
    if (bank.ir_type === 'isento' || bank.ir === 'Isento.' || bank.rentabilityDisplay === 'Isento de IR') return 0;
    
    if (bank.ir_type === 'fixo') {
        const aliquotaFixa = (bank.ir_fixed_value || 0) / 100;
        return baseCalculo * aliquotaFixa;
    }

    if (bank.ir.includes('Come-cotas')) return baseCalculo * 0.15;
    
    let aliquotaIR;
    if (dias <= 180) aliquotaIR = 0.225;
    else if (dias <= 360) aliquotaIR = 0.20;
    else if (dias <= 720) aliquotaIR = 0.175;
    else aliquotaIR = 0.15;
    return baseCalculo * aliquotaIR;
}

document.addEventListener('DOMContentLoaded', () => {
    const caixinhasList = document.getElementById('caixinhas-list');
    const customCaixinhaWrapper = document.getElementById('custom-caixinha-wrapper');
    const customIrFixedContainer = document.getElementById('custom-ir-fixed-value-container');
    
    bankData.forEach(bank => {
        const label = document.createElement('label');
        label.className = "flex items-center gap-2 border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition";
        label.innerHTML = `
            <input type="checkbox" value="${bank.id}" class="caixinha-checkbox h-4 w-4 rounded border-gray-300 text-[#4E8D7C] focus:ring-[#4E8D7C]">
            <div>
                <span class="font-semibold text-sm">${bank.name}</span>
                <span class="text-xs text-gray-500 block">${bank.rentabilityDisplay ? bank.rentabilityDisplay : bank.rentability + '% CDI'}</span>
            </div>
        `;
        caixinhasList.appendChild(label);
    });

    const customCaixinhaTriggerLabel = document.createElement('label');
    customCaixinhaTriggerLabel.className = "flex items-center gap-2 border border-dashed border-gray-400 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition";
    customCaixinhaTriggerLabel.innerHTML = `
        <input type="checkbox" value="custom" id="custom-caixinha-trigger" class="caixinha-checkbox h-4 w-4 rounded border-gray-300 text-[#4E8D7C] focus:ring-[#4E8D7C]">
        <div>
            <span class="font-semibold text-sm text-[#4E8D7C]">✨ Criar Personalizada</span>
            <span class="text-xs text-gray-500 block">Sua própria simulação</span>
        </div>
    `;
    caixinhasList.appendChild(customCaixinhaTriggerLabel);

    document.getElementById('custom-caixinha-trigger').addEventListener('change', function(e) {
        if (e.target.checked) {
            customCaixinhaWrapper.classList.remove('hidden');
        } else {
            customCaixinhaWrapper.classList.add('hidden');
        }
    });

    document.querySelectorAll('input[name="ir_type"]').forEach(radio => {
        radio.addEventListener('change', function(e) {
            if (e.target.value === 'fixo') {
                customIrFixedContainer.classList.remove('hidden');
            } else {
                customIrFixedContainer.classList.add('hidden');
            }
        });
    });

    document.getElementById('calc-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const valor = parseFloat(document.getElementById('valor-aporte').value);
        const dias = parseInt(document.getElementById('prazo-dias').value);
        const selecionadas = Array.from(document.querySelectorAll('.caixinha-checkbox:checked')).map(cb => cb.value);

        if (!valor || !dias || selecionadas.length === 0) {
            showModal('Por favor, selecione ao menos uma opção.');
            return;
        }

        const activeBankData = [...bankData];

        if (selecionadas.includes('custom')) {
            const customName = document.getElementById('custom-name').value;
            const customRentability = parseFloat(document.getElementById('custom-rentability').value);
            if (!customName || !customRentability) {
                showModal('Preencha os detalhes da sua caixinha personalizada para continuar.');
                return;
            }
            const customBank = {
                id: 'custom',
                name: customName,
                rentability: customRentability,
                iof: !document.getElementById('custom-iof').checked,
                ir_type: document.querySelector('input[name="ir_type"]:checked').value,
                ir_fixed_value: parseFloat(document.getElementById('custom-ir-fixed-value').value),
                ir: 'Personalizado',
                prazoMaximo: 0,
                prazoMinimo: 0,
            };
            activeBankData.push(customBank);
        }

        const CDI_ano = 0.15;
        const CDI_dia = Math.pow(1 + CDI_ano, 1 / 252) - 1;
        const diasUteis = getBusinessDays(dias);
        let results = [];

        selecionadas.forEach(id => {
            const bank = activeBankData.find(b => b.id === id);
            if (!bank) return;

            const rentabilidadePercentual = bank.rentability / 100;
            let bruto = 0, iof = 0, ir = 0, liquida = 0, saldoFinal = 0;

            const fatorRendimentoDiario = 1 + (CDI_dia * rentabilidadePercentual);
            bruto = valor * (Math.pow(fatorRendimentoDiario, diasUteis) - 1);

            if (bank.iof) {
                iof = calcIOF(dias, bruto);
            }
            const rendimentoPosIOF = bruto - iof;
            ir = calcIR(dias, rendimentoPosIOF, bank);
            liquida = rendimentoPosIOF - ir;
            saldoFinal = valor + liquida;
            
            const prazoMaximo = bank.prazoMaximo || 0;
            const prazoMaximoExcedido = prazoMaximo > 0 && dias > prazoMaximo;
            const prazoMinimo = bank.prazoMinimo || 0;
            const prazoMinimoExcedido = prazoMinimo > 0 && dias < prazoMinimo;

            results.push({
                name: bank.name, bruto, iof, ir, liquida, saldoFinal, prazoMaximoExcedido, prazoMaximo, prazoMinimoExcedido, prazoMinimo
            });
        });

        results.sort((a, b) => b.saldoFinal - a.saldoFinal);
        renderResultsTable(results, dias);
        document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
    });

    function renderResultsTable(results, dias) {
        const container = document.getElementById('result-table-container');
        let html = `<table class="result-table w-full text-sm md:text-base">
            <thead>
                <tr>
                    <th>Pos.</th>
                    <th>Opção</th>
                    <th class="currency">Rend. Bruto</th>
                    <th class="currency">IOF</th>
                    <th class="currency">IR</th>
                    <th class="currency">Rend. Líquido</th>
                    <th class="currency">Saldo Final</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        results.forEach((res, index) => {
            let warningHtml = '';
            if (res.prazoMaximoExcedido) {
                warningHtml = `<span class="warning-tooltip ml-2">⚠️<span class="tooltip-text">O prazo de ${dias} dias excede o máximo de ${res.prazoMaximo} dias.</span></span>`;
            }
            if (res.prazoMinimoExcedido) {
                warningHtml = `<span class="warning-tooltip ml-2">⚠️<span class="tooltip-text">O prazo de ${dias} dias é inferior ao mínimo de ${res.prazoMinimo} dias.</span></span>`;
            }
            
            html += `
                <tr class="${index === 0 ? 'bg-green-50' : ''}">
                    <td class="font-bold text-center">${index + 1}º</td>
                    <td class="font-bold">
                        <div class="flex items-center">
                            <span>${res.name}</span>
                            ${warningHtml}
                        </div>
                    </td>
                    <td class="currency">R$ ${res.bruto.toFixed(2).replace('.', ',')}</td>
                    <td class="currency text-red-600">R$ ${res.iof.toFixed(2).replace('.', ',')}</td>
                    <td class="currency text-red-600">R$ ${res.ir.toFixed(2).replace('.', ',')}</td>
                    <td class="currency font-bold text-green-600">R$ ${res.liquida.toFixed(2).replace('.', ',')}</td>
                    <td class="currency font-bold text-lg text-[#4E8D7C]">R$ ${res.saldoFinal.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
        document.getElementById('result-section').classList.remove('hidden');
    }

    const dynamicTooltipEl = document.getElementById('dynamic-tooltip');
    document.addEventListener('mouseover', (e) => {
        const tooltipTrigger = e.target.closest('.warning-tooltip');
        if (!tooltipTrigger) return;
        const tooltipText = tooltipTrigger.querySelector('.tooltip-text')?.textContent;
        if (!tooltipText) return;
        dynamicTooltipEl.textContent = tooltipText;
        dynamicTooltipEl.classList.remove('hidden');
        dynamicTooltipEl.style.opacity = '1';
        const triggerRect = tooltipTrigger.getBoundingClientRect();
        const tooltipRect = dynamicTooltipEl.getBoundingClientRect();
        let top = triggerRect.top - tooltipRect.height - 8;
        let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        if (top < 0) { top = triggerRect.bottom + 8; }
        if (left < 5) { left = 5; }
        if (left + tooltipRect.width > window.innerWidth) { left = window.innerWidth - tooltipRect.width - 5; }
        dynamicTooltipEl.style.top = `${top + window.scrollY}px`;
        dynamicTooltipEl.style.left = `${left + window.scrollX}px`;
    });
    document.addEventListener('mouseout', (e) => {
        const tooltipTrigger = e.target.closest('.warning-tooltip');
        if (tooltipTrigger) {
            dynamicTooltipEl.style.opacity = '0';
            setTimeout(() => { dynamicTooltipEl.classList.add('hidden'); }, 200);
        }
    });

    const modal = document.getElementById('custom-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function showModal(message) {
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    }

    function hideModal() {
        modal.classList.add('opacity-0');
        modalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    modalCloseBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
});