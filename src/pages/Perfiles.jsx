// src/pages/Perfiles.jsx

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { USERS } from '../data/usersConfig'
import './Perfiles.css'

const HISTORIAL_MIEMBROS = {
  'adri': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Dúo del Año (con Juanfran)' }, { ano: '2025', titulo: 'Momento más Clippeable' }, { ano: '2025', titulo: 'MVP de Pinoso' }, { ano: '2025', titulo: 'Gracioso del Año' }, { ano: '2025', titulo: 'Peor Influencia' }, { ano: '2025', titulo: 'Porro de Oro' },
      { ano: '2024', titulo: 'Máquina de Chistes' }, { ano: '2024', titulo: 'Alma de la Fiesta' },
      { ano: '2023', titulo: 'Bailarín del Año' }
    ],
    fantasy: [
      { temp: '24/25', pos: '3º Puesto 🥉', pts: '1.550 pts' },
      { temp: '25/26', pos: '4º Puesto', pts: '2.113 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'jose': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Soltero del Año' },
      { ano: '2024', titulo: 'Borracho Legendario' }, { ano: '2024', titulo: 'Oso Perezoso' }, { ano: '2024', titulo: 'Foto del Año' },
      { ano: '2023', titulo: 'Dormilón del Año' }, { ano: '2023', titulo: 'Aventurero del Año' }, { ano: '2023', titulo: 'Desordenado del Año' }, { ano: '2023', titulo: 'Payaso del Año' }, { ano: '2023', titulo: 'Vaga del Año' }, { ano: '2023', titulo: 'Porreta del Año' }, { ano: '2023', titulo: 'Hombre con Mejores Tetas' },
      { ano: '2022', titulo: 'La Persona más Meme Andante' }, { ano: '2022', titulo: 'La Persona más Vaga' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'sergio': {
    rol: 'Dictador General',
    premios: [
      { ano: '2025', titulo: 'Cachondo del Año' },
      { ano: '2024', titulo: 'Reloj Humano' }, { ano: '2024', titulo: 'Tensión Máxima' },
      { ano: '2022', titulo: 'Persona que volvería con su Ex' }
    ],
    fantasy: [
      { temp: '24/25', pos: '1º Puesto 🏆', pts: '2.452 pts' },
      { temp: '25/26', pos: '1º Puesto 🏆', pts: '3.414 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Organizador General', cantante: true }
  },
  'alba-s': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Premio Nobel' }, { ano: '2025', titulo: 'Porro de Oro' },
      { ano: '2024', titulo: 'Sabiduría en Persona' }, { ano: '2024', titulo: 'Iluminado' }, { ano: '2024', titulo: 'Alma del Karaoke' },
      { ano: '2023', titulo: 'Mami del Año' },
      { ano: '2022', titulo: 'La Persona más Chismosa' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'andrea': {
    rol: 'Miembro de la Revolución',
    premios: [],
    fantasy: [],
    olimpiadas: { participa: false }
  },
  'clara': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2024', titulo: 'Tensión Máxima' }, { ano: '2024', titulo: 'Detector de Errores' },
      { ano: '2023', titulo: 'Borracha del Año' }
    ],
    fantasy: [
      { temp: '24/25', pos: '2º Puesto 🥈', pts: '1.667 pts' },
      { temp: '25/26', pos: '3º Puesto 🥉', pts: '2.131 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'cristina': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Más probable a huir del país' }, { ano: '2025', titulo: 'Hígado de Acero' },
      { ano: '2024', titulo: 'Diablo Tentador' }, { ano: '2024', titulo: 'Radiopatio' }, { ano: '2024', titulo: 'Premio Porro 2024' },
      { ano: '2023', titulo: 'Fiestera del Año' }, { ano: '2023', titulo: 'Delincuente del Año' }
    ],
    fantasy: [
      { temp: '24/25', pos: '4º Puesto', pts: '1.520 pts' },
      { temp: '25/26', pos: '5º Puesto', pts: '1.930 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'laura-b': {
    rol: 'Miembro de la Revolución',
    premios: [],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: false }
  },
  'raquel-g': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Peligro al Volante' },
      { ano: '2024', titulo: 'Manos de Mantequilla' }, { ano: '2024', titulo: 'Soltero del Año' }, { ano: '2024', titulo: 'Dramático Académico' },
      { ano: '2022', titulo: 'Persona más Borracha' }, { ano: '2022', titulo: 'Persona más Torpe' }, { ano: '2022', titulo: 'La Persona más Bocachancla' }
    ],
    fantasy: [
      { temp: '24/25', pos: '5º Puesto', pts: '1.501 pts' },
      { temp: '25/26', pos: '6º Puesto', pts: '1.836 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'isabel': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2023', titulo: 'Sapo del Año' },
      { ano: '2022', titulo: 'Persona más Dormilona' }, { ano: '2022', titulo: 'Persona más Sociable/Habladora' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'jorge': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Foto del Año' },
      { ano: '2024', titulo: 'Cuchara de Oro' },
      { ano: '2023', titulo: 'Papi del Año' },
      { ano: '2022', titulo: 'La Persona más Payasa' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante (Chef Oficial)', cantante: true }
  },
  'juanfran': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Dúo del Año (con Adrián)' }, { ano: '2025', titulo: 'Herman@ del Año' }, { ano: '2025', titulo: 'MVP de Villena' }, { ano: '2025', titulo: 'Autistada del Año' }, { ano: '2025', titulo: 'MVP de la Feria' },
      { ano: '2024', titulo: 'Dramático Académico' },
      { ano: '2022', titulo: 'Chico que mejor Viste' }, { ano: '2022', titulo: 'La Persona más Graciosa' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'abel': {
    rol: 'Arquitecto de Código & Multimedia',
    premios: [
      { ano: '2025', titulo: 'Foto del Año' },
      { ano: '2024', titulo: 'Gafe Maldito' }, { ano: '2024', titulo: 'Patinazo del Año' }, { ano: '2024', titulo: 'Atleta del Año' }
    ],
    fantasy: [
      { temp: '24/25', pos: 'Abandono', pts: '-' },
      { temp: '25/26', pos: '2º Puesto 🥈', pts: '2.319 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'laura-l': {
    rol: 'Miembro de la Revolución',
    premios: [],
    fantasy: [],
    olimpiadas: { participa: false }
  },
  'mariaju': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'MVP del Bando' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'paula-m': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2023', titulo: 'Trabajador Duro del Año' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: false }
  },
  'paula-edurne': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Influencer del Grupo' },
      { ano: '2024', titulo: 'Rey del Pueblo' },
      { ano: '2023', titulo: 'Cantante del Año' }, { ano: '2023', titulo: 'Sociable del Año' }
    ],
    fantasy: [
      { temp: '24/25', pos: 'Abandono', pts: '-' },
      { temp: '25/26', pos: '7º Puesto', pts: '1.083 pts' }
    ],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  },
  'silvia': {
    rol: 'Miembro de la Revolución',
    premios: [
      { ano: '2025', titulo: 'Explorador del Año' },
      { ano: '2024', titulo: 'Joyita Oculta' }
    ],
    fantasy: [],
    olimpiadas: { participa: true, rol: 'Participante', cantante: true }
  }
}

export default function Perfiles() {
  const location = useLocation()
  const miembrosOrdenados = [...USERS].sort((a, b) => a.nombre.localeCompare(b.nombre))
  
  // 🚀 Inicializamos con el ID recibido de otra página (si existe)
  const [selectedUserId, setSelectedUserId] = useState(location.state?.userId || miembrosOrdenados[0]?.id)
  
  const [porraStats, setPorraStats] = useState({})
  const [loadingPorra, setLoadingPorra] = useState(true)

  // 🚀 Si navegamos desde otra página al perfil de alguien, cambiamos al usuario correcto
  useEffect(() => {
    if (location.state?.userId) {
      setSelectedUserId(location.state.userId)
    }
  }, [location.state?.userId])

  const perfilActivo = USERS.find(u => u.id === selectedUserId)

  useEffect(() => {
    async function fetchPorra() {
      setLoadingPorra(true)
      const { data: reales } = await supabase.from('porra_resultados').select('*').eq('jugado', true)
      const { data: pronosticos } = await supabase.from('porra_pronosticos').select('*')

      if (pronosticos) {
        let statsMap = {}
        USERS.forEach(u => { statsMap[u.id] = { apuestas: 0, puntos: 0, plenos: 0, aciertos: 0 } })

        pronosticos.forEach(pron => {
          if (!statsMap[pron.user_id]) return
          statsMap[pron.user_id].apuestas += 1

          if (reales) {
            const partidoReal = reales.find(r => r.partido_id === pron.partido_id)
            if (partidoReal) {
              const pLocal = pron.goles_local
              const pVisi = pron.goles_visitante
              const rLocal = partidoReal.goles_local
              const rVisi = partidoReal.goles_visitante

              if (pLocal === rLocal && pVisi === rVisi) {
                statsMap[pron.user_id].puntos += 3
                statsMap[pron.user_id].plenos += 1
              } else {
                if (Math.sign(pLocal - pVisi) === Math.sign(rLocal - rVisi)) {
                  statsMap[pron.user_id].puntos += 1
                  statsMap[pron.user_id].aciertos += 1
                }
              }
            }
          }
        })

        let rankingArr = USERS.map(u => ({ id: u.id, ...statsMap[u.id] })).filter(u => u.apuestas > 0)
        rankingArr.sort((a, b) => b.puntos - a.puntos || b.plenos - a.plenos || b.aciertos - a.aciertos)
        
        rankingArr.forEach((user, index) => {
          statsMap[user.id].posicion = index + 1
        })

        setPorraStats(statsMap)
      }
      setLoadingPorra(false)
    }
    
    fetchPorra()
  }, [])

  const obtenerIniciales = (nombre) => {
    return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const datosCustom = perfilActivo && HISTORIAL_MIEMBROS[perfilActivo.id] 
    ? HISTORIAL_MIEMBROS[perfilActivo.id] 
    : { rol: 'Miembro', premios: [], fantasy: [], olimpiadas: { participa: false } }
  
  const datosPorra = perfilActivo ? porraStats[perfilActivo.id] : null
  const muestraPorra = datosPorra && datosPorra.apuestas > 0

  return (
    <div className="page">
      <div className="perfiles-container">
        
        <header className="porra-header" style={{ marginBottom: '25px' }}>
          <h1>👥 Buscador de Perfiles</h1>
          <p>Fichas técnicas, palmarés e historial competitivo del grupo</p>
        </header>

        <div className="selector-box">
          <label htmlFor="user-select">Selecciona un miembro del grupo:</label>
          <select 
            id="user-select"
            className="selector-dropdown"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {miembrosOrdenados.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>

        {perfilActivo && (
          <div className="profile-dashboard">
            
            <div className="profile-main-header">
              <div className="profile-big-avatar" style={{ background: perfilActivo.color }}>
                {obtenerIniciales(perfilActivo.nombre)}
              </div>
              <div className="profile-titles">
                <h2>{perfilActivo.nombre}</h2>
                <span className="profile-role-tag">{datosCustom.role === 'admin' && perfilActivo.id === 'sergio' ? 'Dictador General' : datosCustom.rol}</span>
              </div>
            </div>

            <div className="profile-stats-grid">
              
              {datosCustom.premios.length > 0 && (
                <div className="profile-widget">
                  <h4><i className="fa-solid fa-trophy"></i> Premios Porro</h4>
                  <ul className="profile-data-list">
                    {datosCustom.premios.map((p, i) => (
                      <li key={i}>
                        <span className="data-year">{p.ano}</span>
                        <span className="data-desc">{p.titulo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {datosCustom.fantasy.length > 0 && (
                <div className="profile-widget">
                  <h4><i className="fa-solid fa-futbol"></i> Historial Fantasy</h4>
                  <ul className="profile-data-list">
                    {datosCustom.fantasy.map((f, i) => (
                      <li key={i}>
                        <span className="data-year">{f.temp}</span>
                        <span className="data-desc" style={{ fontWeight: 'bold' }}>{f.pos}</span>
                        <span className="data-badge">{f.pts}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {datosCustom.olimpiadas.participa && (
                <div className="profile-widget">
                  <h4><i className="fa-solid fa-medal"></i> Porrolimpiadas 2026</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mini-badge" style={{ background: 'rgba(255, 215, 0, 0.1)', color: 'var(--gold-light)' }}>Rol: {datosCustom.olimpiadas.rol}</span>
                    </div>
                    {datosCustom.olimpiadas.cantante && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mini-badge" style={{ background: 'rgba(160, 160, 220, 0.1)', color: 'var(--purple-light)' }}>
                          <i className="fa-solid fa-microphone-lines" style={{ marginRight: '5px' }}></i>
                          Intérprete Oficial del Himno
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loadingPorra ? (
                <div className="profile-widget">
                  <h4><i className="fa-solid fa-earth-americas"></i> Porra Mundial</h4>
                  <p style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando estadísticas...</p>
                </div>
              ) : muestraPorra ? (
                <div className="profile-widget" style={{ border: '1px solid var(--gold-light)' }}>
                  <h4><i className="fa-solid fa-earth-americas"></i> Estadísticas Porra 2026</h4>
                  <ul className="profile-data-list">
                    <li>
                      <span className="data-desc">Posición actual</span>
                      <span className="data-badge" style={{ fontSize: '1rem', color: 'var(--gold)' }}>{datosPorra.posicion}º Puesto</span>
                    </li>
                    <li>
                      <span className="data-desc">Partidos Pronosticados</span>
                      <span className="data-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>{datosPorra.apuestas}</span>
                    </li>
                    <li>
                      <span className="data-desc" title="Acertar quién gana (1 pt)">Aciertos Simples (1p)</span>
                      <span className="data-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>{datosPorra.aciertos}</span>
                    </li>
                    <li>
                      <span className="data-desc" title="Acertar marcador exacto (3 pts)">Plenos Exactos (3p)</span>
                      <span className="data-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>{datosPorra.plenos}</span>
                    </li>
                    <li style={{ borderTop: '1px solid rgba(255,215,0,0.3)', marginTop: '5px', paddingTop: '10px' }}>
                      <span className="data-desc" style={{ fontWeight: 'bold' }}>PUNTOS TOTALES</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--gold-light)' }}>{datosPorra.puntos} pts</strong>
                    </li>
                  </ul>
                </div>
              ) : null}

            </div>

          </div>
        )}

      </div>
    </div>
  )
}