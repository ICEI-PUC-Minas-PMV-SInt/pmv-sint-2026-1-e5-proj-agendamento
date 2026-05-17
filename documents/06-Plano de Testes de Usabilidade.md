# Plano de Testes de Usabilidade

<span style="color:red">Pré-requisitos: <a href="03-Projeto de Interface.md">Projeto de Interface</a>, <a href="04-Testes de Software.md">Testes de Software</a></span>

Este documento apresenta o planejamento dos testes de usabilidade da aplicação. Diferentemente dos testes de funcionalidades — que verificam se o sistema **faz o que deveria** —, os testes de usabilidade avaliam a experiência da pessoa utilizando o sistema: ela consegue completar as tarefas? Com qual esforço? Quão satisfeita fica ao usar?

## Objetivos da avaliação

A avaliação de usabilidade tem como objetivos:

- Verificar se a empreendedora parceira consegue completar as principais tarefas do sistema **sem ajuda da equipe de desenvolvimento**.
- Identificar pontos de fricção na interface (telas confusas, fluxos longos, terminologia inadequada).
- Coletar a percepção subjetiva da usuária final sobre a facilidade de uso, a clareza visual e a utilidade do sistema.
- Validar se o tempo gasto para realizar um agendamento no novo sistema é menor que o tempo gasto no fluxo atual (WhatsApp + agenda manual).

## Metodologia

Os testes serão conduzidos de forma **presencial**, utilizando a abordagem de **observação direta com protocolo "think-aloud"** (a participante é orientada a verbalizar o que pensa enquanto executa cada tarefa). Essa metodologia foi escolhida por permitir identificar não só o que dá errado, mas também o *porquê* — entendendo o raciocínio da usuária ao navegar pela interface.

O fluxo de cada sessão será:

1. **Pré-teste (5 min):** apresentação do objetivo da avaliação, leitura e assinatura de termo de consentimento simples, breve descrição do que é o aplicativo.
2. **Execução das tarefas (~25 min):** a participante recebe as tarefas uma a uma, em ordem, sem instruções de como executá-las.
3. **Aplicação do questionário SUS (5 min):** a participante responde ao questionário padrão System Usability Scale, com 10 perguntas de escala 1 a 5.
4. **Entrevista pós-teste (~10 min):** perguntas abertas sobre a experiência, pontos positivos e dificuldades.

Cada sessão é gravada em vídeo (gravação de tela do celular + áudio ambiente) para análise posterior. As gravações ficam restritas à equipe e são excluídas após a finalização da avaliação.

## Perfil dos participantes

| Participante | Perfil | Papel na avaliação |
|--------------|--------|--------------------|
| Ivinah Sousa | Lash designer, 5 anos de experiência, usuária final do sistema, 26 anos. **Familiaridade média com tecnologia** (usa WhatsApp e Instagram diariamente, mas nunca usou um sistema de agendamento). | Avaliação principal — representa a persona real do projeto. |
| Alana Alves Maia | Estudante de Sistemas para Internet, integrante da equipe de desenvolvimento. | Validação interna — referência de "usuária técnica". |
| Rodrigo da Costa Souza | Estudante de Sistemas para Internet, integrante da equipe de desenvolvimento. | Validação interna — referência de "usuária técnica". |
| Tatiana Haveroth Barbosa | Estudante de Sistemas para Internet, integrante da equipe de desenvolvimento. | Validação interna — referência de "usuária técnica". |

Total: **4 participantes** (1 usuária final + 3 da equipe). A comparação entre o resultado da Ivinah e o da equipe ajuda a separar problemas de usabilidade reais de questões de baixa familiaridade técnica.

## Cenários e tarefas

A participante recebe as tarefas no formato de instrução de objetivo (sem dizer onde clicar). O facilitador anota o caminho real que ela percorre e cronometra cada tarefa.

| ID | Tarefa | Critério de sucesso |
|----|--------|---------------------|
| TU-01 | "Faça login no aplicativo com a conta que está anotada nesse papel." | Chegar ao Dashboard. |
| TU-02 | "Cadastre uma nova cliente chamada Beatriz Lima, telefone (31) 9 9876-5432, com observação 'alérgica a cianoacrilato'." | Cliente cadastrada e visível na lista. |
| TU-03 | "Cadastre um novo serviço chamado 'Lash Lifting', com duração de 60 minutos e preço de R$ 100,00." | Serviço cadastrado e visível no catálogo. |
| TU-04 | "Marque um agendamento da Beatriz Lima para o próximo dia útil, às 14:00, no serviço Lash Lifting." | Agendamento criado, aparece no Dashboard no dia correto. |
| TU-05 | "Marque esse agendamento que você acabou de criar como realizado." | Status do agendamento muda para REALIZADO. |
| TU-06 | "Cancele um outro agendamento que está como CONFIRMADO na agenda." | Status do agendamento muda para CANCELADO. |
| TU-07 | "Veja o histórico completo de atendimentos da Beatriz Lima." | A participante chega à tela de Perfil da Cliente e localiza o histórico. |
| TU-08 | "Altere o telefone da Beatriz Lima para (31) 9 1234-5678." | Telefone atualizado e visível no perfil. |

