package com.example.chat.group.controller;

import com.example.chat.group.dto.GroupMessageRequest;
import com.example.chat.group.dto.GroupMessageResponse;
import com.example.chat.group.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupService groupService;

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/group.chat")
    public void send(GroupMessageRequest request) {
try {
System.out.println("MENSAJE "+request);
    GroupMessageResponse response = groupService.send(request);

    messagingTemplate.convertAndSend(
            "/topic/group." + response.getGroupId(),
            response
    );
} catch (MessagingException e) {
    e.printStackTrace();
}
    }

}