package com.wap.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Project title is required")
    private String title;

    private String description;
    private String priority;
    private LocalDate startDate;
    private LocalDate deadline;
    private int progress;
    private List<Long> assignedUserIds;

    @JsonAlias({"assignedMemberEmails", "members"})
    private List<String> assignedMemberEmails;

    private String assignedMembers;
}

