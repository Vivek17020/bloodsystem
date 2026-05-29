import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

interface BotRule {
  keywords: string[];
  response: string;
  options?: string[];
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  animations: [
    trigger('slideUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [animate('200ms ease-out')]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [];
  unreadCount = 0;
  private msgIdCounter = 0;
  private shouldScrollToBottom = false;

  private readonly BOT_RULES: BotRule[] = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      response: 'Hello! Welcome to the Blood Management System. How can I help you today?',
      options: ['Blood donation info', 'Check eligibility', 'Find blood bank', 'Emergency request'],
    },
    {
      keywords: ['donate', 'donation', 'give blood'],
      response: 'Blood donation saves lives! To donate:\n• You must be 18–65 years old\n• Weigh at least 50 kg\n• Be in good health\n• Wait 56 days (8 weeks) between donations\n\nWould you like to schedule a donation appointment?',
      options: ['Schedule appointment', 'Check my eligibility', 'Find a blood bank'],
    },
    {
      keywords: ['eligible', 'eligibility', 'can i donate', 'qualify'],
      response: 'To be eligible to donate blood, you generally need to:\n✅ Be 18–65 years old\n✅ Weigh at least 50 kg (110 lbs)\n✅ Have hemoglobin ≥ 12.5 g/dL\n✅ No tattoos/piercings in the last 6 months\n✅ Not have donated in the last 56 days\n\nLog in to check your personal eligibility status.',
      options: ['Schedule appointment', 'View my profile'],
    },
    {
      keywords: ['blood type', 'blood group', 'a+', 'b+', 'o+', 'ab+', 'a-', 'b-', 'o-', 'ab-'],
      response: 'Blood types and compatibility:\n\n🩸 O- is the universal donor (anyone can receive)\n🩸 AB+ is the universal recipient\n🩸 O+ is most common (38% of people)\n🩸 AB- is the rarest (1% of people)\n\nWhat blood type would you like to know more about?',
      options: ['O- donors needed', 'Find rare blood types', 'Blood type compatibility'],
    },
    {
      keywords: ['emergency', 'urgent', 'critical', 'need blood now'],
      response: '🚨 For EMERGENCIES:\n\n1. Go to Emergency Requests page immediately\n2. Submit a CRITICAL request with your blood type\n3. Our team will be notified instantly\n4. Contact the nearest blood bank directly\n\nFor life-threatening emergencies, call 108 (India) or your local emergency number.',
      options: ['Go to Emergency Requests', 'Find nearest blood bank'],
    },
    {
      keywords: ['appointment', 'schedule', 'book'],
      response: 'You can schedule a donation appointment easily:\n\n1. Go to the Appointments page\n2. Choose a blood bank near you\n3. Pick a date and time\n4. Confirm your booking\n\nYou\'ll receive a confirmation notification.',
      options: ['Go to Appointments', 'Find blood banks'],
    },
    {
      keywords: ['blood bank', 'bank', 'center', 'find'],
      response: 'To find blood banks in your area:\n\n• Use the Inventory page to see available blood by bank\n• Contact our registered blood banks directly\n• Blood banks are active 7 days a week\n\nNeed help finding a specific blood type?',
      options: ['View Inventory', 'Check blood availability'],
    },
    {
      keywords: ['inventory', 'stock', 'available', 'units'],
      response: 'Current blood inventory is visible on the Inventory page. You can filter by:\n\n• Blood type (A+, B+, O-, etc.)\n• Blood bank location\n• Availability status\n\nAdmins and blood bank staff can add and manage inventory.',
      options: ['View Inventory'],
    },
    {
      keywords: ['payment', 'razorpay', 'pay', 'donate money', 'fund'],
      response: 'You can make financial donations to support blood drives and equipment:\n\n💳 We accept payments via Razorpay\n✅ UPI, Credit/Debit Cards, Net Banking supported\n🔒 Payments are 100% secure\n\nGo to the Donations page to contribute.',
      options: ['Go to Donations page'],
    },
    {
      keywords: ['login', 'log in', 'sign in', 'access'],
      response: 'To access the full system features, you need to log in.\n\nWe use JWT-based secure authentication — your session token is stored safely and expires automatically for security.',
      options: ['Go to Login'],
    },
    {
      keywords: ['register', 'sign up', 'create account', 'new user'],
      response: 'Creating an account is free! Choose your role:\n\n👤 Donor — track donations & schedule appointments\n🏥 Hospital — submit blood requests\n🏦 Blood Bank — manage inventory\n\nGo to the Register page to get started.',
      options: ['Go to Register'],
    },
    {
      keywords: ['jwt', 'token', 'session', 'auth', 'security'],
      response: 'This system uses JWT (JSON Web Token) for secure session management:\n\n🔐 Tokens are signed with HS256\n⏱️ Tokens expire after 24 hours\n🚫 No server-side sessions (stateless)\n🔒 All API calls require a valid Bearer token\n\nYour token is stored securely in localStorage.',
      options: ['How login works'],
    },
    {
      keywords: ['help', 'support', 'what can you do', 'features'],
      response: 'I can help you with:\n\n• 🩸 Blood donation information\n• ✅ Eligibility checks\n• 📅 Scheduling appointments\n• 🚨 Emergency requests\n• 🏦 Finding blood banks\n• 💳 Payment/donation info\n• 🔐 Account and security questions\n\nJust type your question!',
      options: ['Donation info', 'Emergency help', 'Payment info', 'Account help'],
    },
    {
      keywords: ['thank', 'thanks', 'bye', 'goodbye'],
      response: 'You\'re welcome! Thank you for supporting blood donation. Every donation saves up to 3 lives. 🩸❤️\n\nFeel free to ask anything else anytime!',
      options: ['Ask another question'],
    },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.addBotMessage(
      `Hi there! 👋 I'm your Blood Management assistant. How can I help you today?`,
      ['Blood donation info', 'Emergency request', 'Find blood bank', 'Payment info']
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;
    this.addUserMessage(text);
    this.userInput = '';
    this.generateBotResponse(text);
  }

  sendOption(option: string): void {
    this.addUserMessage(option);
    this.generateBotResponse(option);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private generateBotResponse(input: string): void {
    this.isTyping = true;
    const lowerInput = input.toLowerCase();

    setTimeout(() => {
      this.isTyping = false;
      const rule = this.BOT_RULES.find((r) =>
        r.keywords.some((kw) => lowerInput.includes(kw))
      );
      if (rule) {
        this.addBotMessage(rule.response, rule.options);
      } else {
        this.addBotMessage(
          "I'm not sure about that, but I'm here to help! Try asking about blood donation, eligibility, appointments, emergency requests, or payments.",
          ['Blood donation', 'Eligibility check', 'Appointments', 'Emergency help']
        );
      }
    }, 800 + Math.random() * 600);
  }

  private addUserMessage(text: string): void {
    this.messages.push({ id: ++this.msgIdCounter, text, sender: 'user', timestamp: new Date() });
    this.shouldScrollToBottom = true;
  }

  private addBotMessage(text: string, options?: string[]): void {
    this.messages.push({ id: ++this.msgIdCounter, text, sender: 'bot', timestamp: new Date(), options });
    this.shouldScrollToBottom = true;
    if (!this.isOpen) this.unreadCount++;
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}
