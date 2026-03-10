# Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="1-Documentação de Contexto.md"> Documentação de Contexto</a></span>

Esta seção apresenta a definição do problema identificado junto à empreendedora parceira e a proposta de solução desenvolvida pela equipe, considerando principalmente a perspectiva do usuário. O objetivo é estruturar os requisitos e características do sistema de forma organizada, garantindo que o produto final atenda às necessidades reais do contexto de uso.

Atualmente, o processo de agendamento da clínica de estética é realizado *exclusivamente* por meio do Whatsapp e do Google Agenda, sem a existência de um sistema próprio para gerenciamento de clientes, histórico de atendimentos ou organização de informações relevantes sobre cada sessão. Essa forma de gerenciamento limita o controle das informações de clientes e dificulta o acompanhamento do histórico de procedimentos realizados.

Diante desse cenário, propõe-se o desenvolvimento de um sistema de agendamento voltado inicialmente para a empreendedora responsável pela clínica, permitindo não apenas a organização dos horários de atendimento, mas também o cadastro e gerenciamento das clientes, incluindo informações como histórico de sessões, observações, dados de contato e datas importantes. O sistema também será pensado de forma escalável, permitindo a inclusão futura de novas modalidades de serviços estéticos ou sua adaptação para uso em outras clínicas.

## Arquitetura e Tecnologias

### Arquitetura da Solução

A solução proposta seguirá uma arquitetura **cliente-servidor**, composta por três principais camadas: aplicação mobile (frontend), API backend e banco de dados. Essa estrutura permite separar responsabilidades, facilitando a manutenção, escalabilidade e evolução futura do sistema.

O **aplicativo mobile** será responsável pela interface com o usuário, permitindo que a empreendedora visualize sua agenda, realize novos agendamentos e gerencie informações das clientes.

A **API backend** será responsável por processar as requisições da aplicação, aplicar as regras de negócio do sistema e realizar a comunicação com o banco de dados.

O **banco de dados** armazenará as informações persistentes do sistema, como dados das clientes, histórico de atendimentos, observações e agendamentos realizados.

Além disso, o sistema prevê integrações com ferramentas já utilizadas pela empreendedora, de forma a facilitar a adoção da solução. Entre essas integrações estão o Google Agenda, utilizado atualmente para o controle dos horários, e o WhatsApp, principal canal de comunicação com as clientes.

A integração com o *Google Agenda* permitirá sincronizar os agendamentos cadastrados no sistema com a agenda utilizada pela empreendedora, evitando conflitos de horários e mantendo a organização dos atendimentos.

Já a integração com o *WhatsApp* permitirá iniciar conversas diretamente com as clientes a partir do aplicativo. Essa funcionalidade será implementada por meio da geração automática de links de conversa com mensagens pré-preenchidas, facilitando o envio de confirmações de agendamento ou lembretes de atendimento. Essa abordagem foi escolhida por ser simples e adequada ao escopo de um Produto Mínimo Viável (MVP), não exigindo integração direta com a API oficial do WhatsApp.

A arquitetura proposta também foi planejada considerando a possibilidade de expansão futura, permitindo a inclusão de novas modalidades de serviços estéticos ou a adaptação do sistema para utilização em outras clínicas.

### Tecnologias Utilizadas

As tecnologias escolhidas para o desenvolvimento do projeto foram definidas com base nas ferramentas estudadas pela equipe durante o curso, bem como na facilidade de desenvolvimento e manutenção da solução.

- Aplicação Mobile: React Native
- Backend: C# .NET (a definir)
- Banco de Dados: PostgreSQL ou MySQL (a definir)

#### Integrações

- Google Calendar
- WhatsApp

#### Ferramentas de Desenvolvimento

- Git e GitHub
- Visual Studio Code (a definir)
- Postman (a definir)


## Project Model Canvas

Colocar a imagem do modelo construído apresentando a proposta de solução.

> **Links Úteis**:
> Disponíveis em material de apoio do projeto

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade |
|------|-----------------------------------------|----|
|RF-001| Permitir que o usuário cadastre tarefas | ALTA | 
|RF-002| Emitir um relatório de tarefas no mês   | MÉDIA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo para rodar em um dispositivos móvel | MÉDIA | 
|RNF-002| Deve processar requisições do usuário em no máximo 3s |  BAIXA | 

Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

- [Requisitos Funcionais
 (RF)](https://pt.wikipedia.org/wiki/Requisito_funcional):
 correspondem a uma funcionalidade que deve estar presente na
  plataforma (ex: cadastro de usuário).
- [Requisitos Não Funcionais
  (RNF)](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional):
  correspondem a uma característica técnica, seja de usabilidade,
  desempenho, confiabilidade, segurança ou outro (ex: suporte a
  dispositivos iOS e Android).
Lembre-se que cada requisito deve corresponder à uma e somente uma
característica alvo da sua solução. Além disso, certifique-se de que
todos os aspectos capturados nas Histórias de Usuário foram cobertos.

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)

## Diagrama de Casos de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos. 

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)

## Modelo ER (Projeto Conceitual)

O Modelo ER representa através de um diagrama como as entidades (coisas, objetos) se relacionam entre si na aplicação interativa.

Sugestão de ferramentas para geração deste artefato: LucidChart e Draw.io.

A referência abaixo irá auxiliá-lo na geração do artefato “Modelo ER”.

> - [Como fazer um diagrama entidade relacionamento | Lucidchart](https://www.lucidchart.com/pages/pt/como-fazer-um-diagrama-entidade-relacionamento)

## Projeto da Base de Dados

O projeto da base de dados corresponde à representação das entidades e relacionamentos identificadas no Modelo ER, no formato de tabelas, com colunas e chaves primárias/estrangeiras necessárias para representar corretamente as restrições de integridade.
