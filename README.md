# Documentação do main.js

Este arquivo é um script Deno que trabalha com a API da OpenAI para processar perguntas e executa comandos de usuário. Ele lê o arquivo setup_prompt.txt para a configuração inicial do prompt.

## Dependências

- deno
- https://deno.land/std/fmt/colors.ts para formatação de cor no console
- https://deno.land/x/dotenv/mod.ts para gerenciamento de variáveis de ambiente

## Variáveis de ambiente

- API_KEY: Chave da API da OpenAI
- API_URL: URL da API da OpenAI
- MODEL: Modelo de API a ser utilizado
