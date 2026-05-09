import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ChatConversation {
  id: number;
  taskId: number;
  taskTitle: string;
  workerId: number;
  ownerId: number;
  participants: number[];
  createdAt: string;
  task?: any;
  owner?: any;
  worker?: any;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  text: string;
  createdAt: string;
  sender?: any;
}

interface ConversationResponse {
  success: boolean;
  message?: string;
  conversation: any;
}

interface ConversationsResponse {
  success: boolean;
  conversations: any[];
}

interface MessagesResponse {
  success: boolean;
  messages: any[];
}

interface MessageResponse {
  success: boolean;
  message?: string;
  chatMessage: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'smarttask_token';

  constructor(private http: HttpClient) {}

  createConversation(
    taskId: number,
    taskTitle: string,
    workerId: number,
    ownerId: number
  ): Observable<ConversationResponse> {
    return this.http.post<ConversationResponse>(
      `${this.apiUrl}/chat/conversations`,
      {
        taskId,
        workerId
      },
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map((response) => ({
        ...response,
        conversation: this.formatConversation(response.conversation)
      }))
    );
  }

  getUserConversations(userId?: number): Observable<ConversationsResponse> {
    return this.http.get<ConversationsResponse>(
      `${this.apiUrl}/chat/conversations`,
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map((response) => ({
        ...response,
        conversations: (response.conversations || []).map((conversation) =>
          this.formatConversation(conversation)
        )
      }))
    );
  }

  getConversationMessages(conversationId: number): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map((response) => ({
        ...response,
        messages: (response.messages || []).map((message) =>
          this.formatMessage(message)
        )
      }))
    );
  }

  sendMessage(
    conversationId: number,
    senderId: number,
    text: string
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.apiUrl}/chat/conversations/${conversationId}/messages`,
      {
        message: text
      },
      {
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map((response) => ({
        ...response,
        chatMessage: this.formatMessage(response.chatMessage)
      }))
    );
  }

  private formatConversation(conversation: any): ChatConversation {
    return {
      id: conversation.id,
      taskId: conversation.taskId,
      taskTitle: conversation.task?.title || conversation.taskTitle || `Task #${conversation.taskId}`,
      workerId: conversation.workerId,
      ownerId: conversation.ownerId,
      participants: [conversation.workerId, conversation.ownerId],
      createdAt: conversation.createdAt,
      task: conversation.task,
      owner: conversation.owner,
      worker: conversation.worker,
      lastMessage: conversation.lastMessage || null,
      lastMessageAt: conversation.lastMessageAt || null
    };
  }

  private formatMessage(message: any): ChatMessage {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      text: message.text || message.message || '',
      createdAt: message.createdAt,
      sender: message.sender
    };
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
