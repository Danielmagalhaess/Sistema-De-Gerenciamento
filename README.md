# Sistema de Gerenciamento de Cursos

## 📚 Descrição do Projeto

O **Sistema de Gerenciamento de Cursos** é uma aplicação web robusta e modular, desenvolvida com a arquitetura **Model-View-Controller (MVC)**, para otimizar a administração de instituições de ensino. Seu objetivo principal é fornecer uma plataforma centralizada para gerenciar todos os aspectos dos cursos, incluindo a organização de turmas, valores, acompanhamento detalhado de aulas, e a gestão de **docentes**, **usuários** e **eventos** (como feriados e calendário).

A plataforma disponibiliza informações essenciais para o acompanhamento, como manual de utilização, nome dos cursos, datas de início e término, horários das aulas, status de ocupação das vagas e o progresso do planejamento de cada curso.

O calendário marca azul como dia que terá aula e em amarelo os feriados

A aplicação foi projetada para ser intuitiva, contando com o auxílio do **Driver.js** para guiar novos usuários através de um tutorial interativo sobre como utilizar o sistema.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura moderna baseada em Node.js e o padrão MVC (Model-View-Controller).

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Arquitetura** | MVC | Padrão de design para desenvolvimento modular e escalável. |
| **Backend** | Node.js | Ambiente de execução JavaScript. |
| **Framework Web** | Express | Framework minimalista e flexível para Node.js. |
| **Banco de Dados** | MySQL / MariaDB | Sistema de gerenciamento de banco de dados relacional. |
| **Template Engine** | EJS (Embedded JavaScript) | Para renderização dinâmica das páginas HTML. |
| **Estilização** | Tailwind CSS | Framework CSS *utility-first* para um design rápido e responsivo. |
| **Autenticação** | `bcrypt` | Para criptografia segura de senhas. |
| **Sessão** | `express-session` | Gerenciamento de sessões de usuário. |
| **Validação** | `express-validator` | Para validação de dados de entrada. |
| **Tutorial** | Driver.js | Biblioteca para criar tours de produtos e guias de usuário. |
| **Outras** | `moment`, `mysql2`, `nodemon` | Utilidades para manipulação de datas, conexão com DB e desenvolvimento. |

## ✨ Funcionalidades Principais

O sistema oferece um conjunto de funcionalidades essenciais para o gerenciamento de cursos, com um foco especial na segurança e no controle de acesso através de um sistema de permissões.

### Gerenciamento de Cursos e Eventos

*   **Visão Geral:** Acompanhamento de métricas importantes, como o total de turmas ativas, valores de mensalidades e a quantidade de aulas por curso.
*   **Busca e Filtros:** Capacidade de pesquisar cursos por nome, docente e nível.
*   **Matrículas:** Controle e edição da quantidade de matrículas e alunos matriculados por turma.
*   **Calendário Inteligente:** Visualização integrada de todas as aulas e eventos. O sistema reagenda automaticamente as aulas que coincidirem com feriados ou pontos facultativos, garantindo a continuidade das atividades acadêmicas.

### Gerenciamento de Pessoas

*   **Gerenciamento de Docentes:** Acesso a informações atualizadas sobre o status dos docentes (ativos, inativos, em licença ou férias).
*   **Gerenciamento de Usuários:** Cadastro, edição e exclusão de usuários, com a possibilidade de definir o nível de acesso (**Gestão** ou **Assistente**).

### Sistema de Permissões

O sistema é estruturado com duas visualizações de tela e níveis de acesso distintos para garantir que cada usuário tenha apenas as permissões necessárias para sua função.

| Perfil | Acesso Completo | Edição de Matrículas/Matriculados | Gerenciamento de Docentes/Feriados/Usuários | Exclusão de Dados |
| :--- | :--- | :--- | :--- | :--- |
| **Gestão** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Assistente** | ❌ Não | ✅ Sim (Apenas Matrículas/Matriculados) | ❌ Não | ❌ Não (Ícone de exclusão oculto) |

O perfil **Assistente** tem acesso limitado à **Home** e ao **Calendário**, podendo realizar apenas edições específicas relacionadas à contagem de alunos, sem a capacidade de gerenciar docentes, feriados ou excluir registros.

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

Certifique-se de ter o seguinte software instalado:

*   [Node.js](https://nodejs.org/) (versão LTS recomendada)
*   [MySQL](https://www.mysql.com/) ou [MariaDB](https://mariadb.org/)

### 1. Clonar o Repositório

```bash
git clone https://github.com/Danielmagalhaess/Sistema-De-Gerenciamento.git
cd Sistema-De-Gerenciamento
```

### 2. Instalar Dependências

Utilize o npm para instalar todas as dependências do projeto:

```bash
npm install
```

### 3. Configurar o Banco de Dados

O projeto utiliza um banco de dados MySQL/MariaDB.

1.  Acesse seu sistema de gerenciamento de banco de dados (ex: phpMyAdmin, HeidiSQL, MySQL Workbench).
2.  Importe o arquivo `bancoDeDados/BancoDeDados.sql`. Este script irá criar o banco de dados chamado `gerenciamento_1` e todas as tabelas necessárias, além de popular com dados iniciais (se houver).
3.  **Importante:** Verifique o arquivo `index.js` ou um arquivo de configuração de banco de dados (se existir) para garantir que as credenciais de conexão (usuário, senha, host) estejam corretas para o seu ambiente local.

### 4. Executar a Aplicação

Você pode iniciar o servidor em modo de desenvolvimento (com `nodemon` para *hot-reload*) ou em modo de produção.

**Modo de Desenvolvimento:**

```bash
npm run dev
```

**Modo de Produção:**

```bash
npm start
```

A aplicação estará acessível em `http://localhost:3000` (ou a porta configurada no `index.js`).

## 🤝 Contribuição

Se você deseja contribuir para este projeto, sinta-se à vontade para abrir *issues* ou enviar *pull requests*.

## 📄 Licença

Este projeto está licenciado sob a licença ISC.
