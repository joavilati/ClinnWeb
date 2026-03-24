const http = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
// Na King Host, a porta costuma vir em PORT_<NOME_DO_SCRIPT>.
const port = Number.parseInt(process.env.PORT_SERVER || process.env.PORT || '8000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })
  .catch((error) => {
    console.error('Erro ao iniciar o servidor Next.js', error)
    process.exit(1)
  })
