package com.example.chat.message.controller;


import com.example.chat.message.dto.UploadResponse;
import com.example.chat.message.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> upload(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.store(file);
        return ResponseEntity.ok(new UploadResponse(fileUrl, file.getOriginalFilename(), file.getSize()));
    }
}