import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { ChatMessageResponse } from '../../models/chat-message-response';
import { MessageItem } from '../message-item/message-item';

import { UserService } from '../../../user/services/user.service';
import { UserModel } from '../../../user/models/user.model';
import { DisplayableMessage } from '../../../group/models/displayable-message.model';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [FormsModule, MessageItem],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.css',
})
export class ChatBox implements OnInit, OnDestroy {

  private readonly chatService = inject(ChatService);

  private readonly userService = inject(UserService);


  messages = signal<ChatMessageResponse[]>([]);

  onlineUsers = signal<UserModel[]>([]);

  selectedRecipient = signal<UserModel | null>(null);

  replyingTo = signal<DisplayableMessage | null>(null);


  isTyping = signal(false);


  content = '';

  user!: UserModel | null;


  private subscriptions = new Subscription();



  visibleMessages = computed(() => {

    const recipient = this.selectedRecipient();

    const me = this.user?.id ?? 0;


    if (!recipient) {
      return [];
    }


    return this.messages().filter(
      (m) =>
        (m.userId === me && m.recipientId === recipient.id) ||
        (m.userId === recipient.id && m.recipientId === me)
    );

  });





  ngOnInit(): void {


    this.user = this.userService.get();


    if (!this.user) {
      return;
    }



    this.chatService.connect();



    this.chatService.history()
      .subscribe(data => {

        this.messages.set(data);

      });





    this.subscriptions.add(

      this.chatService.messages()
      .subscribe(message => {

        this.messages.update(
          current => [...current, message]
        );

      })

    );





    // ESCUCHAR ESCRIBIENDO

    this.subscriptions.add(

      this.chatService.typing()
      .subscribe(event => {


        const recipient = this.selectedRecipient();


        if (
          recipient &&
          event.senderId === recipient.id &&
          event.receiverId === this.user?.id
        ) {

          this.isTyping.set(event.typing);

        }


      })

    );






    this.subscriptions.add(

      this.chatService.errors()
      .subscribe(error => {

        console.error(error);

      })

    );






    this.userService.online()
    .subscribe(users => {

      this.onlineUsers.set(
        users.filter(
          u => u.id !== this.user?.id
        )
      );

    });



  }







  selectRecipient(recipient: UserModel): void {

    this.selectedRecipient.set(recipient);

    this.replyingTo.set(null);

  }






  sendTyping(): void {


    const recipient = this.selectedRecipient();


    if (!this.user || !recipient) {
      return;
    }



    this.chatService.sendTyping({

      senderId: this.user.id,

      receiverId: recipient.id,

      typing: true

    });


  }








  startReply(message: DisplayableMessage): void {

    this.replyingTo.set(message);

  }




  cancelReply(): void {

    this.replyingTo.set(null);

  }







  send(): void {


    if (!this.content.trim()) {
      return;
    }



    const recipient = this.selectedRecipient();



    if (!this.user || !recipient) {
      return;
    }





    this.chatService.send({

      userId: this.user.id,

      recipientId: recipient.id,

      content: this.content,

      replyToId: this.replyingTo()?.id

    });




    this.content = '';

    this.replyingTo.set(null);



    this.chatService.sendTyping({

      senderId: this.user.id,

      receiverId: recipient.id,

      typing:false

    });


  }







  ngOnDestroy(): void {

    this.subscriptions.unsubscribe();

  }


}