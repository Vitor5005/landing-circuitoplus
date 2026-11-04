# Circuito+

Landing page acadêmica fictícia para uma assistência técnica de celulares. O projeto apresenta os serviços da Circuito+, recebe pedidos de avaliação e registra as solicitações em uma planilha Google configurada pelo responsável pelo trabalho.

> Orçamentos e valores dependem de avaliação. Nenhum preço, endereço, garantia ou depoimento é apresentado como se fosse real.

## Arquitetura

```text
Visitante
   │ preenche e envia um formulário HTML por POST nativo
   ▼
GitHub Pages (/docs) ─────────────► Google Apps Script Web App (/exec)
                                         │ valida, bloqueia spam e serializa gravações
                                         ▼
                                  Google Sheets / aba "Solicitacoes"
```

O front-end é estático e é hospedado pelo GitHub Pages. O formulário não utiliza `fetch`, AJAX, banco de dados próprio, APIs pagas, framework ou etapa de build: após um POST válido, o navegador abre a resposta HTML do Web App. O Apps Script é vinculado à planilha que armazena as solicitações.

## Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `docs/index.html` | Estrutura semântica da landing page, conteúdo e formulário. |
| `docs/assets/css/styles.css` | Identidade visual, responsividade, estados de foco e transições. |
| `docs/assets/js/main.js` | Configuração única do endpoint e validação de envio no navegador. |
| `docs/assets/img/hero-reparo.svg` | Ilustração SVG original do hero. |
| `apps-script/Code.gs` | Web App Apps Script, validação e gravação na planilha. |
| `README.md` | Documentação de instalação, arquitetura e contexto acadêmico. |

## Configuração

### 1. Google Apps Script e Google Sheets

1. Crie uma Planilha Google que será usada apenas para as solicitações do projeto.
2. Na planilha, acesse **Extensões → Apps Script**. Isso cria um script vinculado à planilha.
3. Substitua o conteúdo padrão pelo arquivo `apps-script/Code.gs` deste repositório.
4. No início do arquivo, defina `SITE_URL` com a URL pública da landing page, por exemplo: `https://usuario.github.io/nome-do-repositorio/`. Esse valor é usado no link seguro “Voltar ao site” das páginas de resposta.
5. Em **Implantar → Nova implantação**, escolha **Aplicativo da Web**. Execute como a sua conta e escolha o nível de acesso que permita que os visitantes pretendidos enviem o formulário. Para uma página pública, normalmente isso exige acesso anônimo; políticas institucionais podem restringi-lo.
6. Copie a URL implantada que termina em `/exec`. Não use a URL `/dev` no site publicado.
7. Após modificar o Apps Script, crie uma nova versão/implantação para publicar a alteração.

O script cria a aba `Solicitacoes` automaticamente quando necessário e inclui os cabeçalhos: data e hora, nome, e-mail, telefone, aparelho, problema, mensagem e consentimento. O acesso à planilha e à implantação deve ficar restrito a pessoas autorizadas.

### 2. Endpoint do formulário

No arquivo `docs/assets/js/main.js`, preencha somente esta constante:

```js
const FORM_ENDPOINT = "https://script.google.com/macros/s/SEU_ID/exec";
```

O JavaScript aceita apenas endpoints HTTPS do domínio `script.google.com` que terminem em `/exec`. Enquanto a constante estiver vazia ou inválida, o envio é impedido e uma mensagem acessível informa o motivo. Não há simulação de sucesso.

### 3. GitHub Pages

1. Envie estes arquivos para um repositório no GitHub.
2. Em **Settings → Pages**, escolha **Deploy from a branch**.
3. Selecione a branch desejada e a pasta **`/docs`**.
4. Salve e aguarde a URL publicada pelo GitHub Pages.
5. Atualize `SITE_URL` no Apps Script com essa URL e faça uma nova implantação do Web App, se necessário.

Os caminhos para CSS, JavaScript e imagem são relativos; por isso o site funciona tanto em `https://usuario.github.io/nome-do-repositorio/` quanto em uma visualização local simples.

## Campos e proteção de dados

