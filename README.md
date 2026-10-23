# 📚 Notas Técnicas

Sistema web de treinamento baseado em **Notas Técnicas**, desenvolvido para permitir que usuários estudem conteúdos, consultem documentos em PDF e realizem exercícios de avaliação.

O sistema possui interface responsiva para **computadores, notebooks, tablets e celulares**, mantendo as funcionalidades disponíveis em uma única aplicação.

---

## 🚀 Tecnologias utilizadas

* **React**
* **Vite**
* **Tailwind CSS**
* **Supabase**
* **PostgreSQL**
* **JavaScript**
* **HTML5**
* **CSS**
* **PDF via Supabase Storage**

---

## 🎯 Funcionalidades

### 📖 Notas Técnicas

* Listagem das Notas Técnicas disponíveis.
* Identificação por número:

  * NT-001
  * NT-002
  * NT-003
  * etc.
* Visualização do conteúdo da Nota Técnica.
* Descrição e informações complementares.
* Status de progresso.

### 📄 Documentos PDF

Cada Nota Técnica pode possuir um documento PDF associado.

O sistema permite:

* Visualização do PDF dentro da página.
* Visualização responsiva em dispositivos móveis.
* Acesso a todas as páginas do documento.
* Zoom através do visualizador do navegador.
* Botão **"📄 Abrir PDF completo"** como alternativa para celulares quando o navegador não renderizar corretamente o PDF incorporado.

O arquivo original do PDF é mantido no **Supabase Storage**.

---

## 📝 Exercícios

Cada Nota Técnica pode possuir questões relacionadas ao conteúdo estudado.

O usuário pode:

1. Acessar uma Nota Técnica.
2. Ler o conteúdo.
3. Visualizar o PDF.
4. Iniciar o exercício.
5. Responder às questões.
6. Receber feedback.
7. Finalizar o exercício.
8. Visualizar o resultado.

O sistema registra:

* Quantidade de acertos.
* Total de questões.
* Nota final.
* Tempo utilizado.
* Status do exercício.

---

## 📊 Controle de progresso

O progresso dos usuários é armazenado no Supabase.

Os status utilizados são:

```text
nao_iniciada
em_andamento
concluida
```

Cada usuário possui um registro de progresso por Nota Técnica.

A estrutura utiliza uma restrição única:

```text
(user_id, nota_id)
```

Isso garante que o mesmo usuário não tenha vários registros de progresso para a mesma Nota Técnica.

---

## 👤 Identificação do usuário

O sistema utiliza autenticação e identificação através do Supabase.

O progresso é associado ao usuário autenticado.

Cada registro possui:

```text
user_id
nota_id
status
acertos
total_questoes
nota
tempo_segundos
created_at
updated_at
```

---

## 🔐 Segurança

O sistema utiliza **Row Level Security (RLS)** no Supabase.

O usuário autenticado pode:

* Consultar seu próprio progresso.
* Criar seu próprio progresso.
* Atualizar seu próprio progresso.

O usuário não deve conseguir acessar o progresso de outros usuários.

---

## 📱 Responsividade

A aplicação utiliza uma única interface adaptativa.

Compatibilidade planejada para:

* 🖥️ Desktop
* 💻 Notebook
* 📱 Android
* 📱 iPhone
* 📲 Tablet

Não existe uma aplicação separada para celular.

O layout utiliza recursos responsivos do Tailwind CSS para adaptar:

* Header
* Cards
* Botões
* Exercícios
* Alternativas
* Formulários
* Resultados
* PDFs
* Painéis administrativos

---

## 🗂️ Estrutura do projeto

Uma estrutura simplificada:

```text
src/
├── components/
│   ├── AlternativaButton.jsx
│   ├── ConteudoNota.jsx
│   ├── FeedbackResposta.jsx
│   ├── NotaCard.jsx
│   ├── ProgressBar.jsx
│   └── StatusBadge.jsx
│
├── data/
│   └── useNotas.js
│
├── hooks/
│   ├── useDarkMode.js
│   └── useProgress.js
│
├── pages/
│   ├── Home.jsx
│   ├── NotaTecnica.jsx
│   ├── Exercicio.jsx
│   ├── Conclusao.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminForm.jsx
│   └── AdminLogin.jsx
│
├── lib/
│   └── supabase.js
│
├── App.jsx
└── main.jsx
```

A estrutura pode variar conforme a versão atual do projeto.

---

## ⚙️ Instalação

### 1. Clonar o projeto

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd nome-do-projeto
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o Supabase

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Substitua os valores pelas credenciais do seu projeto Supabase.

> Nunca publique chaves privadas ou credenciais administrativas no código-fonte.

