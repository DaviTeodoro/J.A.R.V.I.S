# Projeto principal

Este projeto contém um script main.js escrito em Deno, que permite realizar uma conversa interativa com a API OpenAI. O script lê comandos do usuário e envia-os para a API OpenAI, exibe a resposta e pode até mesmo executar comandos shell (bash) se o usuário aprovar.

## Requisitos

- Deno (https://deno.land/)
- Acesso ao serviço API OpenAI (necessário criar um arquivo .env com a chave)

## Como executar

1. Certifique-se de que o Deno está instalado e funcionando corretamente no seu computador.
2. Crie um arquivo .env na raiz deste projeto com as seguintes variáveis:

```
API_KEY=<sua_chave_api_openai>
API_URL=https://api.openai.com/v1/engines/davinci-codex/completions
MODEL=davinci-codex
```

3. Siga as instruções a seguir para criar um executável e adicioná-lo ao seu PATH:

### Criar um executável

- Crie um arquivo chamado `main` (sem extensão) com o seguinte conteúdo:

```
#!/bin/sh
deno run --allow-net --allow-run --allow-read --allow-write --unstable /caminho/absoluto/para/main.js "$@"
```
Lembre-se de substituir `/caminho/absoluto/para/` pelo caminho absoluto para a pasta onde o arquivo main.js está localizado.

- Torne o arquivo `main` executável com o seguinte comando:

```
chmod +x main
```

### Adicionar executável ao PATH

- Abra seu arquivo de configuração do shell (geralmente é o `.bashrc`, `.bash_profile` ou `.zshrc`) e acrescente a seguinte linha ao final do arquivo:

```
export PATH="/caminho/absoluto/para/pasta:$PATH"
```
Substitua novamente `/caminho/absoluto/para/pasta/` pelo caminho absoluto para a pasta onde o arquivo `main` está localizado. Salve o arquivo e reinicie seu terminal.

4. Depois de adicionar o executável ao PATH, você pode executar o script simplesmente digitando `main` no terminal.

## Observações

O script permite executar comandos de shell (bash) se o usuário aprovar. Tenha cuidado ao executar comandos em seu sistema, pois eles podem alterar arquivos e configurações importantes. Certifique-se de compreender completamente o efeito de um comando antes de executá-lo.
