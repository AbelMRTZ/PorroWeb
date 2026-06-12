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

export default function Porra() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('miporra')
  const [misResultados, setMisResultados] = useState({})
  const [resultadosOriginales, setResultadosOriginales] = useState({}) // 🛡️ RESPALDO ANTI-TRAMPAS
  const [loadingGuardar, setLoadingGuardar] = useState(false)
  
  // Estados para la clasificación
  const [clasificacion, setClasificacion] = useState([])
  const [loadingClasi, setLoadingClasi] = useState(false)

  // Estados para ver a los demás
  const [miembroSeleccionado, setMiembroSeleccionado] = useState('Abel')
  const [porraOtro, setPorraOtro] = useState(null)
  const [cargandoOtro, setCargandoOtro] = useState(false)
  
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
        // Guardamos una copia exacta para saber qué se modifica en tiempo real
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

  const handleScoreChange = (partidoId, tipo, valor) => {
    setMisResultados(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [tipo]: valor === '' ? '' : Number(valor)
      }
    }))
  }

  // ── 4. GUARDAR Y VERIFICACIÓN DE SEGURIDAD EN EL CLICK ──
  const handleGuardarProgreso = async () => {
    setLoadingGuardar(true)
    const ahora = Date.now()
    let partidosTrampa = []

    const datosAInsertar = Object.entries(misResultados)
      .filter(([partidoId, marcador]) => {
        const tieneDatos = marcador.local !== '' && marcador.visitante !== '' && marcador.local !== undefined
        if (!tieneDatos) return false

        // Comparamos el marcador actual con el que cargó la base de datos al inicio
        const orig = resultadosOriginales[partidoId]
        const haCambiado = !orig || orig.local !== marcador.local || orig.visitante !== marcador.visitante
        
        // Si no se ha modificado en esta sesión, lo ignoramos (evita falsos positivos con partidos antiguos)
        if (!haCambiado) return false

        const partido = partidosFaseGrupos.find(p => p.id === Number(partidoId))
        if (!partido) return false

        // 🛡️ CAPA DE SEGURIDAD EN EL BOTÓN: ¿Ha empezado ya el partido en este milisegundo?
        const yaEmpezo = ahora >= new Date(partido.timestamp).getTime()
        if (yaEmpezo) {
          partidosTrampa.push(`${partido.banderaLocal} ${partido.equipoLocal} vs ${partido.equipoVisitante} ${partido.banderaVisitante}`)
          return false // Lo eliminamos de la lista de subida
        }
        return true
      })
      .map(([partidoId, marcador]) => ({
        user_id: user.id,
        partido_id: Number(partidoId),
        goles_local: marcador.local,
        goles_visitante: marcador.visitante
      }))

    // Alerta si alguien ha intentado burlar el reloj o se le ha pasado la hora con la página abierta
    if (partidosTrampa.length > 0) {
      alert(`🚨 ¡ACCESO DE TIEMPO EXPIRADO!\n\nNo se han guardado los pronósticos para:\n${partidosTrampa.join('\n')}\n\nMotivo: El partido ya ha comenzado en la vida real. Las trampas no están permitidas en esta federación.`);
    }

    if (datosAInsertar.length > 0) {
      await supabase.from('porra_pronosticos').upsert(datosAInsertar)
      // Actualizamos el respaldo original para la siguiente tanda de cambios
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

            <div className="partidos-list">
              {partidosFaseGrupos.map(partido => {
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
            <div style={{ padding: '15px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', marginBottom: '25px', border: '1px dashed var(--gold)', fontSize: '0.9rem', textAlign: 'center' }}>
              <i className="fa-solid fa-eye-slash" style={{ color: 'var(--gold)', fontSize: '1.5rem', display: 'block', margin: '0 auto 10px' }}></i> 
              <strong>Regla de Visibilidad:</strong> Solo puedes ver el pronóstico de otra persona en los partidos donde <strong>tú ya hayas puesto y guardado un resultado</strong>. Si no has apostado, te saldrán interrogantes (?).
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
              <div className="partidos-list">
                {partidosFaseGrupos.map(partido => {
                  const miPron = misResultados[partido.id]
                  const tengoPronostico = miPron && miPron.local !== '' && miPron.local !== undefined && miPron.visitante !== '' && miPron.visitante !== undefined
                  const bloqueadoPorTiempo = comprobarPartidoComenzado(partido.timestamp)

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
                        <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: `1px solid ${!tengoPronostico ? 'var(--border)' : 'var(--gold-light)'}`, borderRadius: '8px', fontWeight: 'bold', color: !tengoPronostico ? 'var(--text-dim)' : 'var(--text)' }}>
                          {tengoPronostico ? (porraOtro[partido.id]?.local ?? '-') : '?'}
                        </div>
                        <span>-</span>
                        <div style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', border: `1px solid ${!tengoPronostico ? 'var(--border)' : 'var(--gold-light)'}`, borderRadius: '8px', fontWeight: 'bold', color: !tengoPronostico ? 'var(--text-dim)' : 'var(--text)' }}>
                          {tengoPronostico ? (porraOtro[partido.id]?.visitante ?? '-') : '?'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  )
}