A ordem das tarefas reflete um uso natural do app (login → cadastros → operações do dia a dia → consulta).

## Métricas a coletar

Para cada tarefa serão coletadas:

| Métrica | Como medir | Critério |
|---------|------------|----------|
| **Taxa de sucesso** | Concluída (✅) / Concluída com dificuldade (⚠️) / Não concluída (❌) | Sucesso = 100% espera; ⚠️ aceitável se < 30% das tarefas. |
| **Tempo de conclusão** | Cronômetro do início ao fim da tarefa, em segundos. | Sem benchmark fixo — comparativo entre participantes. |
| **Número de erros** | Cliques em caminhos errados, voltas no fluxo, tentativas frustradas. | Quanto menor, melhor. |
| **Pedido de ajuda** | A participante pediu orientação? (sim/não) | Idealmente zero pedidos para tarefas básicas. |
| **Comentário verbal** | Frases da participante durante a tarefa (think-aloud). | Análise qualitativa. |

Ao final da sessão, será aplicado o **System Usability Scale (SUS)** — questionário padrão de 10 perguntas em escala Likert de 1 (discordo totalmente) a 5 (concordo totalmente):

1. Eu acho que gostaria de utilizar este sistema com frequência.
2. Eu achei o sistema desnecessariamente complexo.
3. Eu achei o sistema fácil de utilizar.
4. Eu acho que precisaria de ajuda de uma pessoa com conhecimentos técnicos para usar o sistema.
5. Eu achei que as várias funções do sistema estavam muito bem integradas.
6. Eu achei que o sistema apresentava muita inconsistência.
7. Eu imagino que as pessoas aprenderão como usar este sistema rapidamente.
8. Eu achei o sistema atrapalhado de usar.
9. Eu me senti confiante ao usar o sistema.
10. Eu precisei aprender várias coisas novas antes de conseguir usar o sistema.

**Cálculo do score SUS:** para as questões ímpares (positivas), considera-se `nota – 1`. Para as questões pares (negativas), considera-se `5 – nota`. A soma dos 10 valores é multiplicada por 2,5, resultando em um índice de **0 a 100**. Pontuações acima de 68 indicam usabilidade aceitável; acima de 80, excelente.

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| Aplicativo *Studio Lash* (APK instalado em celular Android real) | Sistema sob teste. |
| Gravador de tela nativo do Android | Captura visual + áudio de cada sessão. |
| Cronômetro (do próprio celular ou de um segundo aparelho) | Medição do tempo por tarefa. |
| Formulário Google com as 10 perguntas do SUS | Coleta padronizada do questionário. |
| Folha de observação (template em anexo no Registro de Testes) | Registro manual de erros, pedidos de ajuda e comentários verbais. |
| Termo de consentimento simples | Autorização da participante para o uso da gravação para fins acadêmicos. |

## Cronograma

| Etapa | Período |
|-------|---------|
| Preparação do ambiente (instalação do APK no celular de teste, criação da conta da Ivinah em produção) | Maio/2026 |
| Sessão com Ivinah Sousa (presencial, ~45 min) | Maio/2026 |
| Sessões com os integrantes da equipe (3 sessões) | Maio/2026 |
| Análise dos dados e cálculo do SUS | Maio/2026 |
| Documentação no Registro de Testes de Usabilidade | Junho/2026 |

## Resultado esperado

Espera-se que:

- A taxa de sucesso geral seja **≥ 90%** (8 das 8 tarefas concluídas pela maioria das participantes, ainda que com algum apoio em tarefas pontuais).
- O score SUS médio seja **≥ 68** (faixa aceitável), com a usuária final (Ivinah) tendo pontuação compatível com a da equipe de desenvolvimento.
- Sejam identificados de 3 a 5 pontos concretos de melhoria de interface, que podem ser implementados em versões futuras.

Eventuais problemas críticos identificados serão reportados como *backlog* de evoluções da aplicação, descritas no documento [05-Implantação.md](05-Implantação.md) na seção "Planejamento de evolução".
