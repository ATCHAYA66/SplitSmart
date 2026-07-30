package com.splitwise.controller;

import com.splitwise.dto.request.CreateGroupRequest;
import com.splitwise.dto.request.JoinGroupRequest;
import com.splitwise.dto.response.ApiResponse;
import com.splitwise.dto.response.GroupResponse;
import com.splitwise.dto.response.UserResponse;
import com.splitwise.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(@Valid @RequestBody CreateGroupRequest request,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        GroupResponse group = groupService.createGroup(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Group created successfully", group));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<GroupResponse>> joinGroup(@Valid @RequestBody JoinGroupRequest request,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        GroupResponse group = groupService.joinGroup(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Joined group successfully", group));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getUserGroups(@AuthenticationPrincipal UserDetails userDetails) {
        List<GroupResponse> groups = groupService.getUserGroups(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User groups retrieved", groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroupById(@PathVariable("id") Long groupId,
                                                                   @AuthenticationPrincipal UserDetails userDetails) {
        GroupResponse group = groupService.getGroupById(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Group details retrieved", group));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getGroupMembers(@PathVariable("id") Long groupId,
                                                                           @AuthenticationPrincipal UserDetails userDetails) {
        List<UserResponse> members = groupService.getGroupMembers(groupId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Group members retrieved", members));
    }
}
