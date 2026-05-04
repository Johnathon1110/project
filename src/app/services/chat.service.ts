import { Injectable } from '@angular/core';

export interface ChatConversation {
  id: number;
  taskId: number;
  taskTitle: string;
  workerId: number;
  ownerId: number;
  participants: number[];
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private conversationsKey = 'smarttask_chat_conversations';
  private messagesKey = 'smarttask_chat_messages';

  private getConversations(): ChatConversation[] {
    return JSON.parse(localStorage.getItem(this.conversationsKey) || '[]');
  }

  private saveConversations(conversations: ChatConversation[]): void {
    localStorage.setItem(this.conversationsKey, JSON.stringify(conversations));
  }

  private getMessages(): ChatMessage[] {
    return JSON.parse(localStorage.getItem(this.messagesKey) || '[]');
  }

  private saveMessages(messages: ChatMessage[]): void {
    localStorage.setItem(this.messagesKey, JSON.stringify(messages));
  }

  createConversation(
    taskId: number,
    taskTitle: string,
    workerId: number,
    ownerId: number
  ): ChatConversation {
    const conversations = this.getConversations();

    const existingConversation = conversations.find(
      c => c.taskId === taskId && c.workerId === workerId && c.ownerId === ownerId
    );

    if (existingConversation) {
      return existingConversation;
    }

    const newConversation: ChatConversation = {
      id: Date.now(),
      taskId,
      taskTitle,
      workerId,
      ownerId,
      participants: [workerId, ownerId],
      createdAt: new Date().toISOString()
    };

    conversations.unshift(newConversation);
    this.saveConversations(conversations);

    return newConversation;
  }

  getUserConversations(userId: number): ChatConversation[] {
    return this.getConversations().filter(c => c.participants.includes(userId));
  }

  getConversationMessages(conversationId: number): ChatMessage[] {
    return this.getMessages().filter(m => m.conversationId === conversationId);
  }

  sendMessage(conversationId: number, senderId: number, text: string): void {
    const messages = this.getMessages();

    const newMessage: ChatMessage = {
      id: Date.now(),
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    this.saveMessages(messages);
  }
}