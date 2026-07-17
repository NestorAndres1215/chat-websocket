package com.example.chat.group.repository;

import com.example.chat.group.entity.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<GroupEntity, Long> {

    @Query("""
        SELECT g FROM GroupEntity g
        JOIN g.members m
        WHERE m.id = :userId
        ORDER BY g.createdAt DESC
        """)
    List<GroupEntity> findAllByMemberId(@Param("userId") Long userId);

}