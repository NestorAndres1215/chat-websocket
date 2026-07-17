package com.example.chat.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;

import java.security.Principal;

public class UserChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            Object userId = accessor.getSessionAttributes() != null
                    ? accessor.getSessionAttributes().get("userId")
                    : null;

            if (userId != null) {

                String userIdStr = userId.toString();

                accessor.setUser((Principal) () -> userIdStr);

            }

        }

        return message;

    }

}