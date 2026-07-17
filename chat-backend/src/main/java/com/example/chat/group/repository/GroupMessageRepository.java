package com.example.chat.group.repository;

import com.example.chat.group.entity.GroupMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMessageRepository extends JpaRepository<GroupMessageEntity, Long> {

    List<GroupMessageEntity> findByGroupIdOrderBySentAtAsc(Long groupId);

}