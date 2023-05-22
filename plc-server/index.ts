import express from 'express'
import * as dotenv from 'dotenv'

import * as plc from '@did-plc/server'
import { AddressInfo } from 'net'

var env = dotenv.config();

export type CloseFn = () => Promise<void>

const app = express()
const port = 8080

export type PlcConfig = {
    port?: number
    version?: string
}
type ServerInfo = {
    port: number
    url: string
    close: CloseFn
  }
  
  export type PlcServerInfo = ServerInfo & {
    ctx: plc.AppContext
  }

  
export const runPlc = async (cfg: PlcConfig): Promise<PlcServerInfo> => {

    const pg_password = process.env.PG_PASSWORD;
    const db = plc.Database.postgres( { url:`postgresql://pgbskyadmin:${pg_password}@bluesky.postgres.database.azure.com:5432/plc?sslmode==prefer` } )//plc.Database.mock()
    await db.migrateToLatestOrThrow()
    const server = plc.PlcServer.create({ db, ...cfg })
    const listener = await server.start()
    const port = (listener.address() as AddressInfo).port
    const url = `http://localhost:${port}`
    return {
      port,
      url,
      ctx: server.ctx,
      close: async () => {
        await server.destroy()
      },
    }
  }

  //const keypair = await crypto.EcdsaKeypair.create()

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  /*
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
*/
//runPlc({ port:2582})
runPlc({ port:8080})



