import { useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { login as apiLogin, logout as apiLogout, getStoredSession } from './lib/auth.js'
import { createBlueprint, deleteBlueprint, getBlueprint, getByAuthor, updateBlueprint } from './lib/blueprintsApi.js'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'
const STOMP_BASE = import.meta.env.VITE_STOMP_BASE ?? API_BASE
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 400

function pointsFrom(value) {
  return Array.isArray(value?.points) ? value.points : Array.isArray(value) ? value : []
}

function errorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback
}

export default function App() {
  const [session, setSession] = useState(() => getStoredSession())
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [tech, setTech] = useState('stomp')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [blueprints, setBlueprints] = useState([])
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const canvasRef = useRef(null)
  const stompRef = useRef(null)
  const unsubRef = useRef(null)

  const canWrite = Boolean(session?.scopes?.includes('blueprints.write'))
  const selectedBlueprint = blueprints.find((blueprint) => blueprint.name === name)

  function drawPoints(nextPoints) {
    const context = canvasRef.current?.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    if (!nextPoints.length) return
    context.beginPath()
    nextPoints.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    })
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#ef8354'
    context.stroke()
  }

  async function refreshBlueprints() {
    if (!author.trim()) return
    try {
      const result = await getByAuthor(author.trim())
      setBlueprints(Array.isArray(result) ? result : result?.blueprints ?? [])
    } catch (error) {
      setBlueprints([])
      setNotice({ type: 'error', text: errorMessage(error, 'No se pudo cargar la lista de planos.') })
    }
  }

  async function loadBlueprint() {
    if (!author.trim() || !name.trim()) return
    setLoading(true)
    try {
      const blueprint = await getBlueprint(author.trim(), name.trim())
      setPoints(pointsFrom(blueprint))
      setNotice({ type: '', text: '' })
    } catch (error) {
      setPoints([])
      setNotice({ type: 'error', text: errorMessage(error, 'No se pudo cargar el plano seleccionado.') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) refreshBlueprints()
  }, [author, session])

  useEffect(() => {
    if (session) loadBlueprint()
  }, [author, name, session])

  useEffect(() => {
    drawPoints(points)
  }, [points])

  useEffect(() => {
    if (!session || tech !== 'stomp' || !author.trim() || !name.trim()) return undefined
    const client = createStompClient(STOMP_BASE)
    stompRef.current = client
    client.onConnect = () => {
      unsubRef.current = subscribeBlueprint(client, author.trim(), name.trim(), (update) => setPoints(pointsFrom(update)))
    }
    client.activate()
    return () => {
      unsubRef.current?.unsubscribe?.()
      unsubRef.current = null
      client.deactivate()
      stompRef.current = null
    }
  }, [author, name, session, tech])

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')
    try {
      setSession(await apiLogin(loginForm.username.trim(), loginForm.password))
    } catch (error) {
      setLoginError(errorMessage(error, 'Credenciales inválidas.'))
    }
  }

  function handleLogout() {
    apiLogout()
    setSession(null)
  }

  function handleCanvasClick(event) {
    if (!canWrite) return
    const rectangle = event.currentTarget.getBoundingClientRect()
    const point = {
      x: Math.round(((event.clientX - rectangle.left) / rectangle.width) * CANVAS_WIDTH),
      y: Math.round(((event.clientY - rectangle.top) / rectangle.height) * CANVAS_HEIGHT),
    }
    setPoints((currentPoints) => [...currentPoints, point])
    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({ destination: '/app/draw', body: JSON.stringify({ author: author.trim(), name: name.trim(), point }) })
    }
  }

  async function handleCreate() {
    if (!author.trim() || !name.trim()) return
    setSaving(true)
    try {
      await createBlueprint({ author: author.trim(), name: name.trim(), points: [] })
      setPoints([])
      await refreshBlueprints()
      setNotice({ type: '', text: `El plano ${name} fue creado.` })
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'No se pudo crear el plano.') })
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    setSaving(true)
    try {
      await updateBlueprint(author.trim(), name.trim(), points)
      await refreshBlueprints()
      setNotice({ type: '', text: `El plano ${name} fue actualizado.` })
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'No se pudo actualizar el plano.') })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteBlueprint(author.trim(), name.trim())
      setPoints([])
      await refreshBlueprints()
      setNotice({ type: '', text: `El plano ${name} fue eliminado.` })
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'No se pudo eliminar el plano.') })
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return <main className="login"><section className="login-card"><p className="eyebrow">Laboratorio P4</p><h1>BluePrints en tiempo real</h1><p className="muted">Inicia sesión para dibujar, guardar y colaborar.</p><form className="login-form" onSubmit={handleLogin}><div className="field"><label htmlFor="username">Usuario</label><input id="username" value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} required /></div><div className="field"><label htmlFor="password">Contraseña</label><input id="password" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required /></div><button className="button" type="submit">Entrar</button></form>{loginError && <p className="notice error" role="alert">{loginError}</p>}</section></main>
  }

  const totalPoints = blueprints.reduce((total, blueprint) => total + Number(blueprint.totalPoints ?? blueprint.pointCount ?? blueprint.points?.length ?? 0), 0)
  return <main className="app-shell"><header className="topbar"><div className="brand"><div className="brand-mark">BP</div><div><p className="eyebrow">Laboratorio P4</p><h1>BluePrints colaborativos</h1></div></div><div className="session"><span>Sesión de <strong>{session.username}</strong></span><button className="button secondary" onClick={handleLogout}>Cerrar sesión</button></div></header><div className="layout"><aside className="panel" aria-label="Panel del autor"><div className="panel-header"><div><p className="eyebrow">Explorar</p><h2>Planos de {author || 'autor'}</h2></div><span className="count">{blueprints.length} planos</span></div><div className="blueprint-list">{blueprints.map((blueprint) => { const blueprintPoints = Number(blueprint.totalPoints ?? blueprint.pointCount ?? blueprint.points?.length ?? 0); return <button className={`blueprint-row ${blueprint.name === name ? 'active' : ''}`} key={blueprint.name} onClick={() => setName(blueprint.name)}><span><strong>{blueprint.name}</strong><span>Plano colaborativo</span></span><span>{blueprintPoints} puntos</span></button> })}{!blueprints.length && <p className="empty">No hay planos para este autor todavía.</p>}</div><p className="canvas-note"><span>Total de puntos</span><strong>{totalPoints}</strong></p></aside><section className="workspace"><div className="workspace-head"><div><p className="eyebrow">Área de trabajo</p><h2>{name || 'Nuevo plano'}</h2><p className="muted">Dibuja por clics y comparte el mismo plano en otra pestaña.</p></div><span className="count">{points.length} puntos activos</span></div>{notice.text && <p className={`notice ${notice.type}`} role="status">{notice.text}</p>}<div className="controls"><div className="field"><label htmlFor="author">Autor</label><input id="author" value={author} onChange={(event) => setAuthor(event.target.value)} /></div><div className="field"><label htmlFor="name">Nombre del plano</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="field"><label htmlFor="technology">Tiempo real</label><select id="technology" value={tech} onChange={(event) => setTech(event.target.value)}><option value="none">None (solo local)</option><option value="stomp">STOMP (Spring)</option></select></div></div>{canWrite && <div className="actions"><button className="button" onClick={handleCreate} disabled={saving}>Crear</button><button className="button" onClick={handleUpdate} disabled={saving || !selectedBlueprint}>Guardar / actualizar</button><button className="button danger" onClick={handleDelete} disabled={saving || !selectedBlueprint}>Eliminar</button></div>}<div className="canvas-wrap"><canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={handleCanvasClick} aria-label="Lienzo del blueprint" /></div><div className="canvas-note"><span>{loading ? 'Cargando plano...' : canWrite ? 'Haz clic en el lienzo para agregar puntos.' : 'Tu sesión no tiene permisos de escritura.'}</span><span>{tech === 'stomp' ? 'STOMP conectado al seleccionar el plano' : 'Modo local'}</span></div></section></div></main>
}
