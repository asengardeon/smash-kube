# Smash Kube 🚀

[![CI](https://github.com/smash-kube/smash-kube/actions/workflows/ci.yml/badge.svg)](https://github.com/smash-kube/smash-kube/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma interface gráfica (GUI) moderna e intuitiva para visualização e consulta de clusters Kubernetes, com foco especial em ambientes **Amazon EKS**. O projeto foi desenvolvido para facilitar a vida de desenvolvedores e engenheiros de plataforma que precisam de uma visão rápida e detalhada de seus recursos sem a necessidade de comandos complexos no terminal.

Este é um projeto **Open Source**. Contribuições são muito bem-vindas! Veja o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para saber como ajudar.

![Visão Geral do Smash Kube](assets/screenshots/main-view.png)
*(Sugestão: Adicione aqui uma captura de tela da tela principal)*

## 🎯 Funcionalidades Principais

- **Gestão de Clusters Local**: Adicione e gerencie múltiplos clusters EKS em uma única interface. As configurações são armazenadas localmente com segurança.
- **Autenticação Flexível**:
  - Suporte total a **AWS SSO (IAM Identity Center)** via perfis do AWS CLI.
  - Suporte a credenciais manuais (Access Key, Secret Key e Session Token) para conexões temporárias.
  - Suporte a **Kubeconfig Local** (padrão ou caminho customizado).
- **Visualização de Recursos**:
  - **Workloads**: Pods, Deployments, StatefulSets, DaemonSets, Jobs, CronJobs e HPAs.
  - **Rede**: Services, Ingresses e Endpoints.
  - **Configuração**: ConfigMaps, Secrets e ResourceQuotas.
  - **Armazenamento**: PersistentVolumes (PV), PersistentVolumeClaims (PVC) e StorageClasses.
  - **Cluster**: Visão geral de Nodes e Eventos do cluster.
- **Inspeção Técnica Avançada**:
  - **Describe Nativo**: Visualização técnica detalhada de qualquer recurso, simulando o comando `kubectl describe` sem a necessidade do binário instalado no sistema.
  - **Inspeção JSON**: Acesso direto à representação original do objeto no Kubernetes.
  - **Logs em Tempo Real**: Visualização de logs de Pods com suporte a logs da execução anterior (pre-restart).
- **Modo Somente Consulta**: A aplicação foi desenhada para ser segura, permitindo apenas a visualização de recursos, eliminando o risco de exclusões acidentais em produção.

## 📸 Guia de Uso Visual

### 1. Adicionando um Cluster
Abra o modal de adição de cluster clicando no botão **"+"** na barra lateral. O Smash Kube oferece três formas de conexão:

#### A. AWS SSO (Recomendado para EKS)
Ideal para empresas que utilizam o IAM Identity Center.
- **AWS Profile**: O nome do perfil configurado no seu `~/.aws/config`.
- **AWS Region**: A região onde o cluster EKS está localizado.
- **SSO Start URL (Opcional)**: Caso precise disparar o login automático.

#### B. Manual Keys (Credenciais Temporárias)
Útil para sessões rápidas com tokens de curta duração.
- **Access Key ID**, **Secret Access Key** e **Session Token**.

#### C. Kubeconfig Local
Permite usar contextos já configurados na sua máquina (EKS, Minikube, Kind, etc).
- **Caminho do Kubeconfig (Opcional)**: Se deixado em branco, utiliza o padrão `~/.kube/config`. Caso contrário, informe o caminho completo para o arquivo.

> **Dica:** Para obter o arquivo de configuração de um cluster EKS via terminal, você pode executar:
> ```bash
> aws eks update-kubeconfig --name <NOME_CLUSTER> --region <REGIAO> --profile <PROFILE>
> ```

![Adicionar Cluster](assets/screenshots/add-cluster.png)

### 2. Navegando pelos Recursos
Utilize a barra lateral para alternar entre as diferentes categorias de recursos do Kubernetes.

![Navegação](assets/screenshots/navigation.png)

### 3. Describe e Logs
Clique nos ícones de ação para ver detalhes técnicos ou logs em tempo real.

![Describe e Logs](assets/screenshots/describe-logs.png)

## 🛠️ Tecnologias Utilizadas

- **Electron**: Framework para aplicação desktop cross-platform.
- **React**: Interface de usuário reativa e moderna.
- **Tailwind CSS**: Estilização rápida com foco em design escuro (Dark Mode).
- **@kubernetes/client-node**: Cliente oficial para comunicação direta com a API do Kubernetes.
- **Lucide React**: Biblioteca de ícones elegantes.

## ✅ Pré-requisitos

Para utilizar o Smash Kube, você precisará de:

1.  **AWS CLI** instalado e configurado em sua máquina.
2.  Permissões de leitura no cluster EKS alvo.
3.  **Node.js** (apenas se desejar compilar o projeto a partir do código fonte).

> **Nota importante:** Diferente de outras ferramentas, o Smash Kube **NÃO exige** o `kubectl` instalado para funcionar, pois utiliza a API nativa do Kubernetes.

## 🚀 Como Executar (Desenvolvimento)

Se você estiver clonando este repositório para desenvolvimento:

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento (Webpack + Electron)
npm start
```

## 📦 Build e Distribuição

Para gerar o executável (dmg, exe ou appimage) para o seu sistema:

```bash
npm run build
```
Os arquivos gerados estarão na pasta `dist/`.

## 🔐 Segurança e Privacidade

- **Credenciais**: A aplicação utiliza os perfis de autenticação já configurados na sua máquina via AWS CLI ou chaves temporárias fornecidas por você. Nenhuma credencial AWS é enviada para servidores externos.
- **Kubeconfig**: O projeto gerencia a atualização automática do contexto do Kubernetes (`~/.kube/config`) para garantir que as chamadas de API sejam sempre autenticadas corretamente.

---
Desenvolvido com o objetivo de simplificar a observabilidade de clusters Kubernetes.
