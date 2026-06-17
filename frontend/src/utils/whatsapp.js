import { Linking, Platform, Alert } from 'react-native';

// Normaliza um telefone brasileiro para o formato internacional usado pelo
// link wa.me (somente dígitos, com DDI 55). Aceita números já formatados
// como "(11) 9 9999 9999". Retorna null se não houver dígitos suficientes.
export function normalizePhoneBR(raw) {
  let d = (raw || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!d) return null;
  // Já vem com DDI 55 (12 = fixo, 13 = celular)
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) return d;
  // Número local com DDD (10 = fixo, 11 = celular) -> adiciona o DDI 55
  if (d.length === 10 || d.length === 11) return '55' + d;
  return d.length >= 12 ? d : null;
}

function alertMsg(msg) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert('WhatsApp', msg);
}

// Abre uma conversa no WhatsApp com a cliente, opcionalmente com uma mensagem
// pré-preenchida. Usa o link https://wa.me, que abre o app se instalado ou o
// WhatsApp Web no navegador — sem necessidade de API oficial nem custo.
export async function openWhatsApp(phone, message = '') {
  const num = normalizePhoneBR(phone);
  if (!num) {
    alertMsg('Esta cliente não possui um telefone válido para o WhatsApp.');
    return;
  }
  const url = `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  try {
    await Linking.openURL(url);
  } catch (e) {
    alertMsg('Não foi possível abrir o WhatsApp neste dispositivo.');
  }
}
