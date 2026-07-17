package com.example.chat.user.controller;

import com.example.chat.user.dto.UserRequest;
import com.example.chat.user.dto.UserResponse;
import com.example.chat.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping
    public UserResponse create(@RequestBody UserRequest request) {

        return service.save(request);

    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable Long id) {

        return service.findById(id);

    }

    @GetMapping
    public List<UserResponse> findAll() {

        return service.findAll();

    }
    @GetMapping("/search")
    public List<UserResponse> search(@RequestParam String username) {

        return service.search(username);

    }
}