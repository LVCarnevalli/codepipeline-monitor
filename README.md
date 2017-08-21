# AWS CodePipeline Monitor
Extensão do Google Chrome, utilizada para criar um monitor com as informações de build da AWS Code Pipeline.

### Instalação:
1. Abra a aba de extensões do Chrome "chrome://extensions/".
2. Arraste o arquivo ["app.crx"](https://github.com/LVCarnevalli/codepipeline-monitor/blob/master/app.crx) para a aba que a instalação será realizada.

### Como utilizar:
1. Abra o endereço do AWS CodePipeline nas abas do Chrome, e verifique que a URL da pipeline segue o padrão "console.aws.amazon.com/codepipeline".
2. Clique no ícone da extensão que o dashboard será criado.

**Atenção**: *É necessário que as outras abas do AWS CodePipeline fiquem abertas no Chrome, pois a extensão faz a atualização das informações com base nessas abas. Desta maneira a extensão não faz request e não necessita de cookies.*

### Dependências:
- Gridstack: https://troolee.github.io/gridstack.js/
- Yeoman generator Chrome Extension: https://github.com/yeoman/generator-chrome-extension
- Knockout JS: http://knockoutjs.com/
