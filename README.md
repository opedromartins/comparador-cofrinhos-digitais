# Guia Interativo dos Cofrinhos Digitais 2025

Este é um projeto de uma ferramenta web interativa projetada para ajudar os usuários a comparar e escolher as melhores opções de "cofrinhos digitais" ou contas remuneradas oferecidas por vários bancos digitais no Brasil. O projeto inclui um comparador principal e uma calculadora de rentabilidade separada.

## Funcionalidades

### Guia Interativo Principal

* **Comparação Visual:** Mostra diferentes opções de investimento em formato de "cards", destacando as informações mais importantes como rentabilidade, cobertura FGC e liquidez.
* **Filtragem por Objetivos:** Permite que os usuários filtrem as opções com base em seus objetivos financeiros:
    * Reserva de Emergência
    * Metas de Curto Prazo
    * Maximizar Rendimentos
* **Filtros Essenciais:** Os usuários могут refinar ainda mais a busca exigindo **garantia do FGC** e/ou **liquidez imediata (24/7)**.
* **Recomendações Dinâmicas:** Com base no objetivo selecionado, a interface destaca os cartões mais adequados e exibe um texto com recomendações.
* **Detalhes Expansíveis:** Cada "card" pode ser clicado para revelar informações mais detalhadas sobre o produto, como o ativo subjacente, detalhes sobre imposto de renda e observações.
* **Gráficos de Rentabilidade:** Apresenta dois gráficos de barras comparando a rentabilidade (% do CDI) das opções padrão e das opções promocionais/"turbo".
* **Dicionário Financeiro:** Uma seção de glossário em formato "acordeão" explica termos financeiros importantes como FGC, CDI, Liquidez, IOF, Imposto de Renda e Come-cotas.

### Calculadora de Rentabilidade

* **Simulação Personalizada:** Uma ferramenta separada que permite aos usuários calcular e comparar o rendimento líquido de diferentes opções.
* **Parâmetros de Cálculo:** Os usuários podem inserir o valor do aporte inicial e o prazo do investimento em dias.
* **Seleção Flexível:** É possível selecionar várias opções predefinidas (baseadas em `bankData.js`) para comparar simultaneamente.
* **Criação na Hora:** Permite a criação de uma "caixinha personalizada", onde o usuário define o nome, a rentabilidade, o tipo de IR (regressivo ou fixo) e a isenção de IOF.
* **Resultados Detalhados:** Apresenta uma tabela com os resultados, mostrando o rendimento bruto, os descontos de IOF e IR, o rendimento líquido e o saldo final para cada opção selecionada.
* **Alertas de Prazo:** O sistema avisa o usuário caso o prazo de investimento inserido seja incompatível com os prazos mínimos ou máximos de um produto.


## Disclaimer

As informações apresentadas neste site são apenas para fins educacionais e de comparação, compiladas a partir de dados públicos na internet. As condições e taxas de rentabilidade podem mudar a qualquer momento e sem aviso prévio. Este site não oferece consultoria financeira e não garante a precisão ou atualidade das informações. Sempre verifique as condições diretamente com a instituição financeira antes de tomar qualquer decisão de investimento.