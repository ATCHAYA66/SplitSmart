package com.splitwise.service;

import com.splitwise.dto.request.CreateGroupRequest;
import com.splitwise.dto.request.JoinGroupRequest;
import com.splitwise.dto.response.GroupResponse;
import com.splitwise.dto.response.UserResponse;
import com.splitwise.entity.Group;
import com.splitwise.entity.GroupMember;
import com.splitwise.entity.User;
import com.splitwise.exception.BadRequestException;
import com.splitwise.exception.ResourceNotFoundException;
import com.splitwise.repository.GroupMemberRepository;
import com.splitwise.repository.GroupRepository;
import com.splitwise.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public GroupService(GroupRepository groupRepository,
                        GroupMemberRepository groupMemberRepository,
                        UserRepository userRepository,
                        AuthService authService) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String joinCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Group group = new Group(
                request.getName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                request.getCategory() != null ? request.getCategory().trim() : "General",
                joinCode,
                creator
        );

        Group savedGroup = groupRepository.save(group);

        // Add creator as member
        GroupMember member = new GroupMember(savedGroup, creator);
        groupMemberRepository.save(member);

        return mapToGroupResponse(savedGroup);
    }

    @Transactional
    public GroupResponse joinGroup(JoinGroupRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = groupRepository.findByJoinCode(request.getJoinCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid group join code. Group not found."));

        if (groupMemberRepository.existsByGroupIdAndUserId(group.getId(), user.getId())) {
            throw new BadRequestException("You are already a member of this group.");
        }

        GroupMember member = new GroupMember(group, user);
        groupMemberRepository.save(member);

        return mapToGroupResponse(group);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getUserGroups(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<GroupMember> memberships = groupMemberRepository.findAllGroupsByUserIdFetchGroup(user.getId());
        return memberships.stream()
                .map(gm -> mapToGroupResponse(gm.getGroup()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(Long groupId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        return mapToGroupResponse(group);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getGroupMembers(Long groupId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new BadRequestException("Access denied. You are not a member of this group.");
        }

        List<GroupMember> members = groupMemberRepository.findAllMembersByGroupIdFetchUser(groupId);
        return members.stream()
                .map(gm -> authService.mapToUserResponse(gm.getUser()))
                .collect(Collectors.toList());
    }

    public GroupResponse mapToGroupResponse(Group group) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCategory(),
                group.getJoinCode(),
                authService.mapToUserResponse(group.getCreatedBy()),
                members.size(),
                group.getCreatedAt()
        );
    }
}
