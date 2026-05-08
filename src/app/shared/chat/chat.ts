import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  conversations: ChatConversation[] = [];
  selectedConversation: ChatConversation | null = null;
  messages: ChatMessage[] = [];

  newMessage = '';

  isLoadingConversations = false;
  isLoadingMessages = false;
  isSending = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to view chats.';
      this.cdr.detectChanges();
      return;
    }

    this.loadConversations();
  }

  loadConversations(): void {
    this.isLoadingConversations = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.chatService.getUserConversations(this.currentUser.id).subscribe({
      next: (response) => {
        this.conversations = response.conversations || [];
        this.isLoadingConversations = false;

        if (this.conversations.length > 0 && !this.selectedConversation) {
          this.selectConversation(this.conversations[0]);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.conversations = [];
        this.isLoadingConversations = false;
        this.errorMessage = error.error?.message || 'Failed to load chats.';
        this.cdr.detectChanges();
      }
    });
  }

  selectConversation(conversation: ChatConversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: number): void {
    this.isLoadingMessages = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.chatService.getConversationMessages(conversationId).subscribe({
      next: (response) => {
        this.messages = response.messages || [];
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.messages = [];
        this.isLoadingMessages = false;
        this.errorMessage = error.error?.message || 'Failed to load messages.';
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage.trim();

    if (!text || !this.selectedConversation || !this.currentUser) {
      return;
    }

    this.isSending = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.chatService.sendMessage(
      this.selectedConversation.id,
      this.currentUser.id,
      text
    ).subscribe({
      next: (response) => {
        this.isSending = false;

        if (response.success) {
          this.newMessage = '';
          this.loadMessages(this.selectedConversation!.id);
          this.loadConversations();
        } else {
          this.errorMessage = response.message || 'Failed to send message.';
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = error.error?.message || 'Failed to send message.';
        this.cdr.detectChanges();
      }
    });
  }

  getOtherUserName(conversation: ChatConversation): string {
    if (!this.currentUser) return 'User';

    if (this.currentUser.id === conversation.ownerId) {
      return conversation.worker?.fullName || `Worker #${conversation.workerId}`;
    }

    return conversation.owner?.fullName || `Owner #${conversation.ownerId}`;
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }
}
