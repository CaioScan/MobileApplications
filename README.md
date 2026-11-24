# Controle de acesso e mapa de pontos

Aplicativo Expo e React Native para cadastrar pontos no mapa e controlar o acesso por perfil. Usuários e pontos são salvos com AsyncStorage no dispositivo em que o app está sendo usado.

| Perfil | Ver pontos | Adicionar pontos | Excluir pontos | Gerenciar usuários e perfis |
| --- | --- | --- | --- | --- |
| Visualizador | Sim | | | |
| Colaborador | Sim | Sim | | |
| Administrador | Sim | Sim | Sim | Sim |

## Executar

```sh
npm ci
npm start
```

Leia o QR code com o Expo Go ou pressione `a` para abrir no emulador Android. Para executar no navegador, use `npm run web`. O mapa-base precisa de conexão com a internet. Builds Android independentes usam o Google Maps e requerem uma [chave configurada para o aplicativo](https://docs.expo.dev/versions/v58.0.0/sdk/map-view/#deploy-app-with-google-maps). O Expo Go já inclui o suporte ao mapa.

## Usar

1. No primeiro acesso, crie a conta administradora e entre com ela.
2. Em **Gerenciar usuários**, cadastre contas ou toque em uma conta para editar seus dados e seu perfil. O perfil inicial é **Visualizador**, e o aplicativo mantém pelo menos um administrador.
3. No mapa, use **Adicionar ponto**, toque no local desejado e informe o nome, a descrição e o tipo do ponto. Os tipos Restaurante, Estacionamento, Ponto turístico e Outro têm pins próprios. Pontos antigos aparecem como Outro. Toque em um marcador ou em um ponto da lista para ver seus detalhes.
4. Como administrador, abra os detalhes de um ponto e use **Excluir ponto**. O app pede confirmação.
5. Use **Sair** para testar outro perfil na mesma instalação.

Cada instalação mantém sua própria lista de usuários e pontos. Contas de uma versão anterior recebem perfil automaticamente: a primeira vira administradora e as demais viram visualizadoras. As permissões são locais e o aplicativo não possui servidor de autenticação nem sincronização entre instalações.

## Verificações

```sh
npm run lint
npm run typecheck
```

### Compilar pelo GitHub

Na aba [Actions](https://github.com/CaioScan/MobileApplications/actions/workflows/build-android.yml), abra **Compilar Android**, clique em **Run workflow** e escolha a branch. A execução verifica o TypeScript, gera o bundle do Expo e compila um APK de depuração para Android ARM64.

Ao concluir, o APK aparece em **Artifacts**. Esse APK de depuração usa um servidor Metro para executar o JavaScript. Para experimentar o app diretamente no celular durante o desenvolvimento, use o Expo Go.
