# AWS CodePipeline Monitor
Extensão do Google Chrome utilizada para criar um monitor com as informações de build da AWS Code Pipeline.

Ao invés de deixar várias abas do Code Pipeline abertas dificultando a visualização, a extensão agrupa todas as abas em uma só facilitando o uso.

![](https://github.com/LVCarnevalli/codepipeline-monitor/blob/master/screen.png?raw=true)

###Como utilizar:
------------

1. Abra o endereço do AWS Code Pipeline nas abas do Chrome.
	*Por exemplo: https://console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/pipeline*
	
	**Atenção**: Para que o monitor funcione é necessário que as abas com os pipelines fique em background abertas, a extensão apenas agrupa as  abas.

2. Clique no ícone da extensão que o dashboard será criado.

###Configuração:
------------

Abra as opções da extensão e configure de acordo com a sua necessidade:

    {
        "codepipeline": {
            "interval": 5000,
            "statuses": {
                "failed": "Failed",
                "progress": "In Progress",
                "succeeded": "Succeeded"
            },
            "url": "console.aws.amazon.com/codepipeline"
        },
        "plugins": {
            "autologin": {
                "active": false,
                "interval": 60000,
                "password": "",
                "user": ""
            },
            "autorefresh": {
                "active": false,
                "interval": 300000
            },
            "slackonfailure": {
                "active": false,
                "channel": "",
                "url": "",
                "username": ""
            }
        }
    }


|  Plugin | Configuração
| ------------ |
| autologin  | Ao identificar que a sessão do AWS foi interrompida o login será feito preenchendo o usuário e senha configurado e acionando o botão login.
| autorefresh  | Atualiza a página do pipeline de acordo com o tempo configurado.
| slackonfailure | Se falhar alguma build uma mensagem será enviada para o Slack configurado.

Para alterar as configurações basta alterar o JSON e fechar a janela de opções.

###Desenvolvimento:
------------

**Ambiente:**

Executar e atualizar o código automaticamente:

```shell
gulp watch
```

**Dependências:**
- Gridstack: https://troolee.github.io/gridstack.js/
- Yeoman generator Chrome Extension: https://github.com/yeoman/generator-chrome-extension
- Knockout JS: http://knockoutjs.com/
