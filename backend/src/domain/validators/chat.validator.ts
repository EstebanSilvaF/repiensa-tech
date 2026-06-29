import { Chat } from '../types/chat.types';
import { Product } from '../types/product.types';
import { assertValid, ValidationRule } from '../../shared/validation/validator';
import { chatExistsRule, chatParticipantRule } from './shared/chat.rules';
import { notOwnProductRule, productExistsRule } from './shared/product.rules';

interface ChatAccessContext {
  chat: Chat | null;
  userId: string;
}

const chatAccessRules: ValidationRule<ChatAccessContext>[] = [
  chatExistsRule(),
  chatParticipantRule((ctx) => ctx.userId),
];

const openChatProductRules: ValidationRule<{ product: Product | null; buyerId: string }>[] = [
  productExistsRule(),
  {
    test: ({ product }) => product!.status !== 'sold',
    message: 'Este producto ya fue vendido',
  },
  notOwnProductRule('No puedes abrir un chat sobre tu propio producto'),
];

const sendMessageRules: ValidationRule<{ chat: Chat | null; senderId: string }>[] = [
  chatExistsRule(),
  chatParticipantRule((ctx) => ctx.senderId),
  {
    test: ({ chat }) => chat!.status !== 'delivery_confirmed',
    message: 'Este chat ya fue cerrado con entrega confirmada',
  },
];

const confirmDeliveryRules: ValidationRule<ChatAccessContext>[] = [
  ...chatAccessRules,
  {
    test: ({ chat }) => chat!.status !== 'delivery_confirmed',
    message: 'La entrega ya fue confirmada',
  },
];

export function assertChatAccess(
  chat: Chat | null,
  userId: string
): asserts chat is Chat {
  assertValid({ chat, userId }, chatAccessRules);
}

export function validateOpenChat(
  product: Product | null,
  buyerId: string
): asserts product is Product {
  assertValid({ product, buyerId }, openChatProductRules);
}

export function validateMessageContent(content: string): void {
  if (!content?.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }
}

export function validateAppointmentPayload(appointment: {
  day?: string;
  time?: string;
  location?: string;
}): void {
  if (!appointment.day?.trim() || !appointment.time?.trim() || !appointment.location?.trim()) {
    throw new Error('Día, hora y lugar son requeridos para el encuentro');
  }
}

export function formatProposalContent(appointment: {
  day: string;
  time: string;
  location: string;
}): string {
  return `Propuesta de encuentro · ${appointment.day.trim()} · ${appointment.time.trim()} · ${appointment.location.trim()}`;
}

export function formatAcceptedContent(appointment: {
  day: string;
  time: string;
  location: string;
}): string {
  return `Encuentro acordado · ${appointment.day.trim()} · ${appointment.time.trim()} · ${appointment.location.trim()}`;
}

export function formatRejectedContent(appointment: {
  day: string;
  time: string;
  location: string;
}): string {
  return `Propuesta rechazada · ${appointment.day.trim()} · ${appointment.time.trim()} · ${appointment.location.trim()}`;
}

/** @deprecated Usar formatProposalContent, formatAcceptedContent o formatRejectedContent */
export function formatAppointmentContent(appointment: {
  day: string;
  time: string;
  location: string;
}): string {
  return formatAcceptedContent(appointment);
}

export function validateSendMessage(
  chat: Chat | null,
  senderId: string
): asserts chat is Chat {
  assertValid({ chat, senderId }, sendMessageRules);
}

export function validateConfirmDelivery(
  chat: Chat | null,
  userId: string
): asserts chat is Chat {
  assertValid({ chat, userId }, confirmDeliveryRules);
}
