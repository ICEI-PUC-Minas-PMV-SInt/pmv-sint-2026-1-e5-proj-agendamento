# Evidências dos Testes de Software

Esta pasta deve conter as capturas de tela (screenshots) que comprovam a execução de cada um dos casos de teste descritos em [`../04-Testes de Software.md`](../../04-Testes%20de%20Software.md).

## Como adicionar as evidências

Para cada caso de teste executado, salve a captura de tela com **exatamente** o nome listado abaixo (em formato `.png`). Os documentos já referenciam esses arquivos — basta adicionar a imagem com o nome correto que ela aparecerá automaticamente no relatório.

| Caso | Nome do arquivo |
|------|-----------------|
| CT01 – Realizar login no sistema | `ct01-login.png` |
| CT02 – Cadastrar nova cliente | `ct02-cadastrar-cliente.png` |
| CT03 – Editar dados de uma cliente cadastrada | `ct03-editar-cliente.png` |
| CT04 – Listar clientes com busca e filtros | `ct04-listar-clientes.png` |
| CT05 – Cadastrar novo serviço no catálogo | `ct05-cadastrar-servico.png` |
| CT06 – Cadastrar novo agendamento | `ct06-novo-agendamento.png` |
| CT07 – Validar regras de negócio do agendamento | `ct07-validacoes-agendamento.png` |
| CT08 – Marcar agendamento como realizado | `ct08-concluir-agendamento.png` |
| CT09 – Cancelar um agendamento | `ct09-cancelar-agendamento.png` |
| CT10 – Visualizar histórico de atendimentos da cliente | `ct10-historico-cliente.png` |
| CT11 – Filtrar agendamentos por status | `ct11-filtrar-agendamentos.png` |
| CT12 – Excluir cliente cadastrada | `ct12-excluir-cliente.png` |

## Dicas para capturar as evidências

- Capture a tela imediatamente após o resultado de êxito definido no caso de teste (ex: ao finalizar o cadastro, capture a tela com a cliente já listada).
- Para o CT07 (validações), recomenda-se uma captura de tela única mostrando as mensagens de erro inline para o caso que melhor demonstra o cenário (ex: horário ocupado ou fora do expediente).
- Para o CT08, é interessante incluir duas capturas: o agendamento antes e depois da conclusão (a captura final pode ser composta lado a lado em uma única imagem).
- Caso a captura precise mostrar passos anteriores e posteriores, é possível compor uma única imagem (lado a lado ou empilhada) com o nome esperado.

Após adicionar todas as evidências nesta pasta, o documento `04-Testes de Software.md` apresentará automaticamente as imagens no relatório.
