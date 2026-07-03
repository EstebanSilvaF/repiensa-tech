import { Product } from '../../domain/types/product.types';
import { Chat, Message } from '../../domain/types/chat.types';
import { TransactionWithDetails } from '../../infrastructure/persistence/repositories/transaction.repository';
import { userRepository } from '../../infrastructure/persistence/repositories/user.repository';
import { universityRepository } from '../../infrastructure/persistence/repositories/university.repository';

async function loadUsersMap(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const users = await userRepository.findByIds(uniqueIds);
  return new Map(users.map((user) => [user.id, user]));
}

async function loadUniversitiesMap(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const universities = await Promise.all(
    uniqueIds.map((id) => universityRepository.findById(id)),
  );
  return new Map(
    universities
      .filter((university) => university !== null)
      .map((university) => [university!.id, university!]),
  );
}

export async function enrichProductsWithSeller(
  products: Product[],
  options?: { includeEmail?: boolean },
): Promise<Product[]> {
  if (products.length === 0) return products;

  const usersMap = await loadUsersMap(products.map((product) => product.seller_id));

  return products.map((product) => {
    const seller = usersMap.get(product.seller_id);
    const enriched = { ...product } as Product & {
      seller_name?: string;
      seller_email?: string;
    };
    if (seller) {
      enriched.seller_name = seller.full_name;
      if (options?.includeEmail) {
        enriched.seller_email = seller.email;
      }
    }
    return enriched;
  });
}

type ChatWithParticipants = Chat & {
  buyer_name?: string;
  seller_name?: string;
  buyer_university_name?: string;
  seller_university_name?: string;
  product_name?: string;
  product_price?: number;
  product_image?: string;
  last_message?: string;
  last_message_at?: Date;
};

export async function enrichChatsWithParticipants(
  chats: ChatWithParticipants[],
): Promise<ChatWithParticipants[]> {
  if (chats.length === 0) return chats;

  const userIds = chats.flatMap((chat) => [chat.buyer_id, chat.seller_id]);
  const usersMap = await loadUsersMap(userIds);
  const universityIds = [...usersMap.values()].map((user) => user.university_id);
  const universitiesMap = await loadUniversitiesMap(universityIds);

  return chats.map((chat) => {
    const buyer = usersMap.get(chat.buyer_id);
    const seller = usersMap.get(chat.seller_id);
    const enriched = { ...chat };

    if (buyer) {
      enriched.buyer_name = buyer.full_name;
      const university = universitiesMap.get(buyer.university_id);
      if (university) enriched.buyer_university_name = university.name;
    }
    if (seller) {
      enriched.seller_name = seller.full_name;
      const university = universitiesMap.get(seller.university_id);
      if (university) enriched.seller_university_name = university.name;
    }

    return enriched;
  });
}

export async function enrichMessagesWithSender(
  messages: Message[],
): Promise<(Message & { sender_name?: string })[]> {
  if (messages.length === 0) return messages;

  const usersMap = await loadUsersMap(messages.map((message) => message.sender_id));

  return messages.map((message) => {
    const sender = usersMap.get(message.sender_id);
    return sender
      ? { ...message, sender_name: sender.full_name }
      : { ...message };
  });
}

export async function enrichTransactionsWithParties(
  transactions: TransactionWithDetails[],
): Promise<TransactionWithDetails[]> {
  if (transactions.length === 0) return transactions;

  const userIds = transactions.flatMap((tx) => [tx.buyer_id, tx.seller_id]);
  const usersMap = await loadUsersMap(userIds);

  return transactions.map((tx) => {
    const buyer = usersMap.get(tx.buyer_id);
    const seller = usersMap.get(tx.seller_id);
    return {
      ...tx,
      buyer_name: buyer?.full_name ?? tx.buyer_name,
      seller_name: seller?.full_name ?? tx.seller_name,
    };
  });
}
