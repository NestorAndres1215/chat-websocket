package com.example.chat.user.service;

import com.example.chat.exception.ResourceNotFoundException;
import com.example.chat.user.dto.UserRequest;
import com.example.chat.user.dto.UserResponse;
import com.example.chat.user.entity.UserEntity;
import com.example.chat.user.mapper.UserMapper;
import com.example.chat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    @Override
    public UserResponse save(UserRequest request) {

        UserEntity entity = mapper.toEntity(request);

        entity.setConnected(true);

        repository.save(entity);

        return mapper.toResponse(entity);

    }

    @Override
    public UserResponse findById(Long id) {

        UserEntity entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado"));

        return mapper.toResponse(entity);

    }

    @Override
    public List<UserResponse> findAll() {

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    @Override

    public UserResponse findByUsername(String username) {

        UserEntity entity = repository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado."));

        return mapper.toResponse(entity);

    }
    @Override

    public List<UserResponse> search(String username) {

        return repository.findByUsernameContainingIgnoreCase(username)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }
}