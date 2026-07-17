package com.example.chat.group.service;

import com.example.chat.exception.ResourceNotFoundException;
import com.example.chat.group.dto.*;
import com.example.chat.group.entity.GroupEntity;
import com.example.chat.group.entity.GroupMessageEntity;
import com.example.chat.group.mapper.GroupMapper;
import com.example.chat.group.repository.GroupMessageRepository;
import com.example.chat.group.repository.GroupRepository;
import com.example.chat.user.entity.UserEntity;
import com.example.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    private final GroupMessageRepository groupMessageRepository;

    private final UserRepository userRepository;

    private final GroupMapper mapper;

    @Override
    @Transactional
    public GroupResponse create(GroupCreateRequest request) {

        UserEntity creator = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario creador no encontrado."));

        Set<UserEntity> members = request.getMemberIds().stream()
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Miembro con id " + id + " no encontrado.")))
                .collect(Collectors.toSet());

        members.add(creator); // el creador siempre es miembro

        GroupEntity group = GroupEntity.builder()
                .name(request.getName())
                .createdAt(LocalDateTime.now())
                .createdBy(creator)
                .members(members)
                .build();

        group = groupRepository.save(group);

        return mapper.toResponse(group);

    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupResponse> findByUser(Long userId) {

        return groupRepository.findAllByMemberId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    @Override
    @Transactional
    public GroupMessageResponse send(GroupMessageRequest request) {

        GroupEntity group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Grupo no encontrado."));

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado."));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getId().equals(user.getId()));

        if (!isMember) {
            throw new ResourceNotFoundException("El usuario no pertenece a este grupo.");
        }

        GroupMessageEntity replyTo = null;

        if (request.getReplyToId() != null) {
            replyTo = groupMessageRepository.findById(request.getReplyToId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Mensaje al que respondes no encontrado."));
        }

        GroupMessageEntity entity = GroupMessageEntity.builder()
                .content(request.getContent())
                .sentAt(LocalDateTime.now())
                .group(group)
                .user(user)
                .replyTo(replyTo)
                .build();

        entity = groupMessageRepository.save(entity);

        return mapper.toMessageResponse(entity);

    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupMessageResponse> history(Long groupId) {

        return groupMessageRepository.findByGroupIdOrderBySentAtAsc(groupId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();

    }

}