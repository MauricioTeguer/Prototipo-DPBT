import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { alternatives, confirmations, detailLabels, observations, questions } from './content'
import type { Alternative, Choice } from './content'
import './styles.css'

type State = { step: number; description: string; answers: (Choice | null)[]; attachment: string | null; selected: Alternative; actions: string; started: boolean }
const initial: State = { step: 1, description: 'El lavarropas termina el ciclo pero queda agua adentro.', answers: [null, null, null], attachment: null, selected: 'basic', actions: '', started: false }
function restore(): State {
  try {
    const saved = JSON.parse(sessionStorage.getItem('dpbt-journey') || 'null')
    if (saved && Number.isInteger(saved.step) && saved.step >= 1 && saved.step <= 9 && typeof saved.description === 'string' && Array.isArray(saved.answers) && saved.answers.length === 3 && saved.answers.every((a: unknown) => a === null || ['Sí', 'No', 'No sé'].includes(a as string)) && Object.hasOwn(alternatives, saved.selected)) return { ...initial, ...saved }
  } catch { /* Storage is optional. */ }
  return initial
}
function App() {
  const [state, setState] = useState<State>(restore)
  const heading = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  const { step, description, answers, attachment, selected, actions, started } = state
  const patch = (values: Partial<State>) => setState(s => ({ ...s, ...values }))
  const go = (next: number) => patch({ step: next })
  const choose = (key: Alternative) => patch({ selected: key, step: 6, started: false })
  useEffect(() => { try { sessionStorage.setItem('dpbt-journey', JSON.stringify(state)) } catch { /* Keep in-memory state. */ } }, [state])
  useEffect(() => {
    if (mounted.current) { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) }
    mounted.current = true
  }, [step, selected])
  const notes = observations(answers)
  const back = () => go(step - 1)
  const title = ['¿Qué problema tenés en tu hogar?', 'Vamos a entender mejor la situación', 'Esto es lo que entendimos', 'Antes de intervenir', '¿Cómo podrías avanzar?', 'Compará antes de decidir', 'Tu próximo paso', 'Ya definiste tu próximo paso', 'Recorrido finalizado'][step - 1]
  const primary = (label: string, onClick: () => void, disabled = false) => <button className="primary" onClick={onClick} disabled={disabled}>{label}</button>
  const summary = <><p className="preserve">{description}</p>{notes.map(note => <p key={note}>{note}</p>)}{attachment && <p>Archivo adjunto: {attachment} (simulado).</p>}{actions.trim() && <p>Acciones realizadas: {actions}</p>}</>
  return <main className={`phone step-${step}`}>
    <header>
      <div className="topline">{step < 3 ? <span>{step === 1 ? 'Inicio' : 'Preguntas'}</span> : <button className="back" onClick={back}>← Atrás</button>}<span>{step <= 7 ? `${step} de 7` : step === 8 ? 'Confirmación' : 'Cierre'}</span></div>
      <div className="progress" role="progressbar" aria-label="Progreso del recorrido" aria-valuemin={1} aria-valuemax={7} aria-valuenow={Math.min(step, 7)}>{Array.from({length:7}, (_,i) => <span key={i} className={i < step ? 'complete' : ''} />)}</div>
    </header>
    <h1 tabIndex={-1} ref={heading}>{title}</h1>
    {step === 1 && <>
      <p className="intro">Describí con tus palabras lo que observás. No hace falta que sepas cuál es la causa ni utilizar términos técnicos.</p>
      <label className="sr-only" htmlFor="description">Descripción del problema</label>
      <textarea id="description" className="description" value={description} onChange={e => patch({description:e.target.value})} />
      <button onClick={() => patch({attachment: attachment ? null : 'Foto del lavarropas'})}>{attachment ? 'Quitar foto o video' : 'Agregar foto o video'}</button>
      {attachment && <div className="attachment" role="status"><span aria-hidden="true">▧</span><div><strong>{attachment}</strong><small>Adjunto simulado · no se subió ningún archivo</small></div></div>}
      <div className="bottom initial-bottom">{primary('Continuar', () => go(2), !description.trim())}</div>
    </>}
    {step === 2 && <>
      <div className="questions">{questions.map((question,i) => <fieldset key={question}><legend>{question}</legend><div className="answers">{(['Sí','No','No sé'] as Choice[]).map(answer => <label className={answers[i] === answer ? 'answer selected' : 'answer'} key={answer}><input type="radio" name={`question-${i}`} checked={answers[i] === answer} onChange={() => patch({answers:answers.map((a,j) => i === j ? answer : a)})} />{answer}</label>)}</div></fieldset>)}</div>
      <div className="button-stack">{primary('Continuar', () => go(3), answers.some(a => a === null))}<button onClick={back}>Atrás</button></div>
    </>}
    {step === 3 && <>
      <section className="box"><h2>Lo que sabemos</h2><ul>{notes.map((note, i) => <React.Fragment key={note}><li>{note}</li>{i === 0 && description === initial.description && <li>Quedó agua dentro del tambor.</li>}</React.Fragment>)}</ul><p className="summary-description preserve">Lo que describiste: {description}</p>{attachment && <p>Foto o video agregado (simulado).</p>}</section>
      <section className="box"><h2>Lo que todavía no sabemos</h2><ul><li>No podemos determinar con certeza cuál es la causa del problema.</li><li>Puede ser necesario obtener más información antes de decidir si conviene intervenir.</li></ul></section>
      <div className="button-stack"><button onClick={() => go(2)}>Corregir información</button>{primary('Continuar', () => go(4))}</div>
    </>}
    {step === 4 && <>
      <section className="box"><h2>Podés comprobar</h2><p>Desconectá el equipo antes de realizar cualquier comprobación.</p></section>
      <section className="box warning"><h2>Conviene no intervenir</h2><p>No desarmes componentes eléctricos.</p><p>Si observás agua cerca de conexiones eléctricas, no continúes.</p><p>Si una comprobación requiere herramientas o conocimientos que no tenés, detenerse también es una decisión válida.</p></section>
      <p className="muted disclaimer">Estas advertencias no garantizan seguridad.</p>
      {primary('Ver mis opciones', () => go(5))}
    </>}
    {step === 5 && <>
      <p>Según la información disponible, estas son algunas formas en las que podrías avanzar. Podés elegir la que consideres más adecuada para tu situación y cambiar de decisión en cualquier momento.</p>
      <div className="alternatives">{(Object.keys(alternatives) as Alternative[]).map(key => <button className="alternative" key={key} onClick={() => choose(key)}><span><strong>{alternatives[key].title}</strong><span>{alternatives[key].description}</span></span><span aria-hidden="true">›</span></button>)}</div>
    </>}
    {step === 6 && <>
      <section className="box details"><h2>{alternatives[selected].title}</h2><dl>{detailLabels.map((label,i) => <React.Fragment key={label}><dt>{label}</dt><dd>{alternatives[selected].details[i]}</dd></React.Fragment>)}</dl></section>
      <p className="muted">Esta orientación no reemplaza una evaluación profesional.</p>
      <div className="bottom button-stack">{primary('Elegir este paso', () => go(7))}<button onClick={() => go(5)}>Ver otras alternativas</button></div>
    </>}
    {step === 7 && <>
      <div className="chosen"><span aria-hidden="true">●</span><h2>{alternatives[selected].title}</h2></div>
      {selected === 'basic' && <>
        <p>Elegiste comenzar por una comprobación que no requiere desarmar el lavarropas.</p>
        <section className="box"><p>Antes de empezar:</p><ol><li>Apagá y desconectá el lavarropas.</li><li>No retires componentes ni protecciones.</li><li>Si encontrás algo que no comprendés o necesitás herramientas, detenete.</li></ol></section>
        {started && <section className="box" role="status"><h2>Comprobación básica</h2><p>Limitate a observar lo que ya está a simple vista, sin mover el equipo, abrir partes ni tocar conexiones.</p><p>Si hay agua cerca de conexiones eléctricas, olor inusual o algo que no comprendés, detenete. No intentes intervenir ni desconectar el equipo si para hacerlo debés acercarte al agua.</p><p>No hace falta realizar ninguna acción para elegir otra alternativa.</p></section>}
      </>}
      {selected === 'model' && <>
        <p>Elegiste buscar información específica de tu lavarropas antes de decidir.</p>
        <section className="box"><p>Para consultar:</p><ol><li>Identificá la marca y el modelo en el manual o en información accesible, sin mover ni desarmar el equipo.</li><li>Consultá el manual, la garantía o información específica de ese modelo de lavarropas.</li></ol></section>
        <p>Si no encontrás el modelo o no comprendés las indicaciones, podés detenerte y elegir otra alternativa.</p>
      </>}
      {selected === 'guidance' && <>
        <p>Podés preparar esta información para contar lo que pasa.</p>
        <section className="box prepared">{summary}</section>
        <label className="actions-label" htmlFor="actions">Contá qué acciones ya realizaste, si hiciste alguna. Podés decir que no sabés.</label>
        <textarea id="actions" value={actions} onChange={e => patch({actions:e.target.value})} placeholder="Por ejemplo: todavía no hice ninguna comprobación." rows={3} />
        <p>Si ya tenés fotos o videos, podés compartirlos. No hace falta hacer nuevas tomas ni exponerte para conseguirlas.</p>
      </>}
      {selected === 'technician' && <>
        <p>Este es el resumen para la consulta profesional.</p>
        <section className="box prepared"><p>Equipo: lavarropas.</p>{summary}<p>Causa desconocida.</p></section>
        <p>Podés compartir este resumen y solicitar una evaluación profesional, sin hacer más comprobaciones por tu cuenta.</p>
      </>}
      <div className="bottom button-stack">
        {selected === 'basic' && <>{primary(started ? 'Comprobación iniciada' : 'Comenzar comprobación', () => patch({started:true}), started)}<button onClick={() => choose('guidance')}>Prefiero pedir orientación</button><button onClick={() => choose('technician')}>Contactar a un técnico</button></>}
        {selected === 'model' && <button onClick={() => choose('basic')}>Hacer una comprobación básica</button>}
        {selected === 'guidance' && <button onClick={() => choose('technician')}>Contactar a un técnico</button>}
        {primary('Definir mi próximo paso', () => go(8))}
        <button onClick={() => go(5)}>Volver a las alternativas</button>
        <p className="muted footnote">Podés cambiar de decisión en cualquier momento.</p>
      </div>
    </>}
    {step === 8 && <>
      <section className="box"><p>{confirmations[selected]}</p></section>
      <p>Podés volver y elegir otra alternativa si cambia la situación o si necesitás explorar otra forma de avanzar.</p>
      <div className="bottom button-stack">{primary('Finalizar', () => go(9))}<button onClick={() => go(5)}>Volver a las alternativas</button></div>
    </>}
    {step === 9 && <>
      <p>Ya tenés un próximo paso definido. Si la situación cambia, podés volver a evaluar tus alternativas.</p>
      <div className="bottom button-stack"><button onClick={() => go(5)}>Volver a las alternativas</button></div>
    </>}
  </main>
}
createRoot(document.getElementById('root')!).render(<App />)
