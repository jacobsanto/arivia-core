import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ConnectionPool {
  connections: any[]
  activeConnections: number
  maxConnections: number
}

const connectionPool: ConnectionPool = {
  connections: [],
  activeConnections: 0,
  maxConnections: 10
}

serve(async (req) => {
  try {
    const { query, operation, params } = await req.json()

    // Get available connection from pool
    const connection = await getPooledConnection()

    let result
    switch (operation) {
      case 'select':
        result = await connection.from(params.table).select(params.select || '*')
        break
      case 'insert':
        result = await connection.from(params.table).insert(params.data)
        break
      case 'update':
        result = await connection.from(params.table).update(params.data).eq(params.id_column, params.id)
        break
      case 'delete':
        result = await connection.from(params.table).delete().eq(params.id_column, params.id)
        break
      case 'rpc':
        result = await connection.rpc(params.function_name, params.function_params)
        break
      default:
        // Raw query execution
        result = await connection.rpc('execute_raw_query', { query_text: query })
    }

    // Release connection back to pool
    releaseConnection(connection)

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        error: result.error
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // 1 minute cache
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getPooledConnection() {
  // Reuse existing connection if available
  if (connectionPool.connections.length > 0) {
    connectionPool.activeConnections++
    return connectionPool.connections.pop()
  }

  // Create new connection if under limit
  if (connectionPool.activeConnections < connectionPool.maxConnections) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    connectionPool.activeConnections++
    return supabase
  }

  // Wait for available connection
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (connectionPool.connections.length > 0) {
        clearInterval(interval)
        connectionPool.activeConnections++
        resolve(connectionPool.connections.pop())
      }
    }, 100)
  })
}

function releaseConnection(connection: any) {
  connectionPool.activeConnections--
  connectionPool.connections.push(connection)
}