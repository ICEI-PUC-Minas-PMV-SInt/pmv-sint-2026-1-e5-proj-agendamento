// Validações compartilhadas entre telas. Sempre retornam um objeto:
//   { ok: true } quando válido
//   { ok: false, errors: { campo: 'mensagem' } } quando inválido
//
// O backend continua sendo a verdade — estes validators reduzem round-trip e
// padronizam a mensagem de erro inline na UI.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_BR_REGEX = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;

export function validateCliente({ nome, email, telefone, dataNascimento }) {
  const errors = {};

  if (!nome || nome.trim().length < 3) {
    errors.nome = 'Nome deve ter pelo menos 3 caracteres.';
  }

  if (email) {
    if (!EMAIL_REGEX.test(email) || email.length < 8) {
      errors.email = 'E-mail inválido (mínimo 8 caracteres).';
    }
  }

  if (telefone) {
    const onlyDigits = telefone.replace(/\D/g, '');
    if (onlyDigits.length > 0 && onlyDigits.length < 10) {
      errors.telefone = 'Telefone deve ter pelo menos 10 dígitos.';
    }
  }

  if (dataNascimento) {
    if (!DATE_ISO_REGEX.test(dataNascimento)) {
      errors.dataNascimento = 'Use o formato AAAA-MM-DD.';
    } else {
      const d = new Date(`${dataNascimento}T00:00:00`);
      if (Number.isNaN(d.getTime())) {
        errors.dataNascimento = 'Data inválida.';
      } else if (d > new Date()) {
        errors.dataNascimento = 'Data de nascimento não pode estar no futuro.';
      }
    }
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

// Aceita "DD/MM/AAAA HH:MM" e converte para Date. Retorna null se inválido.
function parseAgendamentoDate(value) {
  if (!DATE_TIME_BR_REGEX.test(value)) return null;
  const [datePart, timePart] = value.split(' ');
  const [d, m, y] = datePart.split('/').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (
    dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d ||
    dt.getHours() !== hh || dt.getMinutes() !== mm
  ) return null;
  return dt;
}

export function validateAgendamento({
  cliente,
  servico,
  dataHora,
  expedienteInicio = 8,    // 08:00
  expedienteFim = 20,      // 20:00 (não inclui)
  horariosOcupados = [],   // array de Date com agendamentos existentes do dia
}) {
  const errors = {};

  if (!cliente) errors.cliente = 'Selecione uma cliente.';
  if (!servico) errors.servico = 'Selecione um serviço.';

  const dt = parseAgendamentoDate(dataHora);
  if (!dataHora) {
    errors.dataHora = 'Informe data e hora.';
  } else if (!dt) {
    errors.dataHora = 'Use o formato DD/MM/AAAA HH:MM.';
  } else {
    if (dt.getTime() < Date.now()) {
      errors.dataHora = 'Não é possível agendar no passado.';
    } else if (dt.getHours() < expedienteInicio || dt.getHours() >= expedienteFim) {
      errors.dataHora = `Fora do expediente (${String(expedienteInicio).padStart(2, '0')}:00–${String(expedienteFim).padStart(2, '0')}:00).`;
    } else if (horariosOcupados.some((o) => new Date(o).getTime() === dt.getTime())) {
      errors.dataHora = 'Já existe um agendamento neste horário.';
    }
  }

  return Object.keys(errors).length === 0
    ? { ok: true, parsedDate: dt }
    : { ok: false, errors, parsedDate: dt };
}

export const _internals = { parseAgendamentoDate };