| Campo | Obrigatório | Uso |
| --- | --- | --- |
| Nome | Sim | Identificar quem solicitou a avaliação. |
| E-mail | Sim | Retornar o contato. |
| Telefone | Não | Oferecer um canal alternativo de contato. |
| Modelo do aparelho | Não | Contextualizar o diagnóstico. |
| Problema | Sim | Classificar a solicitação. |
| Mensagem | Não | Receber detalhes adicionais. |
| Consentimento | Sim | Registrar autorização para contato sobre a solicitação. |

O formulário inclui um campo honeypot oculto (`website`) para bloquear submissões automatizadas simples. No servidor, os campos obrigatórios, o formato do e-mail, as opções do problema e os limites de tamanho são validados antes da gravação. Valores textuais que começam com `=`, `+`, `-` ou `@` recebem proteção contra fórmulas de planilha. `LockService` impede disputas entre gravações simultâneas.

Como há dados de contato, a planilha deve ter acesso limitado, retenção definida pelo responsável e exclusão dos registros quando deixarem de ser necessários para a finalidade acadêmica.

## Fluxo de dados

1. A pessoa lê a proposta da Circuito+ e usa qualquer CTA, que aponta para `#contato`.
2. O navegador aplica a validação HTML nativa aos campos obrigatórios.
3. `main.js` confirma que o endpoint foi configurado com uma URL `/exec` válida e, então, permite o POST HTML nativo.
4. `doPost(e)` lê `e.parameter`, recusa honeypot, entradas inválidas ou sem consentimento e protege células contra fórmulas.
5. Após obter um bloqueio, o Apps Script localiza/cria a aba e usa `appendRow` para registrar a solicitação.
6. Somente depois de a gravação concluir, o Web App responde com “Solicitação recebida!”. Em caso de falha, retorna uma página de erro, sem falso sucesso.

## Sistemas de Informação e DIKW

Os cinco componentes de um Sistema de Informação aparecem no projeto assim:

| Componente | Aplicação na Circuito+ |
| --- | --- |
| Hardware | Celular/ computador do visitante, servidores Google e dispositivos de quem administra a planilha. |
| Software | HTML, CSS, JavaScript, GitHub Pages, Google Apps Script e Google Sheets. |
| Dados | Nome, e-mail, aparelho, categoria do problema e mensagem enviados no formulário. |
| Pessoas | Visitante que solicita avaliação e responsável acadêmico que consulta as solicitações. |
| Procedimentos | Consentimento, validação, prevenção de spam, controle de acesso e registro na aba `Solicitacoes`. |

O modelo DIKW transforma registros brutos em decisão:

| Nível | Exemplo |
| --- | --- |
| Dados | “Bateria”, modelo do aparelho e data/hora em uma linha da planilha. |
| Informação | Contagem de solicitações relacionadas a bateria em determinado período. |
| Conhecimento | Identificação de que problemas de bateria aparecem com frequência em certos modelos. |
| Sabedoria | Priorizar materiais educativos ou organizar a triagem conforme a demanda observada, sem prometer solução antes da avaliação. |

## Ferramentas utilizadas

| Ferramenta | Finalidade | Licença/custo | Justificativa |
| --- | --- | --- | --- |
| HTML5 | Estrutura semântica e formulário nativo. | Padrão aberto, sem custo. | Funciona sem compilação e favorece acessibilidade. |
| CSS3 | Layout responsivo, cores, foco e transições. | Padrão aberto, sem custo. | Permite uma interface premium sem framework. |
| JavaScript puro | Validação da configuração do endpoint. | ECMAScript é padrão aberto; sem custo. | Mantém uma única configuração e não adiciona dependências. |
| Google Fonts (Manrope) | Tipografia da interface. | SIL Open Font License 1.1; sem custo. | Fonte legível e adequada à identidade visual. |
| Google Apps Script | Receber POST, validar e responder em HTML. | Serviço Google; sem API paga neste projeto, sujeito a cotas. | Integração direta com a planilha e implantação como Web App. |
| Google Sheets | Persistir as solicitações. | Serviço Google; uso sujeito a conta, cotas e políticas. | Facilita acompanhamento acadêmico e organização tabular. |
| GitHub Pages | Hospedar o front-end estático a partir de `/docs`. | Serviço sem custo adicional em cenários elegíveis, sujeito ao plano e às políticas. | É compatível com arquivos estáticos e com o escopo do projeto. |

## Escopo

Este é um projeto acadêmico fictício. A página não representa uma assistência técnica real, não processa pagamentos e não promete preços, prazos, garantias ou resultados de reparo.
