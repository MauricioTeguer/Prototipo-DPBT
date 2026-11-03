export type Choice = 'Sí' | 'No' | 'No sé'
export type Alternative = 'basic' | 'model' | 'guidance' | 'technician'
export const questions = [
  '¿El lavarropas terminó el ciclo normalmente?',
  '¿Aparece algún código o mensaje de error?',
  '¿Notaste algún ruido, olor o comportamiento diferente?',
]
export const alternatives: Record<Alternative, { title: string; description: string; details: string[] }> = {
  basic: {
    title: 'Hacer una comprobación básica',
    description: 'Revisar aspectos que no requieren desarmar el equipo.',
    details: ['Reconocer lo que ves, sin saber la causa.', 'Ninguna. Si necesitás herramientas, detenete.', 'Puede haber riesgos aun sin desarmar. Respetá los límites indicados.', 'Un momento de observación, sin apuro.', 'Si comprendés qué vas a observar y no encontrás las situaciones de advertencia.'],
  },
  model: {
    title: 'Buscar información del modelo',
    description: 'Consultar el manual o información específica de tu lavarropas.',
    details: ['Identificar el modelo y leer su información. No hace falta saber reparar.', 'El manual o un medio para consultarlo.', 'Consultar no requiere intervenir. No sigas indicaciones que no comprendés.', 'Puede llevar un rato encontrar la información adecuada.', 'Si querés entender lo que indica el manual antes de decidir.'],
  },
  guidance: {
    title: 'Pedir orientación',
    description: 'Compartir la situación con alguien de confianza o con experiencia.',
    details: ['Contar lo que observaste. Podés decir que no sabés.', 'Ninguna para pedir orientación.', 'Pedir orientación no requiere intervenir. Un consejo no garantiza seguridad.', 'Depende de la disponibilidad de la otra persona.', 'Si tenés dudas o preferís pensar el próximo paso con alguien.'],
  },
  technician: {
    title: 'Contactar a un técnico',
    description: 'Solicitar una evaluación profesional.',
    details: ['Describir la situación, sin conocer la causa.', 'Ninguna de tu parte para solicitar la evaluación.', 'No requiere que intervengas. El profesional deberá evaluar la situación.', 'Coordinar una visita; puede implicar espera y costo.', 'Si encontrás advertencias, no comprendés qué revisar o preferís no intervenir.'],
  },
}
export const detailLabels = ['Nivel de conocimiento necesario', 'Herramientas necesarias', 'Riesgo de intervención', 'Tiempo/esfuerzo', 'Cuándo podría ser conveniente']
export function observations(answers: (Choice | null)[]) {
  return [
    answers[0] === 'Sí' ? 'Finalizó el ciclo normalmente.' : answers[0] === 'No' ? 'No finalizó el ciclo normalmente.' : 'No sabés si el ciclo terminó normalmente.',
    answers[1] === 'Sí' ? 'Reportaste un código o mensaje de error.' : answers[1] === 'No' ? 'No muestra un código de error.' : 'No sabés si muestra un código de error.',
    answers[2] === 'Sí' ? 'Reportaste ruido, olor o un comportamiento diferente.' : answers[2] === 'No' ? 'No reportaste olor ni ruido inusual.' : 'No sabés si hubo ruido, olor o un comportamiento diferente.',
  ]
}
export function recommendation(answers: (Choice | null)[]): string {
  if (answers[2] === 'Sí') return 'Como notaste un ruido, olor o comportamiento diferente, conviene detener las comprobaciones y contactar a un técnico para una evaluación profesional.'
  if (answers[1] === 'Sí') return 'Como aparece un código o mensaje de error, podés comenzar por buscar información del modelo y consultar su manual. Si no comprendés las indicaciones, podés pedir orientación.'
  if (answers.includes('No sé') || answers[0] === 'No') return 'Como hay información que todavía no está clara, podés pedir orientación y compartir lo que observaste antes de decidir si realizar alguna comprobación.'
  return 'Según la información que brindaste, podés comenzar por una comprobación básica que no requiera desarmar el equipo. Si no obtenés información suficiente, podés detenerte y elegir otra alternativa.'
}
