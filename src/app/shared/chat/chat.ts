import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppShell } from '../layouts/app-shell/app-shell';
import { AuthService } from '../../services/auth.service';
import { ChatConversation, ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShell],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  currentUser: any = null;
  users: any[] = [];

  conversations: ChatConversation[] = [];
  selectedConversation: ChatConversation | null = null;
  messages: ChatMessage[] = [];

  newMessage = '';

  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.users = JSON.parse(localStorage.getItem('smarttask_users') || '[]');

    if (!this.currentUser) return;

    this.conversations = this.chatService.getUserConversations(this.currentUser.id);

    if (this.conversations.length > 0) {
      this.selectConversation(this.conversations[0]);
    }
  }

  selectConversation(conversation: ChatConversation): void {
    this.selectedConversation = conversation;
    this.messages = this.chatService.getConversationMessages(conversation.id);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser) return;

    this.chatService.sendMessage(
      this.selectedConversation.id,
      this.currentUser.id,
      this.newMessage
    );

    this.newMessage = '';
    this.messages = this.chatService.getConversationMessages(this.selectedConversation.id);
  }

  getOtherUserName(conversation: ChatConversation): string {
    const otherId = conversation.participants.find(id => id !== this.currentUser?.id);
    const user = this.users.find(u => u.id === otherId);
    return user?.fullName || 'User';
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }
}