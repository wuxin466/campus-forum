package com.campus.forum.dto.activity;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateActivityRequest(
        @NotNull Long categoryId,
        @NotBlank @Size(max = 120) String title,
        @Size(max = 500) String posterUrl,
        @NotBlank String content,
        @NotBlank @Size(max = 200) String location,
        @NotNull @Future LocalDateTime startAt,
        @NotNull @Future LocalDateTime endAt,
        @NotNull @Future LocalDateTime signupDeadline,
        @NotNull @Min(1) Integer capacity) {}
