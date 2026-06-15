// src/pages/Porra.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { partidosFaseGrupos } from '../data/partidosMundial'
import { USERS } from '../data/usersConfig'
import './Porra.css'

// Función para saber si un partido ya ha comenzado con reloj exacto de España
const comprobarPartidoComenzado = (timestamp) => {
  if (!timestamp) return false
  const msPartido = new Date(timestamp).getTime()
  if (isNaN(msPartido)) return false
  return Date.now() >= msPartido
}

// Comprueba si han transcurrido 3 horas o más desde el inicio del partido
const comprobarPartidoArchivado = (timestamp) => {
  if (!timestamp) return false
  const msPartido = new Date(timestamp).getTime()
  if (isNaN(msPartido)) return false
  const TRES_HORAS_MS = 3 * 60 * 60 * 1000
  return Date.now() >= (msPartido + TRES_HORAS_MS)
}

export default function Porra() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('miporra')
  const [misResultados, setMisResultados] = useState({})
  const [resultadosOriginales, setResultadosOriginales] = useState({}) 
  const [loadingGuardar, setLoadingGuardar] = useState(false)
  
  // Estados de control para los acordeones de partidos archivados
  const [archivadosOpenMiPorra, setArchivadosOpenMiPorra] = useState(false)
  const [archivadosOpenGrupo, setArchivadosOpenGrupo] = useState(false)

  // Estados para la clasificación
  const [clasificacion, setClasificacion] = useState([])
  const [loadingClasi, setLoadingClasi] = useState(false)

  // Estados para ver a los demás
  const [miembroSeleccionado, setMiembroSeleccionado] = useState('Abel')
  const [porraOtro, setPorraOtro] = useState(null)
  const [cargandoOtro, setCargandoOtro] = useState(false)

  // Estados para el resumen global
  const [pronosticosGlobales, setPronosticosGlobales] = useState({})
  const [loadingGlobal, setLoadingGlobal] = useState(false)
  const [expandedMatch, setExpandedMatch] = useState(null) 
  
  const miembros = USERS.map(u => u.nombre).sort()

  // ── 1. CARGAR MI PORRA AL ENTRAR ──
  useEffect(() => {
    if (!user) return
    async function cargarMiPorra() {
      const { data: pronosticos } = await supabase.from('porra_pronosticos').select('partido_id, goles_local, goles_visitante').eq('user_id', user.id)
      if (pronosticos) {
        const resultadosGuardados = {}
        pronosticos.forEach(p => {
          resultadosGuardados[p.partido_id] = { local: p.goles_local, visitante: p.goles_visitante }
        })
        setMisResultados(resultadosGuardados)
        setResultadosOriginales(JSON.parse(JSON.stringify(resultadosGuardados)))
      }
    }
    cargarMiPorra()
  }, [user])

  // ── 2. CARGAR CLASIFICACIÓN ──
  useEffect(() => {
    if (activeTab === 'clasificacion') {
      cargarRanking()
    }
  }, [activeTab])

  // ── 3. CARGAR PORRA DE OTRO MIEMBRO ──
  useEffect(() => {
    if (activeTab === 'grupo') {
      async function cargarPorraAmigo() {
        setCargandoOtro(true)
        const userObj = USERS.find(u => u.nombre === miembroSeleccionado)
        if (!userObj) return

        const { data: pronosticos } = await supabase.from('porra_pronosticos').select('*').eq('user_id', userObj.id)
        if (pronosticos) {
          const formateado = {}
          pronosticos.forEach(p => { formateado[p.partido_id] = { local: p.goles_local, visitante: p.goles_visitante } })
          setPorraOtro(formateado)
        }
        setCargandoOtro(false)
      }
      cargarPorraAmigo()
    }
  }, [activeTab, miembroSeleccionado])

  // ── 4. CARGAR RESUMEN GLOBAL ──
  useEffect(() => {
    if (activeTab === 'resumen') {
      async function cargarResumenGlobal() {
        setLoadingGlobal(true)
        const { data: pronosticos } = await supabase.from('porra_pronosticos').select('*')
        if (pronosticos) {
          const agrupados = {}
          pronosticos.forEach(p => {
            if (!agrupados[p.partido_id]) agrupados[p.partido_id] = []
            const userObj = USERS.find(u => u.id === p.user_id)
            if (userObj) {
              agrupados[p.partido_id].push({
                nombre: userObj.nombre,
                color: userObj.color,
                local: p.goles_local,
                visitante: p.goles_visitante
              })
            }
          })
          Object.keys(agrupados).forEach(k => {
            agrupados[k].sort((a, b) => a.nombre.localeCompare(b.nombre))
          })
          setPronosticosGlobales(agrupados)
        }
        setLoadingGlobal(false)
      }
      cargarResumenGlobal()
    }
  }, [activeTab])

  const handleScoreChange = (partidoId, tipo, valor) => {
    setMisResultados(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [tipo]: valor === '' ? '' : Number(valor)
      }
    }))
  }

  // ── GUARDAR Y VERIFICACIÓN DE SEGURIDAD ──
  const handleGuardarProgreso = async () => {
    setLoadingGuardar(true)
    const ahora = Date.now()
    let partidosTrampa = []

    const datosAInsertar = Object.entries(misResultados)
      .filter(([partidoId, marcador]) => {
        const tieneDatos = marcador.local !== '' && marcador.visitante !== '' && marcador.local !== undefined
        if (!tieneDatos) return false

        const orig = resultadosOriginales[partidoId]
        const haCambiado = !orig || orig.local !== marcador.local || orig.visitante !== marcador.visitante
        
        if (!haCambiado) return false

        const partido = partidosFaseGrupos.find(p => p.id === Number(partidoId))
        if (!partido) return false

        const yaEmpezo = ahora >= new Date(partido.timestamp).getTime()
        if (yaEmpezo) {
          partidosTrampa.push(`${partido.banderaLocal} ${partido.equipoLocal} vs ${partido.equipoVisitante} ${partido.banderaVisitante}`)
          return false
        }
        return true
      })
      .map(([partidoId, marcador]) => ({
        user_id: user.id,
        partido_id: Number(partidoId),
        goles_local: marcador.local,
        goles_visitante: marcador.visitante
      }))

    if (partidosTrampa.length > 0) {
      alert(`🚨 ¡ACCESO DE TIEMPO EXPIRADO!\n\nNo se han guardado los pronósticos para:\n${partidosTrampa.join('\n')}\n\nMotivo: El partido ya ha comenzado en la vida real. Las trampas no están permitidas en esta federación.`);
    }

    if (datosAInsertar.length > 0) {
      await supabase.from('porra_pronosticos').upsert(datosAInsertar)
      setResultadosOriginales(JSON.parse(JSON.stringify(misResultados)))
      alert("¡Tus pronósticos válidos han sido guardados en Supabase!")
    } else if (partidosTrampa.length === 0) {
      alert("No has modificado ningún marcador nuevo todavía.")
    }
    setLoadingGuardar(false)
  }

  const cargarRanking = async () => {
    setLoadingClasi(true)
    const { data: reales } = await supabase.from('porra_resultados').select('*').eq('jugado', true)
    const { data: pronosticos } = await supabase.from('porra_pronosticos').select('*')

    let ranking = USERS.map(u => ({ id: u.id, nombre: u.nombre, color: u.color, puntos: 0, plenos: 0, aciertos: 0 }))

    if (reales && pronosticos) {
      pronosticos.forEach(pron => {
        const partidoReal = reales.find(r => r.partido_id === pron.partido_id)
        if (partidoReal) {
          const userRank = ranking.find(u => u.id === pron.user_id)
          if (!userRank) return

          const pLocal = pron.goles_local
          const pVisi = pron.goles_visitante
          const rLocal = partidoReal.goles_local
          const rVisi = partidoReal.goles_visitante

          if (pLocal === rLocal && pVisi === rVisi) {
            userRank.puntos += 3
            userRank.plenos += 1
          } else {
            const tendenciaPron = Math.sign(pLocal - pVisi)
            const tendenciaReal = Math.sign(rLocal - rVisi)
            if (tendenciaPron === tendenciaReal) {
              userRank.puntos += 1
              userRank.aciertos += 1
            }
          }
        }
      })
    }

    ranking.sort((a, b) => b.puntos - a.puntos || b.plenos - a.plenos || b.aciertos - a.aciertos)
    setClasificacion(ranking)
    setLoadingClasi(false)
  }

  return (
    <div className="page">
      <div className="porra-container">
        
        <header className="porra-header">
          <h1>🏆 Porra Mundial 2026</h1>
          <p>Resultado exacto: 3 pts | Acertar ganador: 1 pt</p>
        </header>

        <div className="porra-tabs">
          <button className={`tab-btn ${activeTab === 'miporra' ? 'active' : ''}`} onClick={() => setActiveTab('miporra')}>
            Mi Porra
          </button>
          <button className={`tab-btn ${activeTab === 'clasificacion' ? 'active' : ''}`} onClick={() => setActiveTab('clasificacion')}>
            Clasificación
          </button>
          <button className={`tab-btn ${activeTab === 'grupo' ? 'active' : ''}`} onClick={() => setActiveTab('grupo')}>
            Porras del Grupo
          </button>
          <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
            Resumen Global
          </button>
        </div>

        {/* ── MI PORRA ── */}
        {activeTab === 'miporra' && (
          <div className="tab-content">
            <div style={{ padding: '15px', background: 'var(--bg-surface2)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--gold)', fontSize: '0.9rem' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--gold)' }}></i> <strong>Dinámica:</strong> Rellena los partidos a tu ritmo. Recuerda pulsar <strong>"Guardar"</strong> para no perder los datos. Los partidos se bloquean automáticamente cuando llega su hora exacta de inicio.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
              <button 
                className="btn-finalizar" 
                style={{ marginTop: '0', maxWidth: '300px', background: '#2ea44f', color: '#ffffff', border: '1px solid #22863a' }} 
                onClick={handleGuardarProgreso} 
                disabled={loadingGuardar}
              >
                {loadingGuardar 
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> 
                  : <><i className="fa-solid fa-floppy-disk"></i> Guardar Mis Pronósticos</>
                }
              </button>
            </div>

            {/* Sección Acordeón: Partidos Archivados (> 3h) */}
            {partidosFaseGrupos.filter(p => comprobarPartidoArchivado(p.timestamp)).length > 0 && (
              <div className="archivados-container">
                <button 
                  className="btn-archivados-toggle" 
                  onClick={() => setArchivadosOpenMiPorra(!archivadosOpenMiPorra)}
                >
                  <i className={`fa-solid ${archivadosOpenMiPorra ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  {archivadosOpenMiPorra ? 'Ocultar Partidos Finalizados' : `Ver Partidos Archivados / Finalizados (${partidosFaseGrupos.filter(p => comprobarPartidoArchivado(p.timestamp)).length})`}
                </button>

                {archivadosOpenMiPorra && (
                  <div className="partidos-list archivados-content">
                    {partidosFaseGrupos
                      .filter(p => comprobarPartidoArchivado(p.timestamp))
                      .map(partido => (
                        <div key={partido.id} className="partido-card" style={{ opacity: 0.65 }}>
                          <div className="partido-info">
                            <span className="partido-fecha">Grupo {partido.grupo} • {partido.fecha} • ARCHIVADO 🔒</span>
                            <div className="equipos-wrap">
                              <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>vs</span>
                              <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                            </div>
                          </div>
                          <div className="marcador-inputs">
                            <input type="number" disabled value={misResultados[partido.id]?.local ?? '-'} />
                            <span>-</span>
                            <input type="number" disabled value={misResultados[partido.id]?.visitante ?? '-'} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Renderizado de Partidos Activos */}
            <div className="partidos-list">
              {partidosFaseGrupos
                .filter(p => !comprobarPartidoArchivado(p.timestamp))
                .map(partido => {
                  const bloqueadoPorTiempo = comprobarPartidoComenzado(partido.timestamp)
                  return (
                    <div key={partido.id} className="partido-card">
                      <div className="partido-info">
                        <span className="partido-fecha">Grupo {partido.grupo} • {partido.fecha} a las {partido.hora} {bloqueadoPorTiempo ? ' 🔒 (CERRADO)' : ''}</span>
                        <div className="equipos-wrap">
                          <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>vs</span>
                          <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                        </div>
                      </div>
                      
                      <div className="marcador-inputs">
                        <input 
                          type="number" min="0" disabled={bloqueadoPorTiempo}
                          value={misResultados[partido.id]?.local ?? ''}
                          onChange={(e) => handleScoreChange(partido.id, 'local', e.target.value)}
                          placeholder="-"
                        />
                        <span>-</span>
                        <input 
                          type="number" min="0" disabled={bloqueadoPorTiempo}
                          value={misResultados[partido.id]?.visitante ?? ''}
                          onChange={(e) => handleScoreChange(partido.id, 'visitante', e.target.value)}
                          placeholder="-"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
            
          </div>
        )}

        {/* ── CLASIFICACIÓN ── */}
        {activeTab === 'clasificacion' && (
          <div className="tab-content">
            {loadingClasi ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin"></i> Calculando puntos del VAR...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Jugador</th>
                      <th style={{ textAlign: 'center' }} title="Acertar quién gana (1 punto)">Aciertos (1p)</th>
                      <th style={{ textAlign: 'center' }} title="Acertar marcador exacto (3 puntos)">Plenos (3p)</th>
                      <th style={{ textAlign: 'right' }}>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clasificacion.map((userRank, index) => (
                      <tr key={userRank.id} style={{ background: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent' }}>
                        <td style={{ fontWeight: 'bold', color: index === 0 ? 'var(--gold)' : 'var(--text)' }}>
                          {index + 1}º
                        </td>
                        <td>
                          <Link to="/perfiles" state={{ userId: userRank.id }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                            <span className="user-avatar metal-avatar" style={{ background: userRank.color, width: '25px', height: '25px', fontSize: '0.7rem', display: 'inline-flex', marginRight: '10px', verticalAlign: 'middle' }}>
                              <span>{userRank.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                            </span>
                            <span style={{ cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>
                              {userRank.nombre}
                            </span>
                          </Link>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-dim)' }}>{userRank.aciertos}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-dim)' }}>{userRank.plenos}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--gold-light)' }}>{userRank.puntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PORRAS DEL GRUPO ── */}
        {activeTab === 'grupo' && (
          <div className="tab-content">
            {/* 🚀 NUEVA REGLA ANTITRAMPAS */}
            <div style={{ padding: '15px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', marginBottom: '25px', border: '1px dashed var(--gold)', fontSize: '0.9rem', textAlign: 'center' }}>
              <i className="fa-solid fa-eye-slash" style={{ color: 'var(--gold)', fontSize: '1.5rem', display: 'block', margin: '0 auto 10px' }}></i> 
              <strong>Regla de Apuestas a Ciegas:</strong> Para garantizar el juego limpio y evitar "copiadas", los pronósticos del resto de miembros <strong>solo serán visibles cuando el partido haya comenzado</strong> y las apuestas estén bloqueadas (🔒).
            </div>

            <select 
              style={{ width: '100%', padding: '15px', marginBottom: '30px', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '1.1rem' }}
              value={miembroSeleccionado}
              onChange={(e) => setMiembroSeleccionado(e.target.value)}
            >
              {miembros.map(m => <option key={m} value={m}>Ver porra de {m}</option>)}
            </select>

            {cargandoOtro ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin"></i> Buscando en la base de datos...</p>
            ) : porraOtro ? (
              <>
                {/* Acordeón de Archivados de los amigos */}
                {partidosFaseGrupos.filter(p => comprobarPartidoArchivado(p.timestamp)).length > 0 && (
                  <div className="archivados-container">
                    <button 
                      className="btn-archivados-toggle" 
                      onClick={() => setArchivadosOpenGrupo(!archivadosOpenGrupo)}
                    >
                      <i className={`fa-solid ${archivadosOpenGrupo ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                      {archivadosOpenGrupo ? `Ocultar Historial de ${miembroSeleccionado}` : `Ver Partidos Finalizados de ${miembroSeleccionado} (${partidosFaseGrupos.filter(p => comprobarPartidoArchivado(p.timestamp)).length})`}
                    </button>

                    {archivadosOpenGrupo && (
                      <div className="partidos-list archivados-content">
                        {partidosFaseGrupos
                          .filter(p => comprobarPartidoArchivado(p.timestamp))
                          .map(partido => {
                            // En archivados siempre se ve porque ya han empezado
                            return (
                              <div key={partido.id} className="partido-card" style={{ opacity: 0.65 }}>
                                <div className="partido-info">
                                  <span className="partido-fecha">Grupo {partido.grupo} • {partido.fecha} • FINALIZADO 🔒</span>
                                  <div className="equipos-wrap">
                                    <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>vs</span>
                                    <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                                  </div>
                                </div>
                                <div className="marcador-inputs">
                                  <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 'bold' }}>
                                    {porraOtro[partido.id]?.local ?? '-'}
                                  </div>
                                  <span>-</span>
                                  <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 'bold' }}>
                                    {porraOtro[partido.id]?.visitante ?? '-'}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Partidos Activos de los amigos */}
                <div className="partidos-list">
                  {partidosFaseGrupos
                    .filter(p => !comprobarPartidoArchivado(p.timestamp))
                    .map(partido => {
                      const bloqueadoPorTiempo = comprobarPartidoComenzado(partido.timestamp)
                      // 🚀 LÓGICA ANTITRAMPAS: Solo se ve si ya empezó el partido
                      const mostrarMarcador = bloqueadoPorTiempo

                      return (
                        <div key={partido.id} className="partido-card">
                          <div className="partido-info">
                            <span className="partido-fecha">Grupo {partido.grupo} • {partido.fecha} a las {partido.hora} {bloqueadoPorTiempo ? ' 🔒' : ''}</span>
                            <div className="equipos-wrap">
                              <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>vs</span>
                              <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                            </div>
                          </div>
                          <div className="marcador-inputs">
                            <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: `1px solid ${!mostrarMarcador ? 'var(--border)' : 'var(--gold-light)'}`, borderRadius: '8px', fontWeight: 'bold', color: !mostrarMarcador ? 'var(--text-dim)' : 'var(--text)' }}>
                              {mostrarMarcador ? (porraOtro[partido.id]?.local ?? '-') : '?'}
                            </div>
                            <span>-</span>
                            <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: `1px solid ${!mostrarMarcador ? 'var(--border)' : 'var(--gold-light)'}`, borderRadius: '8px', fontWeight: 'bold', color: !mostrarMarcador ? 'var(--text-dim)' : 'var(--text)' }}>
                              {mostrarMarcador ? (porraOtro[partido.id]?.visitante ?? '-') : '?'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── RESUMEN GLOBAL ── */}
        {activeTab === 'resumen' && (
          <div className="tab-content">
            {/* 🚀 NUEVA REGLA ANTITRAMPAS */}
            <div style={{ padding: '15px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', marginBottom: '25px', border: '1px dashed var(--gold)', fontSize: '0.9rem', textAlign: 'center' }}>
              <i className="fa-solid fa-users-viewfinder" style={{ color: 'var(--gold)', fontSize: '1.5rem', display: 'block', margin: '0 auto 10px' }}></i> 
              <strong>Resumen Global:</strong> Despliega cada partido para ver qué ha votado cada miembro del grupo. 
              <br/><br/>
              <span style={{ opacity: 0.8 }}><i className="fa-solid fa-shield-halved"></i> <strong>Nota de Seguridad:</strong> Los marcadores exactos estarán ocultos con un (?) <strong>hasta que suene el pitido inicial</strong> (🔒). Así evitamos que los rezagados espíen las apuestas de los demás. ¡Juego limpio!</span>
            </div>

            {loadingGlobal ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin"></i> Recopilando todas las apuestas de la base de datos...</p>
            ) : (
              <div className="partidos-list">
                {partidosFaseGrupos.map(partido => {
                  const isOpen = expandedMatch === partido.id
                  const apuestasPartido = pronosticosGlobales[partido.id] || []
                  const bloqueadoPorTiempo = comprobarPartidoComenzado(partido.timestamp)
                  
                  // 🚀 LÓGICA ANTITRAMPAS: Solo se ve si ya empezó el partido
                  const puedeVerApuestas = bloqueadoPorTiempo

                  return (
                    <div 
                      key={partido.id} 
                      className="partido-card" 
                      style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer', transition: 'all 0.2s ease', padding: isOpen ? '20px' : '15px 20px', borderLeft: isOpen ? '4px solid var(--gold)' : '1px solid var(--border)' }} 
                      onClick={() => setExpandedMatch(isOpen ? null : partido.id)}
                    >
                      {/* Cabecera del Acordeón */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="partido-info" style={{ flex: 1 }}>
                          <span className="partido-fecha" style={{ marginBottom: '4px' }}>Grupo {partido.grupo} • {partido.fecha} a las {partido.hora} {bloqueadoPorTiempo ? ' 🔒' : ''}</span>
                          <div className="equipos-wrap" style={{ fontSize: '1.1rem' }}>
                            <span>{partido.banderaLocal} {partido.equipoLocal}</span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: '0 5px' }}>vs</span>
                            <span>{partido.banderaVisitante} {partido.equipoVisitante}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'var(--bg-surface2)', padding: '4px 10px', borderRadius: '20px' }}>
                            {apuestasPartido.length} apuestas
                          </span>
                          <i className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ color: 'var(--gold)', fontSize: '1rem', transition: 'transform 0.2s ease' }}></i>
                        </div>
                      </div>

                      {/* Desplegable con la cuadrícula de apuestas */}
                      {isOpen && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                          {apuestasPartido.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-dim)', margin: '10px 0', fontStyle: 'italic', fontSize: '0.9rem' }}>Nadie de la liga ha apostado en este partido todavía.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                              {apuestasPartido.map((apuesta, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  
                                  {/* Info del usuario */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="user-avatar metal-avatar" style={{ background: apuesta.color, width: '28px', height: '28px', fontSize: '0.7rem' }}>
                                      <span>{apuesta.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                                    </span>
                                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                      {apuesta.nombre}
                                    </span>
                                  </div>

                                  {/* Marcador del usuario */}
                                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '6px', border: `1px solid ${puedeVerApuestas ? 'var(--gold-light)' : 'var(--border)'}`, color: puedeVerApuestas ? 'var(--text)' : 'var(--text-dim)', letterSpacing: '2px' }}>
                                    {puedeVerApuestas ? `${apuesta.local}-${apuesta.visitante}` : '?-?'}
                                  </div>

                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}