---

## ▶️ Executar em desenvolvimento

Execute:

```bash
npm run dev
```

O Vite iniciará o servidor local.

Normalmente será exibido um endereço semelhante a:

```text
http://localhost:5173
```

---

## 🏗️ Gerar versão de produção

Execute:

```bash
npm run build
```

O Vite irá gerar a versão otimizada do projeto.

O resultado normalmente ficará na pasta:

```text
dist/
```

---

## 🔎 Testar a versão de produção

Depois do build, pode ser utilizado:

```bash
npm run preview
```

---

## 🗄️ Banco de dados

As principais tabelas utilizadas pelo sistema incluem:

```text
notas_tecnicas
questoes
progresso
```

### Relacionamentos

As questões são relacionadas às Notas Técnicas através do ID da nota.

O progresso também utiliza o ID da Nota Técnica.

É importante **não alterar os IDs das Notas Técnicas sem atualizar os relacionamentos**, pois as questões podem possuir chaves estrangeiras vinculadas a esses IDs.

---

## 🔢 ID x Número da Nota

O sistema utiliza dois conceitos diferentes:

### ID

É o identificador interno do banco de dados.

Exemplo:

```text
ID = 5
```

### Número

É o número apresentado ao usuário:

```text
numero = 1
```

Nesse caso:

```text
ID 5
Número 1
→ NT-001
```

Portanto, o código deve utilizar:

```javascript
nota.id
```

para identificar a Nota Técnica internamente.

E:

```javascript
nota.numero
```

para exibir o número ao usuário.

Exemplo:

```text
ID 5 + número 1 → NT-001
ID 1 + número 2 → NT-002
ID 2 + número 3 → NT-003
```

---

## 🛡️ Não alterar IDs sem necessidade

As questões possuem relacionamento com as Notas Técnicas.

Por isso, não é recomendado alterar ou excluir diretamente um ID utilizado por questões.

Exemplo de relacionamento:

```text
notas_tecnicas
       │
       │ id
       ▼
    questoes
```

Alterações incorretas podem gerar erros de chave estrangeira como:

```text
violates foreign key constraint
```

---

## 📈 Progresso do usuário

O sistema mantém um único progresso para cada combinação:

```text
usuário + Nota Técnica
```

Exemplo:

```text
Usuário A + NT-001
Usuário A + NT-002
Usuário A + NT-003
```

Cada combinação deve possuir somente um registro.

A restrição utilizada é:

```sql
unique (user_id, nota_id)
```

Por isso, o código da aplicação deve atualizar o progresso existente em vez de criar registros duplicados.

---

## 🧪 Testes

Antes de publicar uma alteração, recomenda-se executar:

```bash
npm run build
```

Também devem ser testados:

* Login
* Acesso às Notas Técnicas
* Visualização do conteúdo
* Visualização do PDF
* Abertura do PDF no celular
* Início do exercício
* Respostas
* Resultado
* Progresso
* Conclusão
* Modo escuro
* Responsividade

---

## 📱 Teste em celular

Para validar a interface mobile:

1. Execute o projeto.
2. Acesse pelo celular.
3. Abra uma Nota Técnica.
4. Verifique o conteúdo.
5. Abra o PDF.
6. Navegue por todas as páginas.
7. Teste o botão **"📄 Abrir PDF completo"**.
8. Inicie um exercício.
9. Responda às questões.
10. Finalize e verifique o resultado.

---

## 🌐 Deploy

O projeto pode ser hospedado em serviços compatíveis com aplicações Vite, como:

* Netlify
* Vercel
* Outros serviços de hospedagem para aplicações frontend

As variáveis de ambiente do Supabase devem ser configuradas no ambiente de produção.

---

## ⚠️ Variáveis de ambiente

Não envie o arquivo `.env` para o GitHub.

O `.gitignore` deve conter:

```text
.env
.env.local
.env.production
node_modules/
dist/
```

---

## 📌 Boas práticas

Ao realizar alterações:

* Não modificar IDs das Notas Técnicas sem necessidade.
* Não remover relacionamentos do banco.
* Não alterar regras do Supabase sem verificar as dependências.
* Não duplicar componentes para criar uma versão mobile.
* Preferir classes responsivas do Tailwind.
* Executar `npm run build` depois das alterações.
* Testar o sistema em desktop e celular.
* Não expor credenciais privadas do Supabase.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido para treinamento e avaliação através de Notas Técnicas, exercícios e acompanhamento de progresso dos usuários.

---

## 📄 Licença

Projeto de uso interno.

A distribuição, cópia ou publicação do código deve seguir as regras definidas pelo responsável pelo projeto